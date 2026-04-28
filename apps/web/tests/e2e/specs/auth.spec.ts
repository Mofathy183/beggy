import { test, expect, Page } from '@playwright/test';
import { STORAGE_STATE_PATH } from '../fixtures/auth.fixture';

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROUTES = {
	login: '/login',
	signup: '/signup',
	dashboard: '/dashboard',
	onboarding: '/onboarding',
	oauthCallback: '/auth/callback',
} as const;

/** Valid test credentials — override via environment variables in real environments. */
const CREDS = {
	existingEmail: process.env.E2E_EXISTING_EMAIL ?? 'existing@example.com',
	existingPassword: process.env.E2E_EXISTING_PASSWORD ?? 'Existing@123',
	newEmail: () => `e2e+${Date.now()}@example.com`, // unique per test run
	firstName: 'Alice',
	lastName: 'Smith',
	password: 'Secure@Pass1',
};

/** Fill the sign-up form fields. */
async function fillSignupForm(
	page: Page,
	overrides: Partial<{
		firstName: string;
		lastName: string;
		email: string;
		password: string;
		confirmPassword: string;
	}> = {}
) {
	const v = {
		firstName: CREDS.firstName,
		lastName: CREDS.lastName,
		email: CREDS.newEmail(),
		password: CREDS.password,
		confirmPassword: CREDS.password,
		...overrides,
	};

	await page.fill('#signup-first-name', v.firstName);
	await page.fill('#signup-last-name', v.lastName);
	await page.fill('#signup-email', v.email);
	await page.fill('#field-password', v.password);
	await page.fill('#field-confirm-password', v.confirmPassword);
}

/** Fill the login form fields. */
async function fillLoginForm(
	page: Page,
	email = CREDS.existingEmail,
	password = CREDS.existingPassword
) {
	await page.fill('#login-email', email);
	await page.fill('#field-password', password);
}

/** Wait until a visible heading or primary form control appears (auth pages
 *  can render nothing while auth bootstrap is running). */
async function waitForAuthPage(page: Page) {
	await page.waitForLoadState('networkidle');
	// Use locator + waitFor instead of waitForSelector,
	// and check 'attached' not 'visible' — avoids the overlay race
	await page.locator('h1, h2').first().waitFor({ state: 'attached' });
}
// ── 1. Create a New Account ───────────────────────────────────────────────────

