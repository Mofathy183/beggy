/**
 * test.helpers.ts
 *
 * Shared helpers used across bags.spec.ts, items.spec.ts, and packing.spec.ts.
 * Import only what each spec needs.
 */

import { expect, Page, Locator } from '@playwright/test';

// ── Routes ─────────────────────────────────────────────────────────────────

export const ROUTES = {
	bags: '/bags',
	items: '/items',
	packing: (containerId: string) => `/packing/${containerId}`,
} as const;

// ── Navigation ─────────────────────────────────────────────────────────────

export async function gotoBags(page: Page) {
	await page.goto(ROUTES.bags);
	await page.waitForLoadState('networkidle');
}

export async function gotoItems(page: Page) {
	await page.goto(ROUTES.items);
	await page.waitForLoadState('networkidle');
}

export async function openPackingWorkspace(page: Page, containerId: string) {
	await page.goto(ROUTES.packing(containerId));
	await page.waitForLoadState('networkidle');
	await page
		.getByText(/packing status|packed items|add item/i)
		.first()
		.waitFor({ state: 'visible', timeout: 15_000 });
}

// ── Dialog helpers ─────────────────────────────────────────────────────────

export async function openCreateBagDialog(page: Page) {
	await page.getByRole('button', { name: 'Add bag' }).click();
	const dialog = page.getByRole('dialog');
	await expect(dialog).toBeVisible();
	return dialog;
}

export async function openCreateItemDialog(page: Page) {
	await page.getByRole('button', { name: 'Add item' }).click();
	const dialog = page.getByRole('dialog');
	await expect(dialog).toBeVisible();
	return dialog;
}

export async function openPackDialog(page: Page) {
	await page.getByRole('button', { name: 'Add item' }).click();
	const dialog = page.getByRole('dialog');
	await expect(dialog).toBeVisible();
	return dialog;
}

export async function openUnpackDialog(page: Page, itemName: string) {
	await page
		.getByRole('button', { name: new RegExp(`Unpack ${itemName}`, 'i') })
		.click();
	const dialog = page.getByRole('dialog');
	await expect(dialog).toBeVisible();
	return dialog;
}

export async function waitForDialogClose(page: Page, name?: string | RegExp) {
	const locator = name
		? page.getByRole('dialog', { name })
		: page.getByRole('dialog');

	await locator.waitFor({ state: 'hidden', timeout: 10_000 });
}

// Hover to reveal the action buttons on a packed item row, then click unpack
export async function clickUnpackButton(page: Page, itemName?: string) {
	const row = itemName
		? page
				.locator('[aria-label^="Packed item:"]')
				.filter({ hasText: itemName })
				.first()
		: page.locator('[aria-label^="Packed item:"]').first();

	await row.waitFor({ state: 'visible', timeout: 10_000 });

	// Try hover first (desktop), fall back to direct click if button is already visible
	await row.hover().catch(() => {});
	await page.waitForTimeout(150); // allow CSS transition

	const unpackBtn = row.getByRole('button', { name: /unpack/i });

	// On mobile, hover doesn't work — force-click via JS if still not visible
	const isVisible = await unpackBtn.isVisible().catch(() => false);
	if (!isVisible) {
		await unpackBtn.evaluate((el) => (el as HTMLElement).click());
	} else {
		await unpackBtn.click();
	}

	const dialog = page.getByRole('dialog', { name: /remove item/i });
	await expect(dialog).toBeVisible({ timeout: 10_000 });
}

export async function openUnpackDialogFor(page: Page, itemName?: string) {
	await clickUnpackButton(page, itemName);
	const dialog = page.getByRole('dialog', { name: /remove item/i });
	await expect(dialog).toBeVisible({ timeout: 10_000 });
	return dialog;
}

export async function hasPackedItems(page: Page): Promise<boolean> {
	return (await page.locator('[aria-label^="Packed item:"]').count()) > 0;
}

export async function getFirstPackedItemName(page: Page): Promise<string> {
	const row = page.locator('[aria-label^="Packed item:"]').first();
	const label = (await row.getAttribute('aria-label')) ?? '';
	// aria-label="Packed item: E2E Test Item, quantity 3"
	const match = label.match(/Packed item:\s*([^,]+)/i);
	return match ? (match[1] as string).trim() : '';
}

