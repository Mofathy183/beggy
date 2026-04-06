import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { setupUser } from '@tests';

import UpdateItemForm from '../UpdateItemForm';
import { ItemCategory, WeightUnit, VolumeUnit } from '@beggy/shared/constants';
import type { ItemDTO } from '@beggy/shared/types';

const editMock = vi.fn();
const resetMock = vi.fn();
const useItemsActionsMock = vi.fn();

vi.mock('@features/items/hooks', () => ({
	useItemsActions: () => useItemsActionsMock(),
}));

vi.mock('@shared/utils', () => ({
	notify: {
		success: vi.fn(),
		error: Object.assign(vi.fn(), { fromHttp: vi.fn() }),
	},
}));

const item: ItemDTO = {
	id: 'item-1',
	userId: 'user-1',
	name: 'Passport',
	category: ItemCategory.DOCUMENTS,
	weight: 0.1,
	weightUnit: WeightUnit.KILOGRAM,
	volume: 0.01,
	volumeUnit: VolumeUnit.LITER,
	color: 'black',
	isFragile: false,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
};

describe('UpdateItemForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useItemsActionsMock.mockReturnValue({
			edit: editMock,
			isUpdating: false,
			states: {
				update: { error: null, reset: resetMock },
			},
		});
	});

	// ── Pre-filled values (unique to Update) ──────────────────────────────────

	it('pre-fills the name field from the item prop', () => {
		render(<UpdateItemForm item={item} />);
		expect(screen.getByLabelText(/item name/i)).toHaveValue('Passport');
	});

	it('pre-fills the color field from the item prop', () => {
		render(<UpdateItemForm item={item} />);
		expect(screen.getByLabelText(/color/i)).toHaveValue('black');
	});

	it('pre-fills the weight field from the item prop', () => {
		render(<UpdateItemForm item={item} />);
		expect(
			screen.getByRole('spinbutton', { name: /^weight$/i })
		).toHaveValue(0.1);
	});

	it('pre-fills the volume field from the item prop', () => {
		render(<UpdateItemForm item={item} />);
		expect(
			screen.getByRole('spinbutton', { name: /^volume$/i })
		).toHaveValue(0.01);
	});

	it('pre-selects the category chip from the item prop', () => {
		render(<UpdateItemForm item={item} />);
		expect(
			screen.getByRole('button', { name: /selected documents/i })
		).toBeInTheDocument();
	});

	// ── Rendering (labels unique to Update) ───────────────────────────────────

	it('renders Save changes button in idle state', () => {
		render(<UpdateItemForm item={item} />);
		expect(
			screen.getByRole('button', { name: /^save changes$/i })
		).toBeInTheDocument();
	});

	it('shows "Saving…" label while submitting', () => {
		useItemsActionsMock.mockReturnValue({
			edit: editMock,
			isUpdating: true,
			states: { update: { error: null, reset: resetMock } },
		});
		render(<UpdateItemForm item={item} />);
		expect(
			screen.getByRole('button', { name: /saving…/i })
		).toBeInTheDocument();
	});

	// ── Submission contract (unique: must pass item id) ───────────────────────

	it('calls edit with the item id and updated values on submission', async () => {
		const user = setupUser();
		editMock.mockImplementation(async (_id, _values, { onSuccess }) =>
			onSuccess('')
		);

		render(<UpdateItemForm item={item} />);

		const nameInput = screen.getByLabelText(/item name/i);
		await user.clear(nameInput);
		await user.type(nameInput, 'Travel passport');

		await user.click(
			screen.getByRole('button', { name: /^save changes$/i })
		);

		await waitFor(() => {
			expect(editMock).toHaveBeenCalledWith(
				'item-1',
				expect.objectContaining({ name: 'Travel passport' }),
				expect.any(Object)
			);
		});
	});

	// ── Cancel (unique: Update always shows Cancel, never Reset) ─────────────

	it('calls onCancel when cancel button is clicked', async () => {
		const user = setupUser();
		const onCancel = vi.fn();

		render(<UpdateItemForm item={item} onCancel={onCancel} />);
		await user.click(screen.getByRole('button', { name: /cancel/i }));

		expect(onCancel).toHaveBeenCalled();
	});
});
