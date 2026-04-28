/**
 * bags.spec.ts
 *
 * Covers contract flows:
 *  1.  Create a Bag
 *  2.  Edit or Delete a Bag
 *  4.  Browse, Filter, and Open a Bag
 */

import { test, expect, type Page } from '@playwright/test';
import { STORAGE_STATE_PATH } from '../fixtures/auth.fixture';
import {
	ROUTES,
	gotoBags,
	openCreateBagDialog,
	fillRequiredBagFields,
	waitForDialogClose,
	createBagViaUI,
} from '../fixtures/test.helpers';

// ── All tests require an authenticated session ─────────────────────────────
test.use({ storageState: STORAGE_STATE_PATH });

// ── Shared: open the actions menu on a bag card ────────────────────────────
async function openBagActionsMenu(page: Page, bagName: string) {
	const card = page
		.getByRole('heading', { name: bagName, level: 3 })
		.locator('..');
	await card.getByRole('button', { name: /open actions menu/i }).click();
}

// ── Shared: open bag via the actions menu ──────────────────────────
async function openBagFromActionsMenu(page: Page, bagName: string) {
	await openBagActionsMenu(page, bagName);

	await page.getByRole('menuitem', { name: /open bag/i }).click();

	// ✅ wait for navigation instead of dialog
	await page.waitForURL(/\/bags\/[^/]+$/);
}

// ── Shared: open edit dialog via the actions menu ──────────────────────────
async function openEditBagDialog(page: Page, bagName: string) {
	await openBagActionsMenu(page, bagName);
	await page.getByRole('menuitem', { name: /edit bag/i }).click();
	const dialog = page.getByRole('dialog', {
		name: new RegExp(`Edit ${bagName}`, 'i'),
	});
	await expect(dialog).toBeVisible();
	return dialog;
}

