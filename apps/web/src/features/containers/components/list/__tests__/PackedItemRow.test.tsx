import { describe, it, expect, vi } from 'vitest';
import { screen, render } from '@testing-library/react';
import { setupUser } from '@tests';

import { ItemCategory, WeightUnit, VolumeUnit } from '@beggy/shared/constants';

import PackedItemRow from '../PackedItemRow';

// ─── Test Data Factory ─────────────────────────────────────────────────────────
const item = {
	itemId: '1',
	name: 'Camera',
	category: ItemCategory.ELECTRONICS,
	quantity: 2,
	weight: 1,
	weightUnit: WeightUnit.KILOGRAM,
	volume: 0.87,
	volumeUnit: VolumeUnit.LITER,
	isFragile: false,
};

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('PackedItemRow', () => {
	it('renders item name and quantity', () => {
		render(
			<PackedItemRow
				item={item}
				containerId="c1"
				onUnpack={vi.fn()}
				onMove={vi.fn()}
			/>
		);

		expect(screen.getByText(/camera/i)).toBeInTheDocument();
		expect(screen.getByText(/×2/i)).toBeInTheDocument();
	});

	it('calls onUnpack when the user clicks the unpack button', async () => {
		const user = setupUser();
		const onUnpack = vi.fn();

		render(
			<PackedItemRow
				item={item}
				containerId="c1"
				onUnpack={onUnpack}
				onMove={vi.fn()}
			/>
		);

		await user.click(
			screen.getByRole('button', { name: /unpack camera/i })
		);

		expect(onUnpack).toHaveBeenCalledWith(item);
	});

	it('calls onMove when the user clicks the move button', async () => {
		const user = setupUser();
		const onMove = vi.fn();

		render(
			<PackedItemRow
				item={item}
				containerId="c1"
				onUnpack={vi.fn()}
				onMove={onMove}
			/>
		);

		await user.click(
			screen.getByRole('button', {
				name: /move camera to another bag/i,
			})
		);

		expect(onMove).toHaveBeenCalledWith(item);
	});

	it('disables unpack button when an unpack request is in progress', () => {
		render(
			<PackedItemRow
				item={item}
				containerId="c1"
				onUnpack={vi.fn()}
				onMove={vi.fn()}
				isUnpacking
			/>
		);

		expect(
			screen.getByRole('button', { name: /unpack camera/i })
		).toBeDisabled();
	});
});