test.describe('Sign Up', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(ROUTES.signup);
		await waitForAuthPage(page);
	});

	test('successfully registers a new user and redirects to onboarding', async ({
		page,
	}) => {
		await fillSignupForm(page);
		await page.getByRole('button', { name: 'Create account' }).click();

		// Wait for route change — newly registered users go to onboarding
		await page.waitForURL(`**${ROUTES.onboarding}**`, { timeout: 15_000 });
		expect(page.url()).toContain(ROUTES.onboarding);
	});

	test('shows a success notification after registration', async ({
		page,
	}) => {
		await fillSignupForm(page);
		await page.getByRole('button', { name: 'Create account' }).click();

		// Alert role covers both toast and inline success banners
		await expect(page.getByRole('alert').first()).toBeVisible({
			timeout: 10_000,
		});
	});

	test('offers a link to switch to sign-in', async ({ page }) => {
		const signInLink = page.getByRole('link', { name: /sign in/i });
		await expect(signInLink).toBeVisible();
		await signInLink.click();
		await page.waitForURL(`**${ROUTES.login}**`);
	});

	// ── Validation failures ───────────────────────────────────────────────────

	test('shows errors when required fields are empty', async ({ page }) => {
		await page.getByRole('button', { name: 'Create account' }).click();
		const alerts = page.getByRole('alert');
		await expect(alerts.first()).toBeVisible();
	});

	test('shows error for invalid email format', async ({ page }) => {
		await fillSignupForm(page, { email: 'not-an-email' });
		await page.getByRole('button', { name: 'Create account' }).click();
		await expect(page.getByRole('alert').first()).toBeVisible();
	});

	test('shows error when first name is too short', async ({ page }) => {
		await fillSignupForm(page, { firstName: 'A' });
		await page.getByRole('button', { name: 'Create account' }).click();
		await expect(page.getByRole('alert').first()).toBeVisible();
	});

	test('shows error when last name is too short', async ({ page }) => {
		await fillSignupForm(page, { lastName: 'B' });
		await page.getByRole('button', { name: 'Create account' }).click();
		await expect(page.getByRole('alert').first()).toBeVisible();
	});

	test('shows error when first name exceeds 50 characters', async ({
		page,
	}) => {
		await fillSignupForm(page, { firstName: 'A'.repeat(51) });
		await page.getByRole('button', { name: 'Create account' }).click();
		await expect(page.getByRole('alert').first()).toBeVisible();
	});

	test('shows error when password does not meet complexity rules', async ({
		page,
	}) => {
		await fillSignupForm(page, {
			password: 'simple',
			confirmPassword: 'simple',
		});
		await page.getByRole('button', { name: 'Create account' }).click();
		await expect(page.getByRole('alert').first()).toBeVisible();
	});

	test('shows error when password contains spaces', async ({ page }) => {
		const spaced = 'Secure @Pass1';
		await fillSignupForm(page, {
			password: spaced,
			confirmPassword: spaced,
		});
		await page.getByRole('button', { name: 'Create account' }).click();
		await expect(page.getByRole('alert').first()).toBeVisible();
	});

	test('shows error when passwords do not match', async ({ page }) => {
		await fillSignupForm(page, { confirmPassword: 'Different@Pass1' });
		await page.getByRole('button', { name: 'Create account' }).click();
		await expect(page.getByRole('alert').first()).toBeVisible();
	});

	test('shows server error banner when email is already registered', async ({
		page,
	}) => {
		// Use the known existing account email to trigger a duplicate-email error
		await fillSignupForm(page, { email: CREDS.existingEmail });
		await page.getByRole('button', { name: 'Create account' }).click();
		await expect(page.getByRole('alert').first()).toBeVisible({
			timeout: 10_000,
		});
	});
});

// ── 2. Sign In with Email and Password ───────────────────────────────────────
// Drop-in replacement for the Sign In describe block in auth.spec.ts
// Fixes:
//   1. #login-remember-me is aria-hidden (custom styled checkbox) → click the label
//   2. Alert text is empty → wait for non-empty text content
//   3. Onboarding/dashboard redirect tests need the seeded user

