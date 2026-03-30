import request from 'supertest';
import type { Test } from 'supertest';
import type { SuperAgentTest } from 'supertest';
import { faker } from '@faker-js/faker';
import { prisma } from '@prisma';
import app from '@app';
import type { HttpErrorResponse } from '@shared/types';
import type { ErrorCode } from '@beggy/shared/constants';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Base API prefix used across integration tests.
 */
export const BASE = '/api/beggy';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Represents a fully authenticated test agent.
 */
export interface AuthenticatedAgent {
	agent: SuperAgentTest;
	csrfToken: string;
}

/**
 * Represents an anonymous agent with valid CSRF but no auth session.
 */
export interface AnonAgent {
	agent: SuperAgentTest;
	csrfToken: string;
}

/**
 * Credentials used to create test users.
 */
export interface TestUserCredentials {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// COOKIE STORE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A simple name→value cookie store that merges correctly.
 *
 * @remarks
 * This is the root cause of the original bug.
 *
 * `agent.set('Cookie', value)` APPENDS to the Cookie header on each call.
 * After two CSRF fetches you end up with:
 *
 *   Cookie: XSRF-TOKEN=<old>; XSRF-TOKEN=<new>
 *
 * The server receives both values, resolves to the first (the old one), and
 * compares it against the header token (the new one) → HMAC mismatch → 403.
 *
 * The fix: parse every `Set-Cookie` response header into a name→value map.
 * When a name is seen again it REPLACES the old value. We then apply the
 * entire merged map to the agent as a single `.set('Cookie', ...)` call
 * so there is always exactly one value per cookie name.
 */
class CookieStore {
	private readonly store = new Map<string, string>();

	/**
	 * Parses a Set-Cookie header array and merges values into the store.
	 *
	 * @remarks
	 * A Set-Cookie entry looks like:
	 *   XSRF-TOKEN=abc123; Max-Age=86400; Path=/; SameSite=Lax
	 *
	 * We only care about the first `name=value` segment. Everything after
	 * the first `;` is metadata and must NOT be included in the Cookie header
	 * sent back to the server (doing so would break cookie-parser on Express).
	 *
	 * @param setCookieHeader - The `set-cookie` value from a response header.
	 */
	merge(setCookieHeader: unknown): void {
		if (!setCookieHeader) return;

		const entries = Array.isArray(setCookieHeader)
			? (setCookieHeader as string[])
			: [String(setCookieHeader)];

		for (const entry of entries) {
			// Take only the first segment: "name=value"
			const nameValue = entry.split(';')[0]?.trim();
			if (!nameValue) continue;

			const eqIdx = nameValue.indexOf('=');
			if (eqIdx === -1) continue;

			const name = nameValue.substring(0, eqIdx).trim();
			const value = nameValue.substring(eqIdx + 1).trim();

			if (name) {
				// Replace — not append — so duplicates never build up
				this.store.set(name, value);
			}
		}
	}

	/**
	 * Returns a single `Cookie` header string built from all stored values.
	 *
	 * @example
	 * "XSRF-TOKEN=abc; access_token=xyz; refresh_token=def"
	 */
	toCookieHeader(): string {
		return Array.from(this.store.entries())
			.map(([name, value]) => `${name}=${value}`)
			.join('; ');
	}

