import request from 'supertest';
import type { Test } from 'supertest';
import type { SuperAgentTest } from 'supertest';
import { faker } from '@faker-js/faker';
import { prisma, type PrismaClientType } from '@prisma';
import app from '@app';
import {
	Role,
	type Action as PrismaAction,
	type Scope as PrismaScope,
	type Subject as PrismaSubject,
} from '@prisma-generated/enums';
import { RolePermissions } from '@beggy/shared/constants';
import type { HttpErrorResponse } from '@shared/types';
import type { ErrorCode } from '@beggy/shared/constants';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

export const BASE = '/api/beggy';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A fully authenticated test agent.
 *
 * - `userId` — real DB id, use for ownership assertions
 * - `role`   — role the user was assigned before login
 */
export interface AuthenticatedAgent {
	agent: SuperAgentTest;
	csrfToken: string;
	userId: string;
	role: Role;
}

export interface AnonAgent {
	agent: SuperAgentTest;
	csrfToken: string;
}

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
 * Name→value cookie store that always replaces on collision.
 *
 * `agent.set('Cookie', value)` APPENDS — calling it twice with different
 * XSRF-TOKEN values produces `XSRF-TOKEN=<old>; XSRF-TOKEN=<new>`.
 * Express resolves to the first value, CSRF middleware compares it against
 * the header (new value) → HMAC mismatch → 403.
 *
 * Fix: parse name=value from Set-Cookie, replace on collision, rebuild one
 * clean header after every response.
 */
class CookieStore {
	private readonly store = new Map<string, string>();

	merge(setCookieHeader: unknown): void {
		if (!setCookieHeader) return;
		const entries = Array.isArray(setCookieHeader)
			? (setCookieHeader as string[])
			: [String(setCookieHeader)];

		for (const entry of entries) {
			const nameValue = entry.split(';')[0]?.trim();
			if (!nameValue) continue;
			const eqIdx = nameValue.indexOf('=');
			if (eqIdx === -1) continue;
			const name = nameValue.substring(0, eqIdx).trim();
			const value = nameValue.substring(eqIdx + 1).trim();
			if (name) this.store.set(name, value);
		}
	}