// ── Form fill helpers ──────────────────────────────────────────────────────

/**
 * Fills the required fields of the Create Bag form.
 *
 * Type    → first radiogroup  (getByRole('radio').first())
 * Size    → second radiogroup (getByRole('radiogroup').nth(1) → first radio)
 * Also fills optional empty weight so the form is complete.
 *
 * Returns a unique name so callers can assert its presence in the list.
 */
export async function fillRequiredBagFields(
	_page: Page,
	dialog: ReturnType<Page['getByRole']>,
	overrides: {
		name?: string;
		maxWeight?: string;
		maxCapacity?: string;
	} = {}
): Promise<string> {
	const name = overrides.name ?? `E2E Bag ${Date.now()}`;

	await dialog.locator('#create-bag-name').fill(name);

	// Type — first radio group
	await dialog.getByRole('radio').first().click();

	// Size — second radio group
	await dialog
		.getByRole('radiogroup')
		.nth(1)
		.getByRole('radio')
		.first()
		.click();

	await dialog.getByLabel(/max weight/i).fill(overrides.maxWeight ?? '15');
	await dialog
		.getByLabel(/max capacity/i)
		.fill(overrides.maxCapacity ?? '30');

	// Empty weight is optional but keeps the form tidy
	dialog.getByLabel(/empty weight/i).fill('2');
	// const emptyWeight =
	// if (await emptyWeight.isVisible({ timeout: 1_000 }).catch(() => false)) {
	// 	await emptyWeight.fill('2');
	// }

	return name;
}

/**
 * Fills the required fields of the Create Item form.
 * Returns the unique item name for assertions.
 */
export async function fillRequiredItemFields(
	page: Page,
	dialog: ReturnType<Page['getByRole']>,
	overrides: { name?: string } = {}
): Promise<string> {
	const name = overrides.name ?? `E2E Item ${Date.now()}`;

	await dialog.locator('#create-item-name').fill(name);

	await dialog.getByRole('radio').first().click();

	await dialog.getByLabel(/^weight$/i).fill('1.5');

	const weightUnit = dialog.getByLabel(/weight unit/i);
	if (await weightUnit.isVisible()) {
		await weightUnit.click();
		await page.getByRole('option').first().click();
	}

	await dialog.getByLabel(/^volume$/i).fill('2');

	const volumeUnit = dialog.getByLabel(/volume unit/i);
	if (await volumeUnit.isVisible()) {
		await volumeUnit.click();
		await page.getByRole('option').first().click();
	}

	return name;
}

// ── UI creation helpers (for tests that need pre-existing data) ────────────

/**
 * Creates a bag via the UI and waits for it to appear in the list.
 * Navigates to the bags page first.
 */
export async function createBagViaUI(page: Page): Promise<string> {
	await gotoBags(page);
	const dialog = await openCreateBagDialog(page);
	const name = await fillRequiredBagFields(page, dialog);
	await dialog.getByRole('button', { name: /^create bag$/i }).click();
	await waitForDialogClose(page);
	await expect(page.getByRole('heading', { name, level: 3 })).toBeVisible({
		timeout: 10_000,
	});
	return name;
}

/**
 * Creates an item via the UI and waits for it to appear in the list.
 * Navigates to the items page first.
 */
export async function createItemViaUI(page: Page): Promise<string> {
	await gotoItems(page);
	const dialog = await openCreateItemDialog(page);
	const name = await fillRequiredItemFields(page, dialog);
	await dialog.getByRole('button', { name: /create item|add item/i }).click();
	await waitForDialogClose(page);
	await expect(page.getByText(name)).toBeVisible({ timeout: 10_000 });
	return name;
}

// ── Drag-and-drop ──────────────────────────────────────────────────────────

/**
 * Simulates drag-and-drop using pointer events with enough intermediate steps
 * to pass any activation threshold.
 */