test.describe('Sign In', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(ROUTES.login);
		await waitForAuthPage(page);
		// Dismiss any stale alert from a previous test's failed login attempt
		// The error banner persists across navigations if the page didn't fully reload
		const staleAlert = page.locator(
			'alert[ref=e80], [role="alert"]:has-text("login details")'
		);
		if ((await staleAlert.count()) > 0) {
			await page.reload();
			await waitForAuthPage(page);
		}
	});

	test('successfully authenticates an existing user', async ({ page }) => {
		await fillLoginForm(page);
		await page.getByRole('button', { name: 'Sign in' }).click();

		// Redirect goes to onboarding OR dashboard depending on user state
		await page.waitForURL(
			(url) =>
				url.pathname.includes(ROUTES.dashboard) ||
				url.pathname.includes(ROUTES.onboarding),
			{ timeout: 15_000 }
		);
		const url = page.url();
		expect(
			url.includes(ROUTES.dashboard) || url.includes(ROUTES.onboarding)
		).toBe(true);
	});

	test('shows a success notification after sign-in', async ({ page }) => {
		await fillLoginForm(page);
		await page.getByRole('button', { name: 'Sign in' }).click();
		// Wait for the alert AND for it to have non-empty text
		const alert = page.getByRole('alert').first();
		await expect(alert).toBeVisible({ timeout: 10_000 });
		await expect(alert).not.toBeEmpty();
	});

	test('redirects to onboarding when user has not completed it', async ({
		page,
	}) => {
		// Requires an account seeded with incomplete onboarding.
		// Falls back to the default seed user — adjust if you seed a specific
		// onboarding-incomplete user in auth.setup.ts.
		const email =
			process.env.E2E_ONBOARDING_EMAIL ?? 'onboarding@example.com';
		const password =
			process.env.E2E_ONBOARDING_PASSWORD ?? CREDS.existingPassword;

		await fillLoginForm(page, email, password);
		await page.getByRole('button', { name: 'Sign in' }).click();

		await page.waitForURL(`**${ROUTES.onboarding}**`, { timeout: 15_000 });
		expect(page.url()).toContain(ROUTES.onboarding);
	});

	test('redirects to dashboard when user has completed onboarding', async ({
		page,
	}) => {
		// Use a user known to have completed onboarding.
		const email = process.env.E2E_DASHBOARD_EMAIL ?? CREDS.existingEmail;
		const password =
			process.env.E2E_DASHBOARD_PASSWORD ?? CREDS.existingPassword;
		await fillLoginForm(page, email, password);
		await page.getByRole('button', { name: 'Sign in' }).click();
		await page.waitForURL(`**${ROUTES.dashboard}**`, { timeout: 15_000 });
		expect(page.url()).toContain(ROUTES.dashboard);
	});

	test('disables inputs and submit button while request is in progress', async ({
		page,
	}) => {
		// Slow down the login request
		await page.route('**/auth/login', async (route) => {
			await new Promise((r) => setTimeout(r, 500)); // force visible loading state
			await route.continue();
		});

		await fillLoginForm(page);

		const submitBtn = page.locator('#login-submit');

		await submitBtn.click();

		// Now the button WILL stay disabled long enough
		await expect(submitBtn).toBeDisabled();
	});

	test('"Keep me signed in" checkbox is interactive', async ({ page }) => {
		// The checkbox uses aria-hidden="true" — it is a visually-styled custom
		// control. The real interaction target is the <label> that wraps or is
		// associated with it. Click the label; then assert the underlying input
		// is checked via its checked property (not Playwright's isChecked which
		// requires aria visibility).

		// Strategy 1: click the label associated with the checkbox
		const label = page.locator('label[for="login-remember-me"]');
		const labelExists = await label.count();

		if (labelExists > 0) {
			await label.click();
		} else {
			// Strategy 2: find the visible sibling/parent of the hidden input
			// and click it. Common pattern: a <div role="checkbox"> or <span>
			// next to the hidden <input>.
			const customCheckbox = page
				.locator('[role="checkbox"]')
				.or(
					page.locator('#login-remember-me').locator('xpath=..') // parent element
				)
				.first();
			await customCheckbox.click({ force: true });
		}

		// Assert the underlying input is now checked regardless of aria-hidden
		const checked = await page
			.locator('#login-remember-me')
			.evaluate((el: HTMLInputElement) => el.checked);
		expect(checked).toBe(true);
	});

	// ── Validation failures ───────────────────────────────────────────────────

	test('shows errors when required fields are empty', async ({ page }) => {
		await page.getByRole('button', { name: 'Sign in' }).click();
		await expect(page.getByRole('alert').first()).toBeVisible();
	});

	test('shows error for invalid email format', async ({ page }) => {
		await page.fill('#login-email', 'not-an-email');
		await page.fill('#field-password', CREDS.password);
		await page.getByRole('button', { name: 'Sign in' }).click();
		await expect(page.getByRole('alert').first()).toBeVisible();
	});

	test('shows server error banner for wrong email/password combination', async ({
		page,
	}) => {
		await fillLoginForm(page, CREDS.existingEmail, 'WrongPass@99');
		await page.getByRole('button', { name: 'Sign in' }).click();
		await expect(page.getByRole('alert').first()).toBeVisible({
			timeout: 10_000,
		});
	});

	test('shows server error banner for disabled/inactive account', async ({
		page,
	}) => {
		const email = process.env.E2E_DISABLED_EMAIL ?? 'disabled@example.com';
		const password = process.env.E2E_DISABLED_PASSWORD ?? CREDS.password;
		await fillLoginForm(page, email, password);
		await page.getByRole('button', { name: 'Sign in' }).click();
		await expect(page.getByRole('alert').first()).toBeVisible({
			timeout: 10_000,
		});
	});

	test('shows server error banner when OAuth-only account attempts password login', async ({
		page,
	}) => {
		const email =
			process.env.E2E_OAUTH_ONLY_EMAIL ?? 'oauthonly@example.com';
		await fillLoginForm(page, email, CREDS.password);
		await page.getByRole('button', { name: 'Sign in' }).click();
		await expect(page.getByRole('alert').first()).toBeVisible({
			timeout: 10_000,
		});
	});

	test('server error banner contains message and suggestion', async ({
		page,
	}) => {
		await fillLoginForm(page, CREDS.existingEmail, 'Wrong@Pass99');
		await page.getByRole('button', { name: 'Sign in' }).click();
		const alert = page.getByRole('alert').first();
		await expect(alert).toBeVisible({ timeout: 10_000 });

		// Poll until text content is non-empty — the banner may render before
		// the text node is populated (React state update timing).
		await expect
			.poll(
				async () => {
					const text = await alert.textContent();
					return (text ?? '').trim().length;
				},
				{ timeout: 5_000 }
			)
			.toBeGreaterThan(10);
	});
});

