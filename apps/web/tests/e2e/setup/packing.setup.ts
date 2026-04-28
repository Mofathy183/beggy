import { test as setup, expect } from '@playwright/test';
import { STORAGE_STATE_PATH } from '../fixtures/auth.fixture';
import * as fs from 'fs';
import * as path from 'path';
import {
	BagType,
	ItemCategory,
	Size,
	VolumeUnit,
	WeightUnit,
} from '@beggy/shared';
import { PACKING_SEED_PATH, PackingSeed } from '../fixtures/packing.fixture';

// ── Constants ─────────────────────────────────────────────────────────────────

const API_BASE =
	process.env.E2E_API_BASE_URL ?? 'http://localhost:4000/api/beggy';

// ── Auth helpers (reuse existing session) ─────────────────────────────────────

async function getAuthHeaders(): Promise<HeadersInit> {
	// Read the session cookies saved by auth.setup.ts
	if (!fs.existsSync(STORAGE_STATE_PATH)) {
		throw new Error(
			`Auth storage state not found at ${STORAGE_STATE_PATH}. ` +
				`Run the auth setup project first.`
		);
	}

	const state = JSON.parse(fs.readFileSync(STORAGE_STATE_PATH, 'utf-8'));

	// Grab CSRF token from cookies
	const cookies: Array<{ name: string; value: string }> = state.cookies ?? [];
	const xsrf = cookies.find((c) => c.name === 'XSRF-TOKEN');
	const csrfToken = xsrf ? decodeURIComponent(xsrf.value) : '';

	const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join('; ');

	return {
		'Content-Type': 'application/json',
		'X-XSRF-TOKEN': csrfToken,
		Cookie: cookieHeader,
	};
}

// ── API helpers ───────────────────────────────────────────────────────────────

async function createBag(
	headers: HeadersInit,
	payload: {
		name: string;
		type: BagType;
		maxWeight?: number;
		maxCapacity?: number;
	}
): Promise<string> {
	const res = await fetch(`${API_BASE}/bags`, {
		method: 'POST',
		headers,
		body: JSON.stringify({
			name: payload.name,
			type: payload.type ?? BagType.BACKPACK,
			size: Size.MEDIUM,
			maxWeight: payload.maxWeight ?? 10,
			maxCapacity: payload.maxCapacity ?? 20,
		}),
	});

	if (!res.ok) {
		const body = await res.json().catch(() => null);
		throw new Error(
			`Failed to create bag "${payload.name}" (${res.status}):\n${JSON.stringify(body)}`
		);
	}

	const data = await res.json();

	const containerId: string =
		data?.bag?.containerId ?? data?.containerId ?? data?.data?.containerId;

	if (!containerId) {
		throw new Error(
			`Bag creation response missing containerId:\n${JSON.stringify(data)}`
		);
	}

	return containerId;
}

async function createItem(
	headers: HeadersInit,
	payload: {
		name: string;
		weight?: number;
		volume?: number;
	}
): Promise<string> {
	const res = await fetch(`${API_BASE}/items`, {
		method: 'POST',
		headers,
		body: JSON.stringify({
			name: payload.name,

			// REQUIRED ENUMS (must be valid)
			category: ItemCategory.CLOTHING, // or ELECTRONICS etc.
			weight: payload.weight ?? 0.5,
			weightUnit: WeightUnit.KILOGRAM, // IMPORTANT
			volume: payload.volume ?? 1,
			volumeUnit: VolumeUnit.LITER, // IMPORTANT

			// optional (safe defaults)
			color: 'black',
			isFragile: false,
		}),
	});

	if (!res.ok) {
		const body = await res.json().catch(() => null);
		throw new Error(
			`Failed to create item "${payload.name}" (${res.status}):\n${JSON.stringify(body)}`
		);
	}

	const data = await res.json();

	const id: string = data?.item?.id ?? data?.id ?? data?.data?.id;

	if (!id) {
		throw new Error(
			`Item creation response missing id:\n${JSON.stringify(data)}`
		);
	}

	return id;
}

async function packItem(
	headers: HeadersInit,
	containerId: string,
	itemId: string,
	quantity: number = 3
): Promise<void> {
	const res = await fetch(`${API_BASE}/containers/${containerId}/pack`, {
		method: 'POST',
		headers,
		body: JSON.stringify({ itemId, quantity }),
	});

	if (!res.ok) {
		const body = await res.text().catch(() => '(no body)');
		throw new Error(
			`Failed to pack item ${itemId} into container ${containerId} (${res.status}):\n${body}`
		);
	}
}

/**
 * Creates a second user, seeds a container for them, and returns the container
 * ID. Used to test the "non-owned container" access-denied path.
 *
 * If your API does not expose a way to create users directly, fall back to a
 * seeded env var (E2E_NON_OWNED_CONTAINER_ID) and skip the creation step.
 */
