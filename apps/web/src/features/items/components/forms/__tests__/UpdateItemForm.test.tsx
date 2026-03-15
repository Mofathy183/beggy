import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import UpdateItemForm from '../UpdateItemForm';
import { notify } from '@shared/utils';
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
		error: Object.assign(vi.fn(), {
			fromHttp: vi.fn(),
		}),
	},
}));

const mockedNotify = vi.mocked(notify);

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
				update: {
					error: null,
					reset: resetMock,
				},
			},
		});
	});

	it('renders item values in form fields', () => {
		render(<UpdateItemForm item={item} />);

		expect(screen.getByDisplayValue('Passport')).toBeInTheDocument();

		expect(screen.getByDisplayValue('black')).toBeInTheDocument();

		expect(
			screen.getByRole('button', { name: /save changes/i })
		).toBeInTheDocument();
	});

	it('updates item when form is submitted with modified values', async () => {
		const user = userEvent.setup();

		render(<UpdateItemForm item={item} />);

		const nameInput = screen.getByLabelText(/item name/i);

		await user.clear(nameInput);
		await user.type(nameInput, 'Travel passport');

		await user.click(screen.getByRole('button', { name: /save changes/i }));

		expect(editMock).toHaveBeenCalledWith(
			'item-1',
			expect.objectContaining({
				name: 'Travel passport',
			}),
			expect.any(Object)
		);
	});

	it('shows success notification when item update succeeds', async () => {
		const user = userEvent.setup();

		editMock.mockImplementation(async (_, __, { onSuccess }) => {
			onSuccess('Item updated successfully');
		});

		const onSuccess = vi.fn();
		const onCancel = vi.fn();

		render(
			<UpdateItemForm
				item={item}
				onSuccess={onSuccess}
				onCancel={onCancel}
			/>
		);

		await user.click(screen.getByRole('button', { name: /save changes/i }));

		expect(mockedNotify.success).toHaveBeenCalledWith({
			message: 'Item updated successfully',
		});

		expect(onCancel).toHaveBeenCalled();
		expect(onSuccess).toHaveBeenCalled();
	});

	it('shows error notification when item update fails', async () => {
		const user = userEvent.setup();

		const apiError = {
			body: {
				message: 'Update failed',
			},
		};

		editMock.mockImplementation(async (_, __, { onError }) => {
			onError(apiError);
		});

		render(<UpdateItemForm item={item} />);

		await user.click(screen.getByRole('button', { name: /save changes/i }));

		expect(mockedNotify.error.fromHttp).toHaveBeenCalledWith(apiError);
	});

	it('clears server error when user edits a field', async () => {
		const user = userEvent.setup();

		useItemsActionsMock.mockReturnValue({
			edit: editMock,
			isUpdating: false,
			states: {
				update: {
					error: {
						body: { message: 'Server error' },
					},
					reset: resetMock,
				},
			},
		});

		render(<UpdateItemForm item={item} />);

		await user.type(screen.getByLabelText(/item name/i), ' Updated');

		expect(resetMock).toHaveBeenCalled();
	});

	it('calls onCancel when cancel button is clicked', async () => {
		const user = userEvent.setup();

		const onCancel = vi.fn();

		render(<UpdateItemForm item={item} onCancel={onCancel} />);

		await user.click(screen.getByRole('button', { name: /cancel/i }));

		expect(onCancel).toHaveBeenCalled();
	});
});