	/**
	 * Applies the current store to a supertest agent as a single Cookie header.
	 *
	 * @remarks
	 * Calling this after every response guarantees the agent always sends
	 * exactly one value per cookie name on its next request.
	 */
	applyTo(agent: SuperAgentTest): void {
		const header = this.toCookieHeader();
		if (header) {
			(agent as unknown as { set: (k: string, v: string) => void }).set(
				'Cookie',
				header
			);
		}
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// CREDENTIAL FACTORY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates a unique set of test user credentials.
 *
 * - Timestamp + nanoid suffix prevents email collisions in parallel runs.
 * - Password satisfies FieldsSchema.password() rules.
 */
export const makeTestCredentials = (
	overrides: Partial<TestUserCredentials> = {}
): TestUserCredentials => ({
	firstName: overrides.firstName ?? faker.person.firstName(),
	lastName: overrides.lastName ?? faker.person.lastName(),
	email:
		overrides.email ??
		`test-${Date.now()}-${faker.string.nanoid(6)}@beggy.test`,
	password: overrides.password ?? 'Test1234!',
});

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL — CSRF fetch
// ─────────────────────────────────────────────────────────────────────────────

interface CsrfResult {
	csrfToken: string;
	setCookieHeader: unknown;
}

const fetchCsrfRaw = async (agent: SuperAgentTest): Promise<CsrfResult> => {
	const res = await agent.get(`${BASE}/auth/csrf-token`);

	if (!res.body?.data?.csrfToken) {
		throw new Error(
			`[test helper] CSRF fetch failed (${res.status}): ${JSON.stringify(res.body)}`
		);
	}

	return {
		csrfToken: res.body.data.csrfToken as string,
		setCookieHeader: res.headers['set-cookie'],
	};
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — fetchCsrfToken
// ─────────────────────────────────────────────────────────────────────────────

export const fetchCsrfToken = async (
	agent: SuperAgentTest
): Promise<string> => {
	const { csrfToken } = await fetchCsrfRaw(agent);
	return csrfToken;
};

// ─────────────────────────────────────────────────────────────────────────────
// ANONYMOUS AGENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates an anonymous agent with a valid CSRF token but no auth cookies.
 *
 * Use this to test 401 responses — CSRF passes, auth middleware rejects.
 */
export const createAnonAgent = async (): Promise<AnonAgent> => {
	const agent = request.agent(app) as unknown as SuperAgentTest;
	const cookies = new CookieStore();

	const { csrfToken, setCookieHeader } = await fetchCsrfRaw(agent);
	cookies.merge(setCookieHeader);
	cookies.applyTo(agent);

	return { agent, csrfToken };
};

// ─────────────────────────────────────────────────────────────────────────────
// AUTHENTICATED AGENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a fully authenticated test agent by running signup → login.
 *
 * @remarks
 * ### Root cause of the previous failures
 * `agent.set('Cookie', value)` appends — it does not replace. Calling it
 * twice with two different XSRF-TOKEN values produces:
 *
 *   Cookie: XSRF-TOKEN=<old>; XSRF-TOKEN=<new>
 *
 * Express/cookie-parser resolves to the first value. The CSRF middleware
 * compares the cookie (old) against the header (new) → HMAC mismatch → 403.
 *
 * The fix is `CookieStore` which parses name=value from Set-Cookie headers
 * and always replaces on collision, then applies the entire map as one header.
 *
 * ### Why CSRF is re-fetched after login
 * `getSessionIdentifier` returns the refresh token cookie value for
 * authenticated requests. Before login that cookie does not exist, so the
 * pre-login CSRF token is HMAC'd against a different identifier. After login
 * the identifier changes. Re-fetching gives a token valid for the new session.
 */
export const createAuthenticatedAgent = async (
	credentials?: Partial<TestUserCredentials>
): Promise<AuthenticatedAgent> => {
	const agent = request.agent(app) as unknown as SuperAgentTest;
	const creds = makeTestCredentials(credentials);
	const cookies = new CookieStore();

	// ── Step 1: Pre-login CSRF ────────────────────────────────────────────────
	const { csrfToken: preCsrf, setCookieHeader: csrfCookies } =
		await fetchCsrfRaw(agent);
	cookies.merge(csrfCookies);
	cookies.applyTo(agent);

	// ── Step 2: Sign up ───────────────────────────────────────────────────────
	const signupRes = await agent
		.post(`${BASE}/auth/signup`)
		.set('x-csrf-token', preCsrf)
		.send({
			firstName: creds.firstName,
			lastName: creds.lastName,
			email: creds.email,
			password: creds.password,
			confirmPassword: creds.password,
		});

	if (signupRes.status !== 201) {
		throw new Error(
			`[test helper] Signup failed (${signupRes.status}): ${JSON.stringify(signupRes.body)}`
		);
	}

	cookies.merge(signupRes.headers['set-cookie']);
	cookies.applyTo(agent);

	// ── Step 3: Log in ────────────────────────────────────────────────────────
	const loginRes = await agent
		.post(`${BASE}/auth/login`)
		.set('x-csrf-token', preCsrf)
		.send({
			email: creds.email,
			password: creds.password,
			rememberMe: false,
		});

	if (loginRes.status !== 200) {
		throw new Error(
			`[test helper] Login failed (${loginRes.status}): ${JSON.stringify(loginRes.body)}`
		);
	}

	// Merge access + refresh token cookies (replaces any old values)
	cookies.merge(loginRes.headers['set-cookie']);
	cookies.applyTo(agent);

	// ── Step 4: Re-fetch CSRF with the refresh token now present ─────────────
	const { csrfToken, setCookieHeader: postCsrfCookies } =
		await fetchCsrfRaw(agent);
	cookies.merge(postCsrfCookies);
	cookies.applyTo(agent);

	return { agent, csrfToken };
};

// ─────────────────────────────────────────────────────────────────────────────
// MUTATION HELPER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Attaches the CSRF token header to a supertest request.
 *
 * @example
 * ```typescript
 * const res = await withCsrf(agent.post(`${BASE}/bags`).send(payload), csrfToken);
 * ```
 */
export const withCsrf = (req: Test, csrfToken: string): Test =>
	req.set('x-csrf-token', csrfToken);

// ─────────────────────────────────────────────────────────────────────────────
// ASSERTION HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Asserts a standard paginated list response shape.
 */
export const expectPaginatedResponse = (
	body: Record<string, unknown>,
	expectedPage = 1
) => {
	expect(Array.isArray(body.data)).toBe(true);
	expect(body.meta).toBeDefined();
	expect(body.meta).toMatchObject({ page: expectedPage });
};

/**
 * Asserts that a response has the expected HTTP status and optional error code.
 *
 * @example
 * ```typescript
 * expectError(res, 404, 'BAG_NOT_FOUND');
 * expectError(res, 401);
 * ```
 */
export const expectError = (
	res: { status: number; body: HttpErrorResponse },
	status: number,
	code?: ErrorCode
) => {
	expect(res.status).toBe(status);
	if (code) {
		expect(res.body.code).toBe(code);
	}
};

/**
 * Completely resets the test database.
 *
 * IMPORTANT:
 * - Must be called before each integration test
 * - Order matters due to foreign key constraints
 * - Uses deleteMany (NOT truncate) for Prisma safety
 */
export async function truncateAllTables(): Promise<void> {
	// Deepest dependencies first
	await prisma.containerItems.deleteMany();

	// Items & containers children
	await prisma.item.deleteMany();
	await prisma.bag.deleteMany();
	await prisma.suitcase.deleteMany();

	// Containers (after bags/suitcases)
	await prisma.container.deleteMany();

	// Auth & profile
	await prisma.userToken.deleteMany();
	await prisma.account.deleteMany();
	await prisma.profile.deleteMany();

	// Permissions (if used in tests)
	await prisma.roleOnPermission.deleteMany();
	await prisma.permission.deleteMany();

	// Root
	await prisma.user.deleteMany();
}