async function createNonOwnedContainer(): Promise<string> {
	const envId = process.env.E2E_NON_OWNED_CONTAINER_ID;
	if (envId) {
		console.log(`✓ Using E2E_NON_OWNED_CONTAINER_ID from env: ${envId}`);
		return envId;
	}

	// ── Option A: create a second user via the signup endpoint ───────────────
	const secondUserEmail = `e2e-other+${Date.now()}@example.com`;
	const secondUserPassword = 'Other@User123';

	// Get a fresh CSRF token (no session needed for signup)
	let csrfToken = '';
	let csrfCookie = '';
	try {
		const csrfRes = await fetch(`${API_BASE}/csrf-token`);
		const setCookie = csrfRes.headers.get('set-cookie') ?? '';
		const match = setCookie.match(/XSRF-TOKEN=([^;]+)/);
		csrfToken = match ? decodeURIComponent(match[1] as string) : '';
		csrfCookie = setCookie
			.split(',')
			.map((c) => (c.split(';')[0] as string).trim())
			.join('; ');
	} catch {
		// Non-fatal — we'll get ECONNREFUSED if the server is not up
	}

	const signupRes = await fetch(`${API_BASE}/auth/signup`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRF-Token': csrfToken,
			Cookie: csrfCookie,
		},
		body: JSON.stringify({
			firstName: 'Other',
			lastName: 'User',
			email: secondUserEmail,
			password: secondUserPassword,
			confirmPassword: secondUserPassword,
		}),
	});

	if (!signupRes.ok && signupRes.status !== 409) {
		console.warn(
			`⚠ Could not create a second user for non-owned container test ` +
				`(${signupRes.status}). The access-denied test will be skipped.`
		);
		// Return a sentinel UUID — the test will detect a non-owned-container
		// error or skip gracefully via its own guard.
		return '00000000-0000-0000-0000-000000000001';
	}

	// Log in as the second user to get their session
	const loginRes = await fetch(`${API_BASE}/auth/login`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRF-Token': csrfToken,
			Cookie: csrfCookie,
		},
		body: JSON.stringify({
			email: secondUserEmail,
			password: secondUserPassword,
			rememberMe: false,
		}),
	});

	if (!loginRes.ok) {
		console.warn(
			'⚠ Could not log in as second user. Skipping non-owned container creation.'
		);
		return '00000000-0000-0000-0000-000000000001';
	}

	// Extract session cookies for the second user
	const loginCookies = loginRes.headers.get('set-cookie') ?? '';
	const sessionCookie = loginCookies
		.split(',')
		.map((c) => (c.split(';')[0] as string).trim())
		.join('; ');

	// Create a container as the second user
	const otherHeaders: HeadersInit = {
		'Content-Type': 'application/json',
		'X-CSRF-Token': csrfToken,
		Cookie: `${csrfCookie}; ${sessionCookie}`,
	};

	const otherContainerId = await createBag(otherHeaders, {
		name: 'E2E Other User Bag',
		type: BagType.BACKPACK,
	});

	console.log(`✓ Non-owned container created: ${otherContainerId}`);
	return otherContainerId;
}

// ── Setup test ────────────────────────────────────────────────────────────────

setup('seed packing data', async () => {
	// 1. Make sure the auth directory exists
	const authDir = path.dirname(PACKING_SEED_PATH);
	if (!fs.existsSync(authDir)) {
		fs.mkdirSync(authDir, { recursive: true });
	}

	// 2. Build auth headers from the saved session
	const headers = await getAuthHeaders();

	// 3. Create primary container
	const containerId = await createBag(headers, {
		name: 'E2E Primary Bag',
		type: BagType.BACKPACK,
		maxWeight: 15,
		maxCapacity: 30,
	});
	console.log(`✓ Primary container created: ${containerId}`);

	// 4. Create secondary container (for move tests)
	const secondContainerId = await createBag(headers, {
		name: 'E2E Secondary Bag',
		type: BagType.BACKPACK,
		maxWeight: 10,
		maxCapacity: 20,
	});
	console.log(`✓ Secondary container created: ${secondContainerId}`);

	// 5. Create an item in the library
	const itemId = await createItem(headers, {
		name: 'E2E Test Item',
		weight: 0.5,
		volume: 1,
	});
	console.log(`✓ Item created: ${itemId}`);

	// 6. Pre-pack some quantity into the primary container so that
	//    unpack/move tests have something to work with immediately.
	//    Quantity 3 means: partial-unpack (remove 1), full-unpack (remove 3),
	//    and move tests all have headroom.
	await packItem(headers, containerId, itemId, 3);
	console.log(`✓ Item ${itemId} packed into ${containerId} (qty 3)`);

	// 7. Non-owned container (separate user)
	const nonOwnedContainerId = await createNonOwnedContainer();

	// 8. Write seed data for the spec to import
	const seed: PackingSeed = {
		containerId,
		secondContainerId,
		itemId,
		nonOwnedContainerId,
	};

	fs.writeFileSync(PACKING_SEED_PATH, JSON.stringify(seed, null, 2));
	console.log(`✓ Packing seed written to ${PACKING_SEED_PATH}`);

	expect(fs.existsSync(PACKING_SEED_PATH)).toBe(true);
});