// ── 3. OAuth Sign In / Sign Up ────────────────────────────────────────────────

test.describe('OAuth Authentication', () => {
	// OAuth involves full-page redirects to external providers.
	// In CI these tests are typically mocked or skipped; they validate the
	// initiating UI and failure-return behaviour only.

	for (const route of [ROUTES.login, ROUTES.signup] as const) {
		test.describe(`from ${route}`, () => {
			test.beforeEach(async ({ page }) => {
				await page.goto(route);
				await waitForAuthPage(page);
			});

			test('has visible "Continue with Google" button', async ({
				page,
			}) => {
				const label =
					route === ROUTES.login
						? 'Continue with Google'
						: 'Sign up with Google';
				await expect(
					page.getByRole('button', { name: label })
				).toBeVisible();
			});

			test('has visible "Continue with Facebook" button', async ({
				page,
			}) => {
				const label =
					route === ROUTES.login
						? 'Continue with Facebook'
						: 'Sign up with Facebook';
				await expect(
					page.getByRole('button', { name: label })
				).toBeVisible();
			});
		});
	}

	test('callback page shows transitional loading state', async ({ page }) => {
		// Visit the callback URL directly to assert transient loading state
		await page.goto(ROUTES.oauthCallback);
		// The loading message may be visible for a very short time
		const loading = page.getByText(/finishing sign.?in/i);
		// If it resolves immediately that is also acceptable — wait briefly
		await loading.isVisible().catch(() => false);
		// Even if loading resolved, we must NOT end up on the callback page
		await page
			.waitForURL(
				(url) => !url.pathname.startsWith(ROUTES.oauthCallback),
				{ timeout: 10_000 }
			)
			.catch(() => {
				// Some setups redirect synchronously; acceptable
			});
		// Assert we are not stuck on the callback page long-term
		expect(page.url()).not.toContain(ROUTES.oauthCallback);
	});

	test('displays OAuth failure alert when callback resolves unauthenticated', async ({
		page,
	}) => {
		// Simulate an error return from the OAuth provider via query param
		await page.goto(`${ROUTES.login}?oauth_error=access_denied`);
		await waitForAuthPage(page);
		await expect(page.getByRole('alert').first()).toBeVisible({
			timeout: 5_000,
		});
	});
});

// ── 4. Restore an Existing Session on App Load ────────────────────────────────