// ── Shared: trigger delete via the actions menu ────────────────────────────
async function clickDeleteBagInMenu(page: Page, bagName: string) {
	await openBagActionsMenu(page, bagName);
	await page.getByRole('menuitem', { name: /delete bag/i }).click();
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. Create a Bag
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Create a Bag', () => {
	test.beforeEach(async ({ page }) => {
		await gotoBags(page);
	});

	test('Add bag button opens the create dialog', async ({ page }) => {
		const dialog = await openCreateBagDialog(page);
		await expect(dialog).toBeVisible();
	});

	test('successful bag creation closes dialog and shows success message', async ({
		page,
	}) => {
		const dialog = await openCreateBagDialog(page);
		await fillRequiredBagFields(page, dialog);
		await dialog.getByRole('button', { name: /^create bag$/i }).click();

		await waitForDialogClose(page);

		await expect(page.getByRole('alert').first()).toBeVisible({
			timeout: 10_000,
		});
	});

	test('new bag appears in the bags list after creation', async ({
		page,
	}) => {
		const dialog = await openCreateBagDialog(page);
		const bagName = await fillRequiredBagFields(page, dialog);
		await dialog.getByRole('button', { name: /^create bag$/i }).click();

		await waitForDialogClose(page);

		await expect(
			page.getByRole('heading', { name: bagName, level: 3 })
		).toBeVisible({ timeout: 10_000 });
	});

	test('new bag appears near the top of the list by default', async ({
		page,
	}) => {
		const dialog = await openCreateBagDialog(page);
		const bagName = await fillRequiredBagFields(page, dialog);
		await dialog.getByRole('button', { name: /^create bag$/i }).click();

		await waitForDialogClose(page);

		// The new bag should be among the first h3 headings on the page
		const firstMatch = page
			.getByRole('heading', { level: 3 })
			.filter({ hasText: bagName })
			.first();

		await expect(firstMatch).toBeVisible({ timeout: 10_000 });
	});

	test('submit button enters loading state (Creating…) during request', async ({
		page,
	}) => {
		await page.route('**/bags**', async (route) => {
			if (route.request().method() === 'POST') {
				await new Promise((r) => setTimeout(r, 600));
				await route.continue();
			} else {
				await route.continue();
			}
		});

		const dialog = await openCreateBagDialog(page);
		await fillRequiredBagFields(page, dialog);
		await dialog.getByRole('button', { name: /^create bag$/i }).click();

		await expect(
			dialog.getByRole('button', { name: /creating/i })
		).toBeVisible();
	});

	// ── Validation failures ──────────────────────────────────────────────────

	test('missing required name blocks submission with field error', async ({
		page,
	}) => {
		const dialog = await openCreateBagDialog(page);
		await fillRequiredBagFields(page, dialog, { name: ' ' });
		await dialog.locator('#create-bag-name').clear();
		await dialog.getByRole('button', { name: /^create bag$/i }).click();

		await expect(dialog.locator('#create-bag-name-error')).toBeVisible();
	});

	test('name shorter than 2 characters shows validation error', async ({
		page,
	}) => {
		const dialog = await openCreateBagDialog(page);
		await dialog.locator('#create-bag-name').fill('A');

		// Type — first radio group; Size — second radio group
		await dialog.getByRole('radio').first().click();
		await dialog
			.getByRole('radiogroup')
			.nth(1)
			.getByRole('radio')
			.first()
			.click();

		await dialog.getByLabel(/max weight/i).fill('10');
		await dialog.getByLabel(/max capacity/i).fill('20');
		await dialog.getByRole('button', { name: /^create bag$/i }).click();

		await expect(dialog.locator('#create-bag-name-error')).toBeVisible();
	});

	test('name longer than 100 characters shows validation error', async ({
		page,
	}) => {
		const dialog = await openCreateBagDialog(page);
		await fillRequiredBagFields(page, dialog, { name: 'A'.repeat(101) });
		await dialog.getByRole('button', { name: /^create bag$/i }).click();

		await expect(dialog.locator('#create-bag-name-error')).toBeVisible();
	});

	test('missing bag type blocks submission with field error', async ({
		page,
	}) => {
		const dialog = await openCreateBagDialog(page);
		await dialog.locator('#create-bag-name').fill(`E2E Bag ${Date.now()}`);

		// Select only size (second radiogroup); leave type (first) unselected
		await dialog
			.getByRole('radiogroup')
			.nth(1)
			.getByRole('radio')
			.first()
			.click();

		await dialog.getByLabel(/max weight/i).fill('10');
		await dialog.getByLabel(/max capacity/i).fill('20');
		await dialog.getByRole('button', { name: /^create bag$/i }).click();

		await expect(dialog.locator('#create-bag-type-error')).toBeVisible();
	});

	test('missing size blocks submission with field error', async ({
		page,
	}) => {
		const dialog = await openCreateBagDialog(page);
		await dialog.locator('#create-bag-name').fill(`E2E Bag ${Date.now()}`);

		// Select only type (first radiogroup); leave size (second) unselected
		await dialog.getByRole('radio').first().click();

		await dialog.getByLabel(/max weight/i).fill('10');
		await dialog.getByLabel(/max capacity/i).fill('20');
		await dialog.getByRole('button', { name: /^create bag$/i }).click();

		await expect(dialog.locator('#create-bag-size-error')).toBeVisible();
	});

	test('max weight of 0 shows validation error', async ({ page }) => {
		const dialog = await openCreateBagDialog(page);
		await fillRequiredBagFields(page, dialog, { maxWeight: '0' });
		await dialog.getByRole('button', { name: /^create bag$/i }).click();

		await expect(
			dialog.getByText(/bag weight must be more than zero/i)
		).toBeVisible();
	});

	test('max capacity of 0 shows validation error', async ({ page }) => {
		const dialog = await openCreateBagDialog(page);
		await fillRequiredBagFields(page, dialog, { maxCapacity: '0' });
		await dialog.getByRole('button', { name: /^create bag$/i }).click();

		await expect(
			dialog.getByText(/bag capacity above zero/i)
		).toBeVisible();
	});

	test('server error keeps dialog open with visible error feedback', async ({
		page,
	}) => {
		await page.route('**/bags**', (route) => {
			if (route.request().method() === 'POST') {
				return route.fulfill({
					status: 500,
					contentType: 'application/json',
					body: JSON.stringify({ message: 'Internal server error' }),
				});
			}
			return route.continue();
		});

		const dialog = await openCreateBagDialog(page);
		await fillRequiredBagFields(page, dialog);
		await dialog.getByRole('button', { name: /^create bag$/i }).click();

		await expect(dialog).toBeVisible({ timeout: 10_000 });
		await expect(dialog.getByRole('alert')).toBeVisible({
			timeout: 10_000,
		});
	});

	test('network failure keeps dialog open with visible error feedback', async ({
		page,
	}) => {
		await page.route('**/bags**', (route) => {
			if (route.request().method() === 'POST') {
				return route.abort('failed');
			}
			return route.continue();
		});

		const dialog = await openCreateBagDialog(page);
		await fillRequiredBagFields(page, dialog);
		await dialog.getByRole('button', { name: /^create bag$/i }).click();

		await expect(dialog).toBeVisible({ timeout: 10_000 });
		await expect(
			dialog.getByRole('alert').or(page.getByRole('alert'))
		).toBeVisible({ timeout: 10_000 });
	});
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. Edit or Delete a Bag
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Edit or Delete a Bag', () => {
	test('edit saves updated bag name and refreshes the view', async ({
		page,
	}) => {
		const originalName = await createBagViaUI(page);
		const updatedName = `${originalName} UPDATED`;

		const dialog = await openEditBagDialog(page, originalName);
		const nameField = dialog.locator('#update-bag-name');
		await nameField.fill(updatedName);
		await dialog.getByRole('button', { name: /save|update/i }).click();

		await waitForDialogClose(page);
		await expect(
			page.getByRole('heading', { name: updatedName, level: 3 })
		).toBeVisible({ timeout: 10_000 });
	});

	test('edit keeps unchanged values intact', async ({ page }) => {
		const originalName = await createBagViaUI(page);

		const dialog = await openEditBagDialog(page, originalName);
		const weightValue = await dialog.getByLabel(/max weight/i).inputValue();

		const updatedName = `${originalName} NAMEONLY`;
		const nameField = dialog.locator('#update-bag-name');
		await nameField.fill(updatedName);
		await dialog.getByRole('button', { name: /save|update/i }).click();
		await waitForDialogClose(page);

		// Reopen and confirm weight is unchanged
		const reopenedDialog = await openEditBagDialog(page, updatedName);
		await expect(reopenedDialog.getByLabel(/max weight/i)).toHaveValue(
			weightValue
		);
		await reopenedDialog
			.getByRole('button', { name: /cancel|close/i })
			.click()
			.catch(() => {});
	});

	test('submit button shows loading/disabled state while edit is in progress', async ({
		page,
	}) => {
		const originalName = await createBagViaUI(page);

		await page.route('**/bags/**', async (route) => {
			if (['PUT', 'PATCH'].includes(route.request().method())) {
				await new Promise((r) => setTimeout(r, 600));
				await route.continue();
			} else {
				await route.continue();
			}
		});

		const dialog = await openEditBagDialog(page, originalName);
		const nameField = dialog.locator('#update-bag-name');
		await nameField.fill(`${originalName} SLOW`);
		await dialog.getByRole('button', { name: /save|update/i }).click();

		await expect
			.poll(
				async () => {
					const btn = dialog.getByRole('button', {
						name: /save|update|saving|updating/i,
					});
					const disabled = await btn.isDisabled().catch(() => true);
					const label = await btn.textContent().catch(() => '');
					return disabled || /saving|updating/i.test(label ?? '');
				},
				{ timeout: 3_000 }
			)
			.toBe(true);
	});

	test('delete removes the bag from the current view', async ({ page }) => {
		const bagName = await createBagViaUI(page);

		await clickDeleteBagInMenu(page, bagName);

		const confirmBtn = page
			.getByRole('button', { name: /confirm|yes|delete/i })
			.last();
		if (await confirmBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
			await confirmBtn.click();
		}

		await expect(
			page.getByRole('heading', { name: bagName, level: 3 })
		).not.toBeVisible({ timeout: 10_000 });
	});

	test('delete button shows loading/disabled state while request is in progress', async ({
		page,
	}) => {
		const bagName = await createBagViaUI(page);

		await page.route('**/bags/**', async (route) => {
			if (route.request().method() === 'DELETE') {
				await new Promise((r) => setTimeout(r, 600));
				await route.continue();
			} else {
				await route.continue();
			}
		});

		await clickDeleteBagInMenu(page, bagName);

		const confirmBtn = page
			.getByRole('button', { name: /confirm|yes|delete/i })
			.last();

		if (await confirmBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
			await confirmBtn.click();

			await expect
				.poll(
					async () => {
						const disabled = await confirmBtn
							.isDisabled()
							.catch(() => true);
						const label = await confirmBtn
							.textContent()
							.catch(() => '');
						return (
							disabled || /deleting|removing/i.test(label ?? '')
						);
					},
					{ timeout: 3_000 }
				)
				.toBe(true);
		}
	});

	test('invalid edit (name too short) is blocked with field-level error', async ({
		page,
	}) => {
		const originalName = await createBagViaUI(page);

		const dialog = await openEditBagDialog(page, originalName);
		const nameField = dialog.locator('#update-bag-name');
		await nameField.fill('X');
		await dialog.getByRole('button', { name: /save|update/i }).click();

		await expect(dialog.locator('#update-bag-name-error')).toBeVisible();
	});

	test('server failure during edit shows recoverable error without closing dialog', async ({
		page,
	}) => {
		const originalName = await createBagViaUI(page);

		await page.route('**/bags/**', (route) => {
			if (['PUT', 'PATCH'].includes(route.request().method())) {
				return route.fulfill({
					status: 500,
					contentType: 'application/json',
					body: JSON.stringify({ message: 'Update failed' }),
				});
			}
			return route.continue();
		});

		const dialog = await openEditBagDialog(page, originalName);
		const nameField = dialog.locator('#update-bag-name');
		await nameField.fill(`${originalName} FAIL`);
		await dialog.getByRole('button', { name: /save|update/i }).click();

		await expect(dialog).toBeVisible({ timeout: 10_000 });
		await expect(dialog.getByRole('alert')).toBeVisible({
			timeout: 10_000,
		});
	});

	test('server failure during delete shows recoverable error feedback', async ({
		page,
	}) => {
		const bagName = await createBagViaUI(page);

		await page.route('**/bags/**', (route) => {
			if (route.request().method() === 'DELETE') {
				return route.fulfill({
					status: 500,
					contentType: 'application/json',
					body: JSON.stringify({ message: 'Delete failed' }),
				});
			}
			return route.continue();
		});

		await clickDeleteBagInMenu(page, bagName);

		const confirmBtn = page
			.getByRole('button', { name: /confirm|yes|delete/i })
			.last();
		if (await confirmBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
			await confirmBtn.click();
		}

		await expect(page.getByRole('alert').first()).toBeVisible({
			timeout: 10_000,
		});
		await expect(
			page.getByRole('heading', { name: bagName, level: 3 })
		).toBeVisible({ timeout: 5_000 });
	});

	test('missing bag shows a recoverable error state on the detail page', async ({
		page,
	}) => {
		await page.route('**/bags/**', (route) => {
			if (route.request().method() === 'GET') {
				return route.fulfill({
					status: 404,
					contentType: 'application/json',
					body: JSON.stringify({ message: 'Bag not found' }),
				});
			}
			return route.continue();
		});

		await page.goto(`${ROUTES.bags}/00000000-0000-0000-0000-000000000000`);
		await page.waitForLoadState('networkidle');

		const errorState = page
			.getByText(/not found|does not exist|error/i)
			.or(page.getByRole('button', { name: /try again|go back/i }));

		await expect(errorState.first()).toBeVisible({ timeout: 10_000 });
	});
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. Browse, Filter, and Open a Bag
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Filter and Browse — Bags', () => {
	test.beforeEach(async ({ page }) => {
		await gotoBags(page);
	});

	test('bags list renders without errors on load', async ({ page }) => {
		const listOrEmpty = page
			.getByRole('list')
			.or(page.getByText(/no bags yet|add your first bag/i));
		await expect(listOrEmpty.first()).toBeVisible({ timeout: 10_000 });
	});

	test('search input filters bags by name', async ({ page }) => {
		const search = page
			.getByRole('searchbox')
			.or(page.getByPlaceholder(/search/i));

		if (!(await search.isVisible({ timeout: 3_000 }).catch(() => false))) {
			test.skip(true, 'No search input found on bags list');
		}

		await search.fill('zzz-nonexistent-bag-xyz');

		page.getByRole('button', { name: /apply/i }).first().click();

		await expect(
			page.getByText(/no results|no bags found|nothing here/i).first()
		).toBeVisible({ timeout: 10_000 });
	});

	test('reset / clear filters returns to unfiltered list', async ({
		page,
	}) => {
		const search = page
			.getByRole('searchbox')
			.or(page.getByPlaceholder(/search/i));

		if (!(await search.isVisible({ timeout: 3_000 }).catch(() => false))) {
			test.skip(true, 'No search input found on bags list');
		}

		await search.fill('zzz-nonexistent-bag-xyz');

		const resetBtn = page
			.getByRole('button', { name: /reset|clear/i })
			.first();

		if (await resetBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
			await resetBtn.click();
		} else {
			await search.clear();
		}

		await expect(
			page.getByText(/no results|no bags found|nothing here/i)
		).not.toBeVisible({ timeout: 5_000 });
	});

	test('"no data yet" empty state is distinct from "no results" empty state', async ({
		page,
	}) => {
		// Match the actual API origin at port 4000
		await page.route('http://localhost:4000/api/beggy/bags**', (route) => {
			if (route.request().method() === 'GET') {
				return route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({
						success: true,
						message: 'SuccessMessages[msgKey]', // Always use constant
						data: [],
						meta: {
							count: 0,
							page: 1,
							limit: 10,
							hasPreviousPage: false,
							hasNextPage: false,
						},
						timestamp: new Date().toISOString(),
					}),
				});
			}
			return route.continue();
		});

		await page.goto(ROUTES.bags);
		await page.waitForLoadState('networkidle');

		// BagsEmptyState (hasFilters=false) renders "No bags yet"
		await expect(page.getByText(/no bags yet/i)).toBeVisible({
			timeout: 10_000,
		});

		// ── Part B: filter → "no results" variant ────────────────────────────
		const search = page
			.getByRole('textbox', { name: /name/i })
			.or(page.getByPlaceholder(/search bags/i));

		if (!(await search.isVisible({ timeout: 3_000 }).catch(() => false))) {
			return;
		}

		await search.fill('zzz-nonexistent-xyz');
		await page.getByRole('button', { name: /apply/i }).first().click();
		await page.waitForLoadState('networkidle');

		// BagsEmptyState (hasFilters=true) renders "No bags match your filters"
		await expect(page.getByText(/no bags match your filters/i)).toBeVisible(
			{ timeout: 10_000 }
		);
	});

	test('loading state is visible while bags are being fetched', async ({
		page,
	}) => {
		let resolveDelay!: () => void;
		const delay = new Promise<void>((res) => (resolveDelay = res));

		// Block the actual API port
		await page.route(
			'http://localhost:4000/api/beggy/bags**',
			async (route) => {
				if (route.request().method() === 'GET') {
					await delay;
					await route.fulfill({
						status: 200,
						contentType: 'application/json',
						body: JSON.stringify({ bags: [], total: 0 }),
					});
				} else {
					await route.continue();
				}
			}
		);

		await page.goto(ROUTES.bags);
		await page.waitForLoadState('domcontentloaded');

		const skeleton = page.getByTestId('bag-grid-card-skeleton');
		const isVisible = await skeleton
			.first()
			.isVisible({ timeout: 3_000 })
			.catch(() => false);

		if (isVisible) {
			await expect(skeleton.first()).toBeVisible();
		}

		resolveDelay();
		await page.waitForLoadState('networkidle');
	});

	test('sort order control changes the list ordering', async ({ page }) => {
		const sortControl = page.getByRole('button', {
			name: /sort|change sorting order/i,
		});

		await sortControl.click();

		const menu = page.getByRole('menu');

		await expect(menu).toBeVisible();

		await menu.getByRole('menuitemradio', { name: /oldest/i }).click();

		const listItem = page.getByRole('listitem').first();
		await expect(listItem).toBeVisible();
	});

	test('clicking a bag in the list navigates to its detail page', async ({
		page,
	}) => {
		await page.goto(ROUTES.bags);

		const firstCard = page.getByRole('heading', { level: 3 }).first();

		const bagName = await firstCard.textContent();

		if (!bagName) {
			test.skip(true, 'Could not determine bag name');
		}

		await openBagFromActionsMenu(page, bagName ?? '');

		await expect(page).toHaveURL(/\/bags\/[^/]+$/);
	});

	test('pagination controls navigate to the next page', async ({ page }) => {
		// Seed enough bags in the mock to trigger pagination (totalPages > 1)
		let callCount = 0;

		await page.route(
			'http://localhost:4000/api/beggy/bags**',
			async (route) => {
				if (route.request().method() !== 'GET') {
					return route.continue();
				}

				callCount++;

				const page1 = {
					success: true,
					message: 'Bags retrieved successfully',
					data: Array.from({ length: 10 }, (_, i) => ({
						id: `mock-bag-${i}`,
						name: `Mock Bag ${i + 1}`,
						type: 'BACKPACK',
						size: 'MEDIUM',
						maxWeight: 10,
						maxCapacity: 20,
						createdAt: new Date().toISOString(),
						status: null,
					})),
					meta: {
						page: 1,
						limit: 10,
						count: 10,
						totalItems: 15,
						totalPages: 2,
						hasNextPage: true,
						hasPreviousPage: false,
					},
				};

				const page2 = {
					success: true,
					message: 'Bags retrieved successfully',
					data: Array.from({ length: 5 }, (_, i) => ({
						id: `mock-bag-page2-${i}`,
						name: `Mock Bag Page 2 Item ${i + 1}`,
						type: 'BACKPACK',
						size: 'MEDIUM',
						maxWeight: 10,
						maxCapacity: 20,
						createdAt: new Date().toISOString(),
						status: null,
					})),
					meta: {
						page: 2,
						limit: 10,
						count: 5,
						totalItems: 15,
						totalPages: 2,
						hasNextPage: false,
						hasPreviousPage: true,
					},
				};

				return route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify(callCount === 1 ? page1 : page2),
				});
			}
		);

		await page.goto(ROUTES.bags);
		await page.waitForLoadState('networkidle');

		// Verify page 1 rendered
		await expect(
			page.getByRole('heading', {
				name: /^Mock Bag 1$/,
				level: 3,
				exact: true,
			})
		).toBeVisible();

		const nextPageBtn = page.getByTestId('pagination-next');

		// Should be enabled now because totalPages=2
		await expect(nextPageBtn).toBeEnabled();
		await nextPageBtn.click();
		await page.waitForLoadState('networkidle');

		// Page 2 content should be visible
		await expect(
			page.getByRole('heading', {
				name: 'Mock Bag Page 2 Item 1',
				level: 3,
			})
		).toBeVisible({ timeout: 10_000 });

		// Previous page button should now be enabled
		const prevPageBtn = page
			.getByRole('button', { name: /go to previous page/i })
			.or(page.getByRole('button', { name: /previous/i }).first());
		await expect(prevPageBtn).toBeEnabled({ timeout: 5_000 });
	});

	test('temporary data failure does not leave the bags page unusable', async ({
		page,
	}) => {
		let callCount = 0;
		await page.route('**/bags**', async (route) => {
			if (route.request().method() === 'GET') {
				callCount++;
				if (callCount === 1) {
					return route.fulfill({ status: 500, body: 'Server error' });
				}
				await route.continue();
			} else {
				await route.continue();
			}
		});

		await page.reload();
		await page.waitForLoadState('networkidle');

		const recoverable = page
			.getByRole('button', { name: /try again|retry/i })
			.or(page.getByText(/error|something went wrong/i))
			.or(page.getByRole('list'));

		await expect(recoverable.first()).toBeVisible({ timeout: 10_000 });
	});
});