export async function dragToTarget(
	page: Page,
	sourceLocator: ReturnType<Page['locator']>,
	targetLocator: ReturnType<Page['locator']>
) {
	// Wait for both elements to be visible before measuring
	await sourceLocator.waitFor({ state: 'visible', timeout: 10_000 });
	await targetLocator.waitFor({ state: 'visible', timeout: 10_000 });

	const srcBox = await sourceLocator.boundingBox();
	const tgtBox = await targetLocator.boundingBox();

	if (!srcBox || !tgtBox) {
		throw new Error('drag source or target has no bounding box');
	}

	const startX = srcBox.x + srcBox.width / 2;
	const startY = srcBox.y + srcBox.height / 2;
	const endX = tgtBox.x + tgtBox.width / 2;
	const endY = tgtBox.y + tgtBox.height / 2;

	await page.mouse.move(startX, startY);
	await page.mouse.down();
	const steps = 10;
	for (let i = 1; i <= steps; i++) {
		await page.mouse.move(
			startX + ((endX - startX) * i) / steps,
			startY + ((endY - startY) * i) / steps,
			{ steps: 1 }
		);
	}
	await page.mouse.up();
}

export async function dragByCoordinates(
	page: Page,
	source: Locator,
	target: Locator
) {
	const srcBox = await source.boundingBox();
	const tgtBox = await target.boundingBox();

	if (!srcBox || !tgtBox) throw new Error('Element has no bounding box');

	const sx = srcBox.x + srcBox.width / 2;
	const sy = srcBox.y + srcBox.height / 2;
	const tx = tgtBox.x + tgtBox.width / 2;
	const ty = tgtBox.y + tgtBox.height / 2;

	// Pass element handles directly — avoids elementFromPoint null issues
	const sourceHandle = await source.elementHandle();
	const targetHandle = await target.elementHandle();

	if (!sourceHandle || !targetHandle) {
		throw new Error('Could not get element handles');
	}

	await page.evaluate(
		async ({ sx, sy, tx, ty, steps }) => {
			const sleep = (ms: number) =>
				new Promise<void>((r) => setTimeout(r, ms));

			const makePointer = (
				type: string,
				x: number,
				y: number,
				buttons = 1
			): PointerEvent =>
				new PointerEvent(type, {
					bubbles: true,
					cancelable: true,
					composed: true,
					pointerId: 1,
					pointerType: 'mouse',
					isPrimary: true,
					clientX: x,
					clientY: y,
					screenX: x,
					screenY: y,
					movementX: 0,
					movementY: 0,
					buttons,
					button: type === 'pointerup' ? 0 : 0,
					pressure: type === 'pointerup' ? 0 : 0.5,
				});

			// Resolve source from coordinates — sheet content IS in the document
			const srcEl =
				document.elementFromPoint(sx, sy) ??
				document.querySelector(
					'[aria-label*="drag to pack into bag"]'
				)!;

			// 1. Pointerdown on the draggable element
			srcEl.dispatchEvent(makePointer('pointerdown', sx, sy));
			await sleep(50);

			// 2. Small initial move to satisfy dnd-kit Distance(8) constraint
			//    dispatch on document — @dnd-kit/dom adds its move listener to document
			for (let i = 1; i <= 3; i++) {
				document.dispatchEvent(
					makePointer('pointermove', sx + i * 3, sy)
				);
				await sleep(16);
			}
			await sleep(50);

			// 3. Sweep to target in steps
			for (let i = 1; i <= steps; i++) {
				const x = sx + 9 + ((tx - sx - 9) * i) / steps;
				const y = sy + ((ty - sy) * i) / steps;
				document.dispatchEvent(makePointer('pointermove', x, y));
				await sleep(16);
			}
			await sleep(50);

			// 4. Final move exactly on target center
			document.dispatchEvent(makePointer('pointermove', tx, ty));
			await sleep(50);

			// 5. Pointerup — dispatch on both document and target element
			//    so dnd-kit's onDragEnd fires correctly
			document.dispatchEvent(makePointer('pointerup', tx, ty, 0));
			const tgtEl = document.elementFromPoint(tx, ty) ?? document.body;
			tgtEl.dispatchEvent(makePointer('pointerup', tx, ty, 0));
		},
		{ sx, sy, tx, ty, steps: 20 }
	);

	await page.waitForTimeout(400);
}