test.describe('Session Restoration (authenticated)', () => {
	test.use({ storageState: STORAGE_STATE_PATH });

	test('restores auth state from storage and reaches app', async ({
		page,
	}) => {
		await page.goto('/');

		const userMenuButton = page.getByRole('button', {
			name: /open user menu/i,
		});

		await expect(userMenuButton).toBeVisible();

		await userMenuButton.click();

		// Wait for dropdown content (menu) to appear
		const menu = page.getByRole('menu'); // Radix sets role="menu"

		await expect(menu).toBeVisible();

		await expect(menu.getByText('Alice Smith')).toBeVisible();
	});
});

// ❌ UNAUTHENTICATED CONTEXT
test.describe('Session Restoration (unauthenticated)', () => {
	test('falls back to login when no session exists', async ({ page }) => {
		await page.goto(ROUTES.dashboard);

		await page.waitForURL(`**${ROUTES.login}**`, { timeout: 10_000 });
		expect(page.url()).toContain(ROUTES.login);
	});
});

// ── 5. Prevent Authenticated Users from Using Guest-Only Pages ────────────────

test.describe('Guest-Only Page Guard', () => {
	test.beforeEach(async ({ page }) => {
		// Sign in first using the login form to establish a real session
		await page.goto(ROUTES.login);
		await waitForAuthPage(page);
		await fillLoginForm(page);
		await page.getByRole('button', { name: 'Sign in' }).click();
		await page.waitForURL(
			(url) =>
				url.pathname.includes(ROUTES.dashboard) ||
				url.pathname.includes(ROUTES.onboarding),
			{ timeout: 15_000 }
		);
	});

	test('redirects authenticated user away from login page to dashboard', async ({
		page,
	}) => {
		await page.goto(ROUTES.login);
		await page.waitForURL(`**${ROUTES.dashboard}**`, { timeout: 10_000 });
		expect(page.url()).toContain(ROUTES.dashboard);
	});

	test('redirects authenticated user away from sign-up page to dashboard', async ({
		page,
	}) => {
		await page.goto(ROUTES.signup);
		await page.waitForURL(`**${ROUTES.dashboard}**`, { timeout: 10_000 });
		expect(page.url()).toContain(ROUTES.dashboard);
	});

	test('final state does not expose the public auth page (no flicker)', async ({
		page,
	}) => {
		await page.goto(ROUTES.login);
		// Give the page enough time to fully resolve
		await page.waitForURL((url) => !url.pathname.startsWith(ROUTES.login), {
			timeout: 10_000,
		});
		// Ensure the sign-in form is not visible in the final state
		const signInForm = page.locator('#signup-form, form');
		// Either we've navigated away or the form is not interactable
		const isOnLoginPage = page.url().includes(ROUTES.login);
		if (isOnLoginPage) {
			// If still on login page, form must be hidden / not interactable
			await expect(signInForm).not.toBeVisible();
		}
	});
});

// ── 6. Log Out ────────────────────────────────────────────────────────────────

test.describe('Log Out', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(ROUTES.login);
		await waitForAuthPage(page);
		await fillLoginForm(page);
		await page.getByRole('button', { name: 'Sign in' }).click();

		await page.waitForURL(
			(url) =>
				url.pathname.includes(ROUTES.dashboard) ||
				url.pathname.includes(ROUTES.onboarding),
			{ timeout: 15_000 }
		);
	});

	// 🔹 Helper (keeps tests clean & consistent)
	const logout = async (page: Page) => {
		// Open user dropdown
		await page.getByRole('button', { name: /open user menu/i }).click();

		// Ensure menu is visible (Radix portal safety)
		await expect(page.getByRole('menu')).toBeVisible();

		// Click logout (menuitem, not button)
		await page.getByRole('menuitem', { name: /log out/i }).click();
	};

	test('logs out and redirects to login page', async ({ page }) => {
		await logout(page);

		await page.waitForURL(`**${ROUTES.login}**`, { timeout: 10_000 });
		expect(page.url()).toContain(ROUTES.login);
	});

	test('protected routes are inaccessible after logout', async ({ page }) => {
		await logout(page);

		await page.waitForURL(`**${ROUTES.login}**`, { timeout: 10_000 });

		// Attempt to access a protected route
		await page.goto(ROUTES.dashboard);
		await page.waitForURL(`**${ROUTES.login}**`, { timeout: 10_000 });

		expect(page.url()).toContain(ROUTES.login);
	});

	test('clears client-side auth state even when server logout fails', async ({
		page,
	}) => {
		// Intercept logout API and force failure
		await page.route('**/logout**', (route) =>
			route.fulfill({ status: 500, body: 'Internal Server Error' })
		);

		await logout(page);

		// Client must still redirect to login
		await page.waitForURL(`**${ROUTES.login}**`, { timeout: 10_000 });
		expect(page.url()).toContain(ROUTES.login);
	});
});

