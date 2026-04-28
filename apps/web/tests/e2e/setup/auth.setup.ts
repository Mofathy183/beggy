import { STORAGE_STATE_PATH } from '../fixtures/auth.fixture';

/**
 * auth.setup.ts
 *
 * Runs once before all E2E test projects (chromium, mobile-chrome).
 * Seeds a known test user into the test database via the API so that
 * Sign In tests have real credentials to work with.
 */

import { test as setup, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// ── Constants ─────────────────────────────────────────────────────────────────

const API_BASE =
	process.env.E2E_API_BASE_URL ?? 'http://127.0.0.1:4000/api/beggy';

export const SEED_USER = {
	firstName: 'Alice',
	lastName: 'Smith',
	email: process.env.E2E_EXISTING_EMAIL ?? 'existing@example.com',
	password: process.env.E2E_EXISTING_PASSWORD ?? 'Existing@123',
} as const;

export const ONBOARDING_USER = {
	firstName: 'Bob',
	lastName: 'Onboarding',
	email: process.env.E2E_ONBOARDING_EMAIL ?? 'onboarding@example.com',
	password: process.env.E2E_ONBOARDING_PASSWORD ?? 'Existing@123',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Fetches the CSRF token cookie from the API.
 * Falls back to empty strings — the browser fallback in setup() handles it.
 */
async function getCsrfToken(): Promise<{ cookie: string; token: string }> {
	const res = await fetch(`${API_BASE}/csrf-token`, { method: 'GET' });
	const setCookie = res.headers.get('set-cookie') ?? '';
	const match = setCookie.match(/XSRF-TOKEN=([^;]+)/);
	const token = match ? decodeURIComponent(match[1] as any) : '';
	const cookieHeader = setCookie
		.split(',')
		.map((c) => (c.split(';')[0] as string).trim())
		.join('; ');
	return { cookie: cookieHeader, token };
}

/**
 * Creates the seed user via the API.
 * 201 = created, 409 = already exists — both are acceptable.
 * Any other status throws so setup fails loudly.
 */
async function seedUser(
	csrfToken: string,
	csrfCookie: string,
	user: {
		firstName: string;
		lastName: string;
		email: string;
		password: string;
	}
): Promise<void> {
	const res = await fetch(`${API_BASE}/auth/signup`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRF-Token': csrfToken,
			Cookie: csrfCookie,
		},
		body: JSON.stringify({
			...user,
			confirmPassword: SEED_USER.password,
		}),
	});

	// ✅ Accept "already exists" as success
	if (res.status === 201) return;

	if (res.status === 400) {
		const data = await res.json().catch(() => null);

		if (data?.code === 'RESOURCE_ALREADY_EXISTS') {
			console.log('✓ User already exists, skipping seed');
			return;
		}
	}

	// ❌ Any other status is a failure
	const body = await res.text().catch(() => '(no body)');
	throw new Error(`Seed user creation failed (${res.status}):\n${body}`);
}

/**
 * Marks the seed user's onboarding as complete via the API.
 * This prevents the OnboardingLayout guard from redirecting tests to /onboarding.
 */
async function completeOnboarding(
	csrfToken: string,
	csrfCookie: string,
	sessionCookie: string
): Promise<void> {
	const res = await fetch(`${API_BASE}/profiles/me/onboarding`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRF-Token': csrfToken,
			Cookie: `${csrfCookie}; ${sessionCookie}`,
		},
		body: JSON.stringify({}), // empty body = skip path, sets onboardingCompleted: true
	});

	if (!res.ok && res.status !== 409) {
		const body = await res.text().catch(() => '(no body)');
		console.warn(
			`⚠ Could not complete onboarding for seed user (${res.status}):\n${body}`
		);
		// Non-fatal — if the user already completed it, we're fine
	} else {
		console.log('✓ Seed user onboarding marked complete');
	}
}

/**
 * Verifies the seed user can actually log in via a direct API call.
 * Throws if login fails so setup fails before any test runs.
 */
async function verifyLogin(
	csrfToken: string,
	csrfCookie: string
): Promise<string> {
	// <-- now returns session cookie
	const res = await fetch(`${API_BASE}/auth/login`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRF-Token': csrfToken,
			Cookie: csrfCookie,
		},
		body: JSON.stringify({
			email: SEED_USER.email,
			password: SEED_USER.password,
			rememberMe: false,
		}),
	});

	if (!res.ok) {
		const body = await res.text().catch(() => '(no body)');
		throw new Error(
			`Setup verification failed — seed user cannot log in (${res.status}):\n${body}`
		);
	}

	// Extract session cookies so we can make authenticated calls
	const setCookie = res.headers.get('set-cookie') ?? '';
	const sessionCookie = setCookie
		.split(',')
		.map((c) => (c.split(';')[0] as string).trim())
		.join('; ');

	return sessionCookie;
}

// ── Setup test ────────────────────────────────────────────────────────────────

setup('seed test user and save auth state', async ({ page }) => {
	// 1. Ensure the .auth directory exists
	const authDir = path.dirname(STORAGE_STATE_PATH);
	if (!fs.existsSync(authDir)) {
		fs.mkdirSync(authDir, { recursive: true });
	}

	// 2. Get CSRF token — fall back to harvesting it from the browser
	let csrfToken = '';
	let csrfCookie = '';

	try {
		const csrf = await getCsrfToken();
		csrfToken = csrf.token;
		csrfCookie = csrf.cookie;
	} catch {
		await page.goto('/login');
		await page.waitForLoadState('networkidle');
		const cookies = await page.context().cookies();
		const xsrf = cookies.find((c) => c.name === 'XSRF-TOKEN');
		csrfToken = xsrf?.value ?? '';
		csrfCookie = `XSRF-TOKEN=${csrfToken}`;
	}

	// 3. Seed the user (idempotent)
	await seedUser(csrfToken, csrfCookie, SEED_USER);
	await seedUser(csrfToken, csrfCookie, ONBOARDING_USER);
	console.log(`✓ Seed user ready: ${SEED_USER.email}`);

	// 4. Verify login works before touching the browser —
	//    fails loudly here rather than silently inside individual tests
	const sessionCookie = await verifyLogin(csrfToken, csrfCookie);
	console.log(`✓ Seed user login verified via API`);

	// 4b. Ensure onboarding is completed so tests land on /dashboard, not /onboarding
	await completeOnboarding(csrfToken, csrfCookie, sessionCookie);

	// 5. Sign in via the browser so Playwright captures auth cookies into
	//    storageState. Tests that need a pre-authenticated context use:
	//    test.use({ storageState: STORAGE_STATE_PATH })
	await page.goto('/login');
	await page.waitForLoadState('networkidle');
	await page.locator('h1, h2').first().waitFor({ state: 'attached' });

	await page.fill('#login-email', SEED_USER.email);
	await page.fill('#field-password', SEED_USER.password);
	await page.getByRole('button', { name: 'Sign in' }).click();

	await page.waitForURL(
		(url) =>
			!url.pathname.includes('/login') &&
			!url.pathname.includes('/signup'),
		{ timeout: 20_000 }
	);

	// 6. Persist the authenticated session
	await page.context().storageState({ path: STORAGE_STATE_PATH });
	console.log(`✓ Auth state saved to ${STORAGE_STATE_PATH}`);

	expect(fs.existsSync(STORAGE_STATE_PATH)).toBe(true);
});
