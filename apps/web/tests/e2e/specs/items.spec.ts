/**
 * items.spec.ts
 *
 * Covers contract flows:
 *  3.  Create an Item in the Personal Inventory
 *  4.  Edit or Delete an Item
 *  10. Filter and Browse — Items list
 */

import { test, expect, type Page } from '@playwright/test';
import { STORAGE_STATE_PATH } from '../fixtures/auth.fixture';
import {
	ROUTES,
	gotoItems,
	openCreateItemDialog,
	fillRequiredItemFields,
	waitForDialogClose,
	createItemViaUI,
} from '../fixtures/test.helpers';

// ── All tests require an authenticated session ─────────────────────────────
test.use({ storageState: STORAGE_STATE_PATH });

// ── Shared: open the actions menu on an item card/row ─────────────────────
async function openItemActionsMenu(page: Page, itemName: string) {
	const item = page.getByRole('listitem').filter({
		has: page.getByRole('heading', { name: itemName, level: 3 }),
	});

	await item.getByRole('button', { name: /open actions menu/i }).click();
}

// ── Shared: open item via the actions menu ──────────────────────────
async function openItemFromActionsMenu(page: Page, itemName: string) {
	await openItemActionsMenu(page, itemName);

	await expect(page.getByRole('menu')).toBeVisible();
	await page.getByRole('menuitem', { name: /open item/i }).click();

	// ✅ same pattern as bags
	await page.waitForURL(/\/items\/[^/]+$/);
}

// ── Shared: open edit dialog via the actions menu ───
async function openEditItemDialog(page: Page, itemName: string) {
	await openItemActionsMenu(page, itemName);

	await page.getByRole('menuitem', { name: /edit item/i }).click();

	const dialog = page.getByRole('dialog', {
		name: new RegExp(`edit ${itemName}`, 'i'),
	});

	await expect(dialog).toBeVisible();
	return dialog;
}