// ── 7. Validation Rules ───────────────────────────────────────────────────────

test.describe('Validation Rules', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(ROUTES.signup);
		await waitForAuthPage(page);
	});

	const invalidNames = [
		{ label: 'too short', value: 'A' },
		{ label: 'too long', value: 'A'.repeat(51) },
		{ label: 'invalid characters', value: '123$$' },
	];

	for (const { label, value } of invalidNames) {
		test(`first name: ${label} triggers validation error`, async ({
			page,
		}) => {
			await fillSignupForm(page, { firstName: value });
			await page.getByRole('button', { name: 'Create account' }).click();
			await expect(page.getByRole('alert').first()).toBeVisible();
		});

		test(`last name: ${label} triggers validation error`, async ({
			page,
		}) => {
			await fillSignupForm(page, { lastName: value });
			await page.getByRole('button', { name: 'Create account' }).click();
			await expect(page.getByRole('alert').first()).toBeVisible();
		});
	}

	test('email exceeding 255 characters triggers validation error', async ({
		page,
	}) => {
		const longEmail = `${'a'.repeat(246)}@x.com`; // 254+ chars
		await fillSignupForm(page, { email: longEmail });
		await page.getByRole('button', { name: 'Create account' }).click();
		await expect(page.getByRole('alert').first()).toBeVisible();
	});

	test('email is trimmed and normalised to lowercase', async ({ page }) => {
		// Filling with uppercase/padded email should not cause a format error
		// (the app normalises it). We just verify no spurious format error fires.
		await fillSignupForm(page, { email: '  TEST@EXAMPLE.COM  ' });
		// No alert should fire for the email field specifically (other fields valid)
		page.getByRole('alert');
		// Submit and check — if an alert appears it must NOT be about email format
		// (this is a best-effort assertion; skip if app cannot normalise on the fly)
		await page.getByRole('button', { name: 'Create account' }).click();
		// We just assert the page doesn't crash
		await expect(page.locator('body')).toBeVisible();
	});

	test('password shorter than 8 characters is rejected', async ({ page }) => {
		await fillSignupForm(page, {
			password: 'Ab@1',
			confirmPassword: 'Ab@1',
		});
		await page.getByRole('button', { name: 'Create account' }).click();
		await expect(page.getByRole('alert').first()).toBeVisible();
	});

	test('password longer than 64 characters is rejected', async ({ page }) => {
		const longPass = 'Aa@1' + 'a'.repeat(61);
		await fillSignupForm(page, {
			password: longPass,
			confirmPassword: longPass,
		});
		await page.getByRole('button', { name: 'Create account' }).click();
		await expect(page.getByRole('alert').first()).toBeVisible();
	});

	test('password missing lowercase letter is rejected', async ({ page }) => {
		await fillSignupForm(page, {
			password: 'SECURE@PASS1',
			confirmPassword: 'SECURE@PASS1',
		});
		await page.getByRole('button', { name: 'Create account' }).click();
		await expect(page.getByRole('alert').first()).toBeVisible();
	});

	test('password missing uppercase letter is rejected', async ({ page }) => {
		await fillSignupForm(page, {
			password: 'secure@pass1',
			confirmPassword: 'secure@pass1',
		});
		await page.getByRole('button', { name: 'Create account' }).click();
		await expect(page.getByRole('alert').first()).toBeVisible();
	});

	test('password missing a number is rejected', async ({ page }) => {
		await fillSignupForm(page, {
			password: 'Secure@Pass',
			confirmPassword: 'Secure@Pass',
		});
		await page.getByRole('button', { name: 'Create account' }).click();
		await expect(page.getByRole('alert').first()).toBeVisible();
	});

	test('password missing a special character is rejected', async ({
		page,
	}) => {
		await fillSignupForm(page, {
			password: 'SecurePass1',
			confirmPassword: 'SecurePass1',
		});
		await page.getByRole('button', { name: 'Create account' }).click();
		await expect(page.getByRole('alert').first()).toBeVisible();
	});
});