	toCookieHeader(): string {
		return Array.from(this.store.entries())
			.map(([n, v]) => `${n}=${v}`)
			.join('; ');
	}

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
// PERMISSION SEEDING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Seeds all role permissions into the test database.
 *
 * Call once in `beforeAll` per suite. Idempotent — safe to call multiple times.
 * Permissions are preserved by `truncateAllTables` so re-seeding between tests
 * is never needed.
 *
 * @remarks
 * `defineAbilityFor` reads `RolePermissions` (in-memory) at runtime so CASL
 * itself works without DB permissions. However keeping the test DB in sync with
 * the production seed prevents divergence and supports future DB-backed
 * permission features.
 */
export const seedTestPermissions = async (): Promise<void> => {
	const allPermissions = Object.values(Role).flatMap((role) =>
		RolePermissions[role].map((perm) => ({
			action: perm.action as PrismaAction,
			scope: perm.scope as PrismaScope,
			subject: perm.subject as PrismaSubject,
		}))
	);

	await prisma.permission.createMany({
		data: allPermissions,
		skipDuplicates: true,
	});

	for (const role of Object.values(Role)) {
		const found = await Promise.all(
			RolePermissions[role].map((perm) =>
				prisma.permission.findUnique({
					where: {
						action_scope_subject: {
							action: perm.action as PrismaAction,
							scope: perm.scope as PrismaScope,
							subject: perm.subject as PrismaSubject,
						},
					},
					select: { id: true },
				})
			)
		);

		await prisma.roleOnPermission.createMany({
			data: found
				.filter(Boolean)
				.map((p) => ({ permissionId: p!.id, role })),
			skipDuplicates: true,
		});
	}
};

// ─────────────────────────────────────────────────────────────────────────────
// DATABASE UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Wipes all application data in dependency order.
 *
 * Permissions are intentionally preserved — they are stable and seeded once
 * per suite. Never call `truncateAllTables` between seeding and role elevation
 * in `createAuthenticatedAgent` — the helper handles its own flow atomically.
 *
 * Use in `beforeEach` when tests need a clean slate.
 */
export const truncateAllTables = async (): Promise<void> => {
	await prisma.$transaction([
		prisma.containerItems.deleteMany(),
		prisma.item.deleteMany(),
		prisma.bag.deleteMany(),
		prisma.suitcase.deleteMany(),
		prisma.container.deleteMany(),
		prisma.userToken.deleteMany(),
		prisma.account.deleteMany(),
		prisma.profile.deleteMany(),
		prisma.user.deleteMany(),
	]);
	// Permissions preserved intentionally
};

// ─────────────────────────────────────────────────────────────────────────────
// CREDENTIAL FACTORY
// ─────────────────────────────────────────────────────────────────────────────

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
 * Agent with a valid CSRF token but no auth cookies.
 * Use to test 401 — CSRF passes, `requireAuth` rejects.
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
 * Elevates the role of the currently authenticated test user.
 *
 * @description
 * Retrieves the authenticated user via `/auth/me` using the provided agent,
 * then directly updates their role in the database using Prisma.
 *
 * Intended for integration tests where role-based access needs to be simulated
 * without going through the full authorization flow.
 *
 * @param prisma - Prisma client instance used to update the user record.
 * @param agent - Authenticated Supertest agent representing the current session.
 * @param role - Target role to assign to the user.
 *
 * @throws If `/auth/me` does not return a valid user (e.g. unauthenticated session
 * or unexpected response shape).
 *
 * @remarks
 * - Assumes the agent has already completed signup/login.
 * - Bypasses domain/business logic by writing directly to the database.
 * - Coupled to the `/auth/me` response structure (`body.data.user.id`).
 */
export const elevateRole = async (
	prisma: PrismaClientType,
	agent: SuperAgentTest,
	role: Role
): Promise<void> => {
	const response = await agent.get(`${BASE}/auth/me`);

	const userId = response.body?.data?.user?.id as string | undefined;

	if (response.status !== 200 || !userId) {
		throw new Error(
			`[test helper] Failed to elevate role: /auth/me returned (${response.status}). ` +
				`Body: ${JSON.stringify(response.body)}`
		);
	}

	await prisma.user.update({
		where: { id: userId },
		data: { role },
	});
};

/**
 * Creates a fully authenticated test agent: signup → role elevation → login
 * → post-login CSRF refresh → userId resolution.
 *
 * @remarks
 *
 * ### `bagFactory` / `itemFactory` include `userId` — strip it before sending
 * Your Zod schemas use `z.strictObject` which rejects unrecognised keys.
 * Factories include `userId` for unit-test convenience but it must NOT be sent
 * to the API. Always destructure it out:
 * ```typescript
 * const { userId: _ignored, ...payload } = bagFactory('ignored');
 * agent.post('/bags').send(payload);
 * ```
 *
 * ### Role elevation timing
 * Signup always creates `Role.USER`. The DB update happens BEFORE login so the
 * JWT is signed with the correct role. Do NOT call `truncateAllTables` between
 * signup and the role update — the user must exist in the DB at that point.
 *
 * ### Rate limiting
 * Each call makes ~5 HTTP requests. With many parallel tests this can hit
 * `express-rate-limit`. Fix: set `NODE_ENV=test` and skip the limiter in that
 * environment, or raise the limit in your test config.
 *
 * ### userId resolution
 * `userId` is read from `/auth/me` after login rather than from the signup
 * response body — this avoids coupling to the auth controller's exact shape.
 *
 * @param credentials - Optional overrides (defaults to random values)
 * @param role - Role to assign before login (default: `Role.USER`)
 */
export const createAuthenticatedAgent = async (
	credentials?: Partial<TestUserCredentials>,
	role: Role = Role.USER
): Promise<AuthenticatedAgent> => {
	const agent = request.agent(app) as unknown as SuperAgentTest;
	const creds = makeTestCredentials(credentials);
	const cookies = new CookieStore();

	// ── Step 1: Pre-login CSRF ──────────────────────────────────────
	const { csrfToken: preCsrf, setCookieHeader: csrfCookies } =
		await fetchCsrfRaw(agent);
	cookies.merge(csrfCookies);
	cookies.applyTo(agent);

	// ── Step 2: Sign up ─────────────────────────────────────────────
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

	// ── Step 3: Elevate role BEFORE login ───────────────────────────
	// This MUST happen before Step 4 (login). The JWT is signed at login
	// time — whatever role is in the DB at that moment gets baked into
	// the token. Elevating after login has zero effect on the JWT.
	//
	// We call /auth/me here using the signup session cookie to resolve
	// the userId without touching Prisma directly. A direct DB query
	// races against the signup transaction commit and fails intermittently.
	if (role !== Role.USER) {
		await elevateRole(prisma, agent, role);
	}

	// ── Step 4: Log in ──────────────────────────────────────────────
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

	cookies.merge(loginRes.headers['set-cookie']);
	cookies.applyTo(agent);

	// ── Step 5: Re-fetch CSRF ───────────────────────────────────────
	const { csrfToken, setCookieHeader: postCsrfCookies } =
		await fetchCsrfRaw(agent);
	cookies.merge(postCsrfCookies);
	cookies.applyTo(agent);

	// ── Step 6: Resolve userId + role ──────────────────────────────
	const meRes = await agent.get(`${BASE}/auth/me`);
	const userData = meRes.body?.data?.user;

	if (meRes.status !== 200 || !userData?.id || !userData?.role) {
		throw new Error(
			`[test helper] /auth/me failed (${meRes.status}): ${JSON.stringify(meRes.body)}`
		);
	}

	return {
		agent,
		csrfToken,
		userId: userData.id as string,
		role: userData.role as Role,
	};
};

// ─────────────────────────────────────────────────────────────────────────────
// FACTORY HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Strips `userId` from any factory output before sending to the API.
 *
 * Your schemas use `z.strictObject` — `userId` is not an accepted field on
 * create/update endpoints and will cause a 400 "Unrecognized key" error.
 * Factories include it for unit-test convenience only.
 *
 * @example
 * ```typescript
 * const res = await withCsrf(
 *   agent.post(`${BASE}/bags`).send(stripUserId(bagFactory('ignored'))),
 *   csrfToken
 * );
 * ```
 */
export const stripUserId = <T extends { userId?: unknown }>(
	factory: T
): Omit<T, 'userId'> => {
	const { userId: _ignored, ...rest } = factory;
	return rest as Omit<T, 'userId'>;
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

export const expectPaginatedResponse = (
	body: Record<string, unknown>,
	expectedPage = 1
) => {
	expect(Array.isArray(body.data)).toBe(true);
	expect(body.meta).toBeDefined();
	expect(body.meta).toMatchObject({ page: expectedPage });
};

/**
 * Asserts HTTP status and optional domain error code.
 *
 * @example
 * ```typescript
 * expectError(res, 404, ErrorCode.BAG_NOT_FOUND);
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