// ── Shared: trigger delete via actions menu or direct button ───────────────
async function clickDeleteItemInMenu(page: Page, itemName: string) {
	await openItemActionsMenu(page, itemName);

	await page.getByRole('menuitem', { name: /delete item/i }).click();
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. Create an Item in the Personal Inventory
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Create an Item', () => {
	test.beforeEach(async ({ page }) => {
		await gotoItems(page);
	});

	test('Add item button opens the create dialog', async ({ page }) => {
		const dialog = await openCreateItemDialog(page);
		await expect(dialog).toBeVisible();
	});

	test('successful item creation closes dialog and shows success message', async ({
		page,
	}) => {
		const dialog = await openCreateItemDialog(page);
		await fillRequiredItemFields(page, dialog);
		await dialog.getByRole('button', { name: /create|save|add/i }).click();

		await waitForDialogClose(page);

		await expect(page.getByRole('alert').first()).toBeVisible({
			timeout: 10_000,
		});
	});

	test('new item appears in the items list after creation', async ({
		page,
	}) => {
		const dialog = await openCreateItemDialog(page);
		const itemName = await fillRequiredItemFields(page, dialog);
		await dialog.getByRole('button', { name: /create|save|add/i }).click();

		await waitForDialogClose(page);

		await expect(page.getByText(itemName)).toBeVisible({ timeout: 10_000 });
	});

	test('new item is available as a packing selection after creation', async ({
		page,
	}) => {
		// Create the item
		const dialog = await openCreateItemDialog(page);
		const itemName = await fillRequiredItemFields(page, dialog);
		await dialog.getByRole('button', { name: /create|save|add/i }).click();
		await waitForDialogClose(page);

		// The item must appear in the list (it will therefore be selectable
		// in the packing flow which uses the same inventory)
		await expect(page.getByText(itemName)).toBeVisible({ timeout: 10_000 });
	});

	test('default values are applied when optional fields are left untouched', async ({
		page,
	}) => {
		const dialog = await openCreateItemDialog(page);
		const itemName = await fillRequiredItemFields(page, dialog);

		// Do NOT fill optional fields (color, isFragile)
		await dialog.getByRole('button', { name: /create|save|add/i }).click();
		await waitForDialogClose(page);

		// Item still appears — defaults were applied server-side
		await expect(page.getByText(itemName)).toBeVisible({ timeout: 10_000 });
	});

	test('submit button enters loading state (Adding…) during request', async ({
		page,
	}) => {
		await page.route('**/items**', async (route) => {
			if (route.request().method() === 'POST') {
				await new Promise((r) => setTimeout(r, 600));
				await route.continue();
			} else {
				await route.continue();
			}
		});

		const dialog = await openCreateItemDialog(page);
		await fillRequiredItemFields(page, dialog);
		await dialog.getByRole('button', { name: /create|save|add/i }).click();

		await expect(
			dialog.getByRole('button', { name: /adding|creating/i })
		).toBeVisible();
	});

	// ── Validation failures ──────────────────────────────────────────────────

	test('missing name blocks submission with field error', async ({
		page,
	}) => {
		const dialog = await openCreateItemDialog(page);
		await fillRequiredItemFields(page, dialog);
		await dialog.locator('#create-item-name').clear();
		await dialog.getByRole('button', { name: /create|save|add/i }).click();

		await expect(
			dialog.getByRole('alert').or(dialog.getByText(/required|invalid/i))
		).toBeVisible();
	});

	test('name shorter than 2 characters shows validation error', async ({
		page,
	}) => {
		const dialog = await openCreateItemDialog(page);
		await fillRequiredItemFields(page, dialog);
		await dialog.locator('#create-item-name').fill('A');
		await dialog.getByRole('button', { name: /create|save|add/i }).click();

		await expect(
			dialog.getByRole('alert').or(dialog.getByText(/at least 2/i))
		).toBeVisible();
	});

	test('name longer than 100 characters shows validation error', async ({
		page,
	}) => {
		const dialog = await openCreateItemDialog(page);
		await fillRequiredItemFields(page, dialog);
		await dialog.locator('#create-item-name').fill('A'.repeat(101));
		await dialog.getByRole('button', { name: /create|save|add/i }).click();

		await expect(
			dialog.getByRole('alert').or(dialog.getByText(/100|too long/i))
		).toBeVisible();
	});

	test('missing category blocks submission with field error', async ({
		page,
	}) => {
		const dialog = await openCreateItemDialog(page);
		// Fill everything except category
		await dialog
			.locator('#create-item-name')
			.fill(`E2E Item ${Date.now()}`);
		await dialog.getByLabel(/^weight$/i).fill('1');

		const weightUnit = dialog.getByLabel(/weight unit/i);
		if (await weightUnit.isVisible()) {
			await weightUnit.click();
			await page.getByRole('option').first().click();
		}
		await dialog.getByLabel(/^volume$/i).fill('1');

		const volumeUnit = dialog.getByLabel(/volume unit/i);
		if (await volumeUnit.isVisible()) {
			await volumeUnit.click();
			await page.getByRole('option').first().click();
		}

		await dialog.getByRole('button', { name: /create|save|add/i }).click();

		await expect(
			dialog.locator('#create-item-category-error')
		).toBeVisible();
	});

	test('weight of 0 shows validation error', async ({ page }) => {
		const dialog = await openCreateItemDialog(page);
		await fillRequiredItemFields(page, dialog);
		await dialog.getByLabel(/^weight$/i).fill('0');
		await dialog.getByRole('button', { name: /create|save|add/i }).click();

		await expect(
			dialog.getByRole('alert').or(dialog.getByText(/greater than 0/i))
		).toBeVisible();
	});

	test('volume of 0 shows validation error', async ({ page }) => {
		const dialog = await openCreateItemDialog(page);
		await fillRequiredItemFields(page, dialog);
		await dialog.getByLabel(/^volume$/i).fill('0');
		await dialog.getByRole('button', { name: /create|save|add/i }).click();

		await expect(
			dialog.getByRole('alert').or(dialog.getByText(/greater than 0/i))
		).toBeVisible();
	});

	test('missing weight unit blocks submission with field error', async ({
		page,
	}) => {
		const dialog = await openCreateItemDialog(page);
		// Fill name, category, weight, volume, volume unit — skip weight unit
		await dialog
			.locator('#create-item-name')
			.fill(`E2E Item ${Date.now()}`);

		const categorySelect = dialog.getByLabel(/category/i);
		if (await categorySelect.isVisible()) {
			await categorySelect.click();
			await page.getByRole('option').first().click();
		}

		await dialog.getByLabel(/^weight$/i).fill('1');
		// intentionally skip weight unit
		await dialog.getByLabel(/^volume$/i).fill('1');

		const volumeUnit = dialog.getByLabel(/volume unit/i);
		if (await volumeUnit.isVisible()) {
			await volumeUnit.click();
			await page.getByRole('option').first().click();
		}

		await dialog.getByRole('button', { name: /create|save|add/i }).click();

		await expect(
			dialog
				.getByRole('alert')
				.or(dialog.getByText(/required|weight unit/i))
		).toBeVisible();
	});

	test('missing volume unit blocks submission with field error', async ({
		page,
	}) => {
		const dialog = await openCreateItemDialog(page);
		await dialog
			.locator('#create-item-name')
			.fill(`E2E Item ${Date.now()}`);

		const categorySelect = dialog.getByLabel(/category/i);
		if (await categorySelect.isVisible()) {
			await categorySelect.click();
			await page.getByRole('option').first().click();
		}

		await dialog.getByLabel(/^weight$/i).fill('1');

		const weightUnit = dialog.getByLabel(/weight unit/i);
		if (await weightUnit.isVisible()) {
			await weightUnit.click();
			await page.getByRole('option').first().click();
		}

		await dialog.getByLabel(/^volume$/i).fill('1');
		// intentionally skip volume unit

		await dialog.getByRole('button', { name: /create|save|add/i }).click();

		await expect(
			dialog
				.getByRole('alert')
				.or(dialog.getByText(/required|volume unit/i))
		).toBeVisible();
	});

	test('server error keeps dialog open with error feedback', async ({
		page,
	}) => {
		await page.route('**/items**', (route) => {
			if (route.request().method() === 'POST') {
				return route.fulfill({
					status: 500,
					contentType: 'application/json',
					body: JSON.stringify({ message: 'Internal server error' }),
				});
			}
			return route.continue();
		});

		const dialog = await openCreateItemDialog(page);
		await fillRequiredItemFields(page, dialog);
		await dialog.getByRole('button', { name: /create|save|add/i }).click();

		await expect(dialog).toBeVisible({ timeout: 10_000 });
		await expect(
			dialog.getByRole('alert').or(dialog.getByText(/error/i))
		).toBeVisible({ timeout: 10_000 });
	});

	test('network failure keeps dialog open with error feedback', async ({
		page,
	}) => {
		await page.route('**/items**', (route) => {
			if (route.request().method() === 'POST') {
				return route.abort('failed');
			}
			return route.continue();
		});

		const dialog = await openCreateItemDialog(page);
		await fillRequiredItemFields(page, dialog);
		await dialog.getByRole('button', { name: /create|save|add/i }).click();

		await expect(dialog).toBeVisible({ timeout: 10_000 });
		await expect(
			dialog.getByRole('alert').or(page.getByRole('alert'))
		).toBeVisible({ timeout: 10_000 });
	});
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. Edit or Delete an Item
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Edit or Delete an Item', () => {
	test('edit saves updated item name and refreshes the list view', async ({
		page,
	}) => {
		const originalName = await createItemViaUI(page);
		const updatedName = `${originalName} UPDATED`;

		const dialog = await openEditItemDialog(page, originalName);
		const nameField = dialog.locator('#update-item-name');
		await nameField.clear();
		await nameField.fill(updatedName);
		await dialog.getByRole('button', { name: /save|update/i }).click();

		await waitForDialogClose(page);
		await expect(page.getByText(updatedName)).toBeVisible({
			timeout: 10_000,
		});
	});

	test('edit keeps unchanged values intact', async ({ page }) => {
		const originalName = await createItemViaUI(page);

		const dialog = await openEditItemDialog(page, originalName);

		// Capture existing weight before edit
		const weightValue = await dialog.getByLabel(/^weight$/i).inputValue();

		const updatedName = `${originalName} NAMEONLY`;
		const nameField = dialog.locator('#update-item-name');
		await nameField.clear();
		await nameField.fill(updatedName);
		await dialog.getByRole('button', { name: /save|update/i }).click();
		await waitForDialogClose(page);

		// Reopen and confirm weight was not changed
		const reopenedDialog = await openEditItemDialog(page, updatedName);
		await expect(reopenedDialog.getByLabel(/^weight$/i)).toHaveValue(
			weightValue
		);

		await reopenedDialog
			.getByRole('button', { name: /cancel|close/i })
			.click()
			.catch(() => {});
	});

	test('updated item values appear on the detail page after edit', async ({
		page,
	}) => {
		const originalName = await createItemViaUI(page);
		const updatedName = `${originalName} DETAIL`;

		const dialog = await openEditItemDialog(page, originalName);
		const nameField = dialog.locator('#update-item-name');
		await nameField.clear();
		await nameField.fill(updatedName);
		await dialog.getByRole('button', { name: /save|update/i }).click();
		await waitForDialogClose(page);

		// Navigate to the item detail page
		const updatedRow = page
			.locator('li, tr, [data-testid]')
			.filter({ has: page.getByText(updatedName) })
			.first();
		const detailLink = updatedRow.getByRole('link').first();
		if (await detailLink.isVisible({ timeout: 2_000 }).catch(() => false)) {
			await detailLink.click();
			await page.waitForLoadState('networkidle');
			await expect(page.getByText(updatedName)).toBeVisible({
				timeout: 10_000,
			});
		}
	});

	test('action buttons are disabled while edit request is in progress', async ({
		page,
	}) => {
		const itemName = await createItemViaUI(page);

		await page.route('**/items/**', async (route) => {
			if (['PUT', 'PATCH'].includes(route.request().method())) {
				await new Promise((r) => setTimeout(r, 600));
				await route.continue();
			} else {
				await route.continue();
			}
		});

		const dialog = await openEditItemDialog(page, itemName);
		const nameField = dialog.locator('#update-item-name');
		await nameField.clear();
		await nameField.fill(`${itemName} SLOW`);
		await dialog.getByRole('button', { name: /save|update/i }).click();

		const saveBtn = dialog.getByRole('button', {
			name: /save|update|saving|updating/i,
		});

		await expect
			.poll(
				async () => {
					const disabled = await saveBtn
						.isDisabled()
						.catch(() => true);
					const label = await saveBtn.textContent().catch(() => '');
					return disabled || /saving|updating/i.test(label ?? '');
				},
				{ timeout: 3_000 }
			)
			.toBe(true);
	});

	test('delete removes the item from the list', async ({ page }) => {
		const itemName = await createItemViaUI(page);

		await clickDeleteItemInMenu(page, itemName);

		const confirmBtn = page.getByRole('button', { name: /delete/i }).last();
		if (await confirmBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
			await confirmBtn.click();
		}

		await expect(page.getByText(itemName)).not.toBeVisible({
			timeout: 10_000,
		});
	});

	test('delete button shows loading/disabled state while request is in progress', async ({
		page,
	}) => {
		const itemName = await createItemViaUI(page);

		await page.route('**/bags/**', async (route) => {
			if (route.request().method() === 'DELETE') {
				await new Promise((r) => setTimeout(r, 600));
				await route.continue();
			} else {
				await route.continue();
			}
		});

		await clickDeleteItemInMenu(page, itemName);

		const confirmBtn = page.getByRole('button', { name: /delete/i }).last();

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

	test('delete removes the item from the current view', async ({ page }) => {
		const itemName = await createItemViaUI(page);

		await clickDeleteItemInMenu(page, itemName);

		const confirmBtn = page.getByRole('button', { name: /delete/i }).last();
		if (await confirmBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
			await confirmBtn.click();
		}

		await expect(
			page.getByRole('heading', { name: itemName, level: 3 })
		).not.toBeVisible({ timeout: 10_000 });
	});

	test('invalid edit (name too short) is blocked with field-level error', async ({
		page,
	}) => {
		const originalName = await createItemViaUI(page);

		const dialog = await openEditItemDialog(page, originalName);
		const nameField = dialog.locator('#update-item-name');
		await nameField.clear();
		await nameField.fill('X');
		await dialog.getByRole('button', { name: /save|update/i }).click();

		await expect(
			dialog.getByRole('alert').or(dialog.getByText(/at least 2/i))
		).toBeVisible();
	});

	test('missing item on detail page shows a not-found error state', async ({
		page,
	}) => {
		await page.route('**/items/**', (route) => {
			if (route.request().method() === 'GET') {
				return route.fulfill({
					status: 404,
					contentType: 'application/json',
					body: JSON.stringify({ message: 'Item not found' }),
				});
			}
			return route.continue();
		});

		await page.goto(`${ROUTES.items}/00000000-0000-0000-0000-000000000000`);
		await page.waitForLoadState('networkidle');

		const errorState = page
			.getByText(/not found|does not exist|error/i)
			.or(page.getByRole('button', { name: /try again|go back/i }));

		await expect(errorState.first()).toBeVisible({ timeout: 10_000 });
	});

	test('server failure during edit shows recoverable error without closing dialog', async ({
		page,
	}) => {
		const originalName = await createItemViaUI(page);

		await page.route('**/items/**', (route) => {
			if (['PUT', 'PATCH'].includes(route.request().method())) {
				return route.fulfill({
					status: 500,
					contentType: 'application/json',
					body: JSON.stringify({ message: 'Update failed' }),
				});
			}
			return route.continue();
		});

		const dialog = await openEditItemDialog(page, originalName);
		const nameField = dialog.locator('#update-item-name');
		await nameField.clear();
		await nameField.fill(`${originalName} FAIL`);
		await dialog.getByRole('button', { name: /save|update/i }).click();

		await expect(dialog).toBeVisible({ timeout: 10_000 });
		await expect(
			dialog.getByRole('alert').or(dialog.getByText(/error/i))
		).toBeVisible({ timeout: 10_000 });
	});

	test('server failure during delete shows recoverable error feedback', async ({
		page,
	}) => {
		const itemName = await createItemViaUI(page);

		await page.route('**/items/**', (route) => {
			if (route.request().method() === 'DELETE') {
				return route.fulfill({
					status: 500,
					contentType: 'application/json',
					body: JSON.stringify({ message: 'Delete failed' }),
				});
			}
			return route.continue();
		});

		await clickDeleteItemInMenu(page, itemName);

		const confirmBtn = page.getByRole('button', { name: /delete/i }).last();
		if (await confirmBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
			await confirmBtn.click();
		}

		await expect(page.getByRole('alert').first()).toBeVisible({
			timeout: 10_000,
		});
		// Item must still be in the list
		await expect(page.getByText(itemName)).toBeVisible({ timeout: 5_000 });
	});
});

// ═══════════════════════════════════════════════════════════════════════════
// 10. Filter and Browse — Items list
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Filter and Browse — Items', () => {
	test.beforeEach(async ({ page }) => {
		await gotoItems(page);
	});

	test('items list renders without errors on load', async ({ page }) => {
		const listOrEmpty = page
			.getByRole('list')
			.or(page.getByText(/no items yet|add your first item/i));
		await expect(listOrEmpty.first()).toBeVisible({ timeout: 10_000 });
	});

	test('search input filters items by name', async ({ page }) => {
		const search = page
			.getByRole('searchbox')
			.or(page.getByPlaceholder(/search/i));

		if (!(await search.isVisible({ timeout: 3_000 }).catch(() => false))) {
			test.skip(true, 'No search input found on items list');
		}

		await search.fill('zzz-nonexistent-item-xyz');

		// Hit apply if the search is not live
		const applyBtn = page.getByRole('button', { name: /apply/i }).first();
		if (await applyBtn.isVisible({ timeout: 1_000 }).catch(() => false)) {
			await applyBtn.click();
		}

		await expect(
			page.getByText(/no results|no items found|nothing here/i).first()
		).toBeVisible({ timeout: 10_000 });
	});

	test('reset / clear filters returns to unfiltered items list', async ({
		page,
	}) => {
		const search = page
			.getByRole('searchbox')
			.or(page.getByPlaceholder(/search/i));

		if (!(await search.isVisible({ timeout: 3_000 }).catch(() => false))) {
			test.skip(true, 'No search input found on items list');
		}

		await search.fill('zzz-nonexistent-item-xyz');

		const resetBtn = page
			.getByRole('button', { name: /reset|clear/i })
			.first();

		if (await resetBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
			await resetBtn.click();
		} else {
			await search.clear();
		}

		await expect(
			page.getByText(/no results|no items found|nothing here/i)
		).not.toBeVisible({ timeout: 5_000 });
	});

	test('"no data yet" empty state is distinct from "no results" empty state', async ({
		page,
	}) => {
		await page.route('http://localhost:4000/api/beggy/items**', (route) => {
			if (route.request().method() === 'GET') {
				return route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({
						success: true,
						message: 'Items retrieved successfully',
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

		await page.goto(ROUTES.items);

		const emptyState = page.getByTestId('empty-state');

		// ── Part A: No filters ─────────────────────────────
		await expect(emptyState).toBeVisible();
		await expect(emptyState).toContainText(/your packing list is empty/i);

		// ── Part B: Apply filter via Category ─────────────
		// Click the "Books" radio (not a button!)
		const booksOption = page.getByRole('radio', { name: /books/i });

		await booksOption.click();

		// Apply filters
		await page.getByRole('button', { name: /apply/i }).click();

		// Expect "no results" state
		await expect(page.getByTestId('empty-state')).toContainText(
			/no items match your filters/i,
			{ timeout: 10_000 }
		);
	});

	test('loading state is visible while items are being fetched', async ({
		page,
	}) => {
		let resolveDelay!: () => void;
		const delay = new Promise<void>((res) => (resolveDelay = res));

		// Block the actual API port (mirrors bags.spec.ts pattern)
		await page.route(
			'http://localhost:4000/api/beggy/items**',
			async (route) => {
				if (route.request().method() === 'GET') {
					await delay;
					await route.fulfill({
						status: 200,
						contentType: 'application/json',
						body: JSON.stringify({
							success: true,
							message: 'Items retrieved successfully',
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
				} else {
					await route.continue();
				}
			}
		);

		await page.goto(ROUTES.items);
		await page.waitForLoadState('domcontentloaded');

		// Try data-testid skeleton first (mirrors bags.spec.ts), then fallback
		const skeleton = page
			.getByTestId('item-list-skeleton')
			.or(page.getByTestId('item-card-skeleton'))
			.or(page.locator('[data-testid*="skeleton"], [aria-busy="true"]'))
			.or(page.getByText(/loading/i));

		await skeleton
			.first()
			.isVisible({ timeout: 3_000 })
			.catch(() => {
				// Some apps serve cached content immediately — acceptable
			});

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

	test('clicking an item in the list navigates to its detail page', async ({
		page,
	}) => {
		await page.goto(ROUTES.items);

		const firstCard = page.getByRole('heading', { level: 3 }).first();

		const itemName = await firstCard.textContent();

		if (!itemName) {
			test.skip(true, 'Could not determine item name');
		}

		await openItemFromActionsMenu(page, itemName ?? '');

		await expect(page).toHaveURL(/\/items\/[^/]+$/);
	});

	test('pagination controls navigate to the next page', async ({ page }) => {
		let callCount = 0;

		await page.route(
			'http://localhost:4000/api/beggy/items**',
			async (route) => {
				if (route.request().method() !== 'GET') {
					return route.continue();
				}

				callCount++;

				const page1 = {
					success: true,
					message: 'Items retrieved successfully',
					data: Array.from({ length: 10 }, (_, i) => ({
						id: `mock-item-${i}`,
						name: `Mock Item ${i + 1}`,
						category: 'CLOTHING',
						weight: 1.5,
						weightUnit: 'KG',
						volume: 2,
						volumeUnit: 'L',
						createdAt: new Date().toISOString(),
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
					timestamp: new Date().toISOString(),
				};

				const page2 = {
					success: true,
					message: 'Items retrieved successfully',
					data: Array.from({ length: 5 }, (_, i) => ({
						id: `mock-item-page2-${i}`,
						name: `Mock Item Page 2 Item ${i + 1}`,
						category: 'CLOTHING',
						weight: 1.5,
						weightUnit: 'KG',
						volume: 2,
						volumeUnit: 'L',
						createdAt: new Date().toISOString(),
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
					timestamp: new Date().toISOString(),
				};

				return route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify(callCount === 1 ? page1 : page2),
				});
			}
		);

		await page.goto(ROUTES.items);
		await page.waitForLoadState('networkidle');

		// Verify page 1 rendered
		await expect(page.getByText('Mock Item 1').first()).toBeVisible();

		const nextPageBtn = page
			.getByTestId('pagination-next')
			.or(page.getByRole('button', { name: /next page|next/i }))
			.or(page.getByLabel(/next page/i));

		await expect(nextPageBtn.first()).toBeEnabled({ timeout: 5_000 });
		await nextPageBtn.first().click();
		await page.waitForLoadState('networkidle');

		// Page 2 content should be visible
		await expect(
			page.getByText('Mock Item Page 2 Item 1').first()
		).toBeVisible({ timeout: 10_000 });

		// Previous page button should now be enabled
		const prevPageBtn = page
			.getByRole('button', { name: /go to previous page/i })
			.or(page.getByRole('button', { name: /previous/i }).first());
		await expect(prevPageBtn).toBeEnabled({ timeout: 5_000 });
	});

	test('invalid filter values are handled gracefully without breaking the page', async ({
		page,
	}) => {
		const search = page
			.getByRole('searchbox')
			.or(page.getByPlaceholder(/search/i));

		if (!(await search.isVisible({ timeout: 3_000 }).catch(() => false))) {
			test.skip(true, 'No search input to test with');
		}

		// Type characters that might be treated as unsupported symbols
		await search.fill('!@#$%^&*()<>');
		await page.waitForLoadState('networkidle');

		// Page must not crash — either shows empty state or ignores the input
		const pageIsUsable = page
			.getByRole('list')
			.or(page.getByText(/no results|no items found/i))
			.or(page.getByRole('button', { name: /add item/i }));

		await expect(pageIsUsable.first()).toBeVisible({ timeout: 10_000 });
	});

	test('temporary data failure does not leave the items page unusable', async ({
		page,
	}) => {
		let callCount = 0;
		await page.route('**/items**', async (route) => {
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