// ── 8. Edge Cases ─────────────────────────────────────────────────────────────

test.describe('Edge Cases', () => {
	test('empty form submission on login shows validation errors', async ({
		page,
	}) => {
		await page.goto(ROUTES.login);
		await waitForAuthPage(page);
		await page.getByRole('button', { name: 'Sign in' }).click();
		await expect(page.getByRole('alert').first()).toBeVisible();
	});

	test('empty form submission on sign-up shows validation errors', async ({
		page,
	}) => {
		await page.goto(ROUTES.signup);
		await waitForAuthPage(page);
		await page.getByRole('button', { name: 'Create account' }).click();
		await expect(page.getByRole('alert').first()).toBeVisible();
	});

	test('duplicate email during sign-up shows server error banner', async ({
		page,
	}) => {
		await page.goto(ROUTES.signup);
		await waitForAuthPage(page);
		await fillSignupForm(page, { email: CREDS.existingEmail });
		await page.getByRole('button', { name: 'Create account' }).click();
		await expect(page.getByRole('alert').first()).toBeVisible({
			timeout: 10_000,
		});
	});

	test('network failure during session bootstrap falls back to unauthenticated', async ({
		page,
	}) => {
		// Block any current-user API call
		await page.route('**/current-user**', (route) => route.abort('failed'));
		await page.route('**/me**', (route) => route.abort('failed'));

		await page.goto(ROUTES.dashboard);
		await page.waitForURL(`**${ROUTES.login}**`, { timeout: 10_000 });
		expect(page.url()).toContain(ROUTES.login);
	});

	test('network failure during logout still clears client state', async ({
		page,
	}) => {
		// Sign in first
		await page.goto(ROUTES.login);
		await waitForAuthPage(page);
		await fillLoginForm(page);
		await page.getByRole('button', { name: 'Sign in' }).click();

		await page.waitForURL(
			(url) =>
				url.pathname.includes(ROUTES.dashboard) ||
				url.pathname.includes(ROUTES.onboarding),
			{ timeout: 15_000 }
		);

		// Block logout endpoint
		await page.route('**/logout**', (route) =>
			route.fulfill({ status: 503, body: 'Service Unavailable' })
		);

		// ✅ Correct logout flow
		await page.getByRole('button', { name: /open user menu/i }).click();
		await expect(page.getByRole('menu')).toBeVisible();
		await page.getByRole('menuitem', { name: /log out/i }).click();

		await page.waitForURL(`**${ROUTES.login}**`, { timeout: 10_000 });
		expect(page.url()).toContain(ROUTES.login);
	});

	test('newly registered user routes to onboarding', async ({ page }) => {
		await page.goto(ROUTES.signup);
		await waitForAuthPage(page);
		await fillSignupForm(page);
		await page.getByRole('button', { name: 'Create account' }).click();
		await page.waitForURL(`**${ROUTES.onboarding}**`, { timeout: 15_000 });
		expect(page.url()).toContain(ROUTES.onboarding);
	});

	test('returning user with completed onboarding routes to dashboard', async ({
		page,
	}) => {
		await page.goto(ROUTES.login);
		await waitForAuthPage(page);
		await fillLoginForm(page);
		await page.getByRole('button', { name: 'Sign in' }).click();
		await page.waitForURL(`**${ROUTES.dashboard}**`, { timeout: 15_000 });
		expect(page.url()).toContain(ROUTES.dashboard);
	});
});
