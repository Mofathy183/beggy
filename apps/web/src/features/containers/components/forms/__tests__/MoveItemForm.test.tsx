import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithStore, setupUser } from '@tests';
import type { PackedItemDTO } from '@beggy/shared/types';
import { WeightUnit, VolumeUnit, ItemCategory } from '@beggy/shared/constants';
import MoveItemForm from '../MoveItemForm';
import { notify } from '@shared/utils';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const moveMock = vi.fn();
const resetMock = vi.fn();
const useContainerActionsMock = vi.fn();
const useBagsListMock = vi.fn();

vi.mock('@hookform/resolvers/zod', () => ({
	zodResolver: () => async (values: unknown) => ({ values, errors: {} }),
}));

vi.mock('@features/containers/hooks', () => ({
	useContainerActions: () => useContainerActionsMock(),
}));

vi.mock('@features/bags/hooks', () => ({
	useBagsList: () => useBagsListMock(),
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

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const packedItem: PackedItemDTO = {
	itemId: 'item-1',
	name: 'Camera',
	quantity: 2,
	weight: 1,
	weightUnit: WeightUnit.KILOGRAM,
	volume: 1,
	volumeUnit: VolumeUnit.LITER,
	category: ItemCategory.ELECTRONICS,
	isFragile: true,
};

const bags = [
	{ id: 'bag-2', containerId: 'cnt-2', name: 'Travel Bag' },
	{ id: 'bag-3', containerId: 'cnt-3', name: 'Gym Bag' },
];

const apiError = {
	body: { message: 'Server error', suggestion: 'Try again' },
};

const defaultHookState = () => ({
	move: moveMock,
	isMoving: false,
	isAnyLoading: false,
	states: {
		move: { error: null, reset: resetMock, isLoading: false },
		pack: { isLoading: false },
		unpack: { isLoading: false },
	},
});

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
	vi.clearAllMocks();
	useContainerActionsMock.mockReturnValue(defaultHookState());
	useBagsListMock.mockReturnValue({ data: bags, isLoading: false });
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('MoveItemForm', () => {
	it('renders form fields for moving an item', () => {
		renderWithStore(
			<MoveItemForm
				packedItem={packedItem}
				fromContainerId="cnt-1"
				fromBagName="Main Bag"
			/>
		);

		expect(screen.getByLabelText(/item being moved/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/source bag/i)).toBeInTheDocument();
		expect(screen.getByRole('combobox')).toBeInTheDocument();
		expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
	});

	it('calls move when the form is submitted', async () => {
		const user = setupUser();

		renderWithStore(
			<MoveItemForm
				packedItem={packedItem}
				fromContainerId="cnt-1"
				fromBagName="Main Bag"
			/>
		);

		await user.click(screen.getByRole('button', { name: /move it/i }));

		await waitFor(() => {
			expect(moveMock).toHaveBeenCalled();
		});
	});

	it('calls success notification and callbacks when move succeeds', async () => {
		const user = setupUser();
		const onSuccess = vi.fn();
		const onCancel = vi.fn();

		moveMock.mockImplementation(async (_values, { onSuccess: cb }) => {
			cb?.('Item moved!');
		});

		renderWithStore(
			<MoveItemForm
				packedItem={packedItem}
				fromContainerId="cnt-1"
				fromBagName="Main Bag"
				onSuccess={onSuccess}
				onCancel={onCancel}
			/>
		);

		await user.click(screen.getByRole('button', { name: /move it/i }));

		await waitFor(() => {
			expect(mockedNotify.success).toHaveBeenCalledWith({
				message: 'Item moved!',
			});
			expect(onCancel).toHaveBeenCalled();
			expect(onSuccess).toHaveBeenCalled();
		});
	});

	it('calls error notification when move fails', async () => {
		const user = setupUser();

		moveMock.mockImplementation(async (_values, { onError }) => {
			onError?.(apiError);
		});

		renderWithStore(
			<MoveItemForm
				packedItem={packedItem}
				fromContainerId="cnt-1"
				fromBagName="Main Bag"
			/>
		);

		await user.click(screen.getByRole('button', { name: /move it/i }));

		await waitFor(() => {
			expect(mockedNotify.error.fromHttp).toHaveBeenCalledWith(apiError);
		});
	});

	it('renders server error banner when the hook exposes an error', () => {
		useContainerActionsMock.mockReturnValue({
			...defaultHookState(),
			states: {
				move: { error: apiError, reset: resetMock, isLoading: false },
				pack: { isLoading: false },
				unpack: { isLoading: false },
			},
		});

		renderWithStore(
			<MoveItemForm
				packedItem={packedItem}
				fromContainerId="cnt-1"
				fromBagName="Main Bag"
			/>
		);

		expect(screen.getByRole('alert')).toBeInTheDocument();
		expect(screen.getByText(/server error/i)).toBeInTheDocument();
	});

	it('clears server error when user edits a field', async () => {
		const user = setupUser();

		useContainerActionsMock.mockReturnValue({
			...defaultHookState(),
			states: {
				move: {
					error: { body: { message: 'Server error' } },
					reset: resetMock,
					isLoading: false,
				},
				pack: { isLoading: false },
				unpack: { isLoading: false },
			},
		});

		renderWithStore(
			<MoveItemForm
				packedItem={packedItem}
				fromContainerId="cnt-1"
				fromBagName="Main Bag"
			/>
		);

		await user.type(screen.getByLabelText(/quantity/i), '3');

		await waitFor(() => {
			expect(resetMock).toHaveBeenCalled();
		});
	});

	it.skip('disables submit button while the move request is in progress', () => {
		useContainerActionsMock.mockReturnValue({
			...defaultHookState(),
			isMoving: true,
			states: {
				move: { error: null, reset: resetMock, isLoading: true },
				pack: { isLoading: false },
				unpack: { isLoading: false },
			},
		});

		renderWithStore(
			<MoveItemForm
				packedItem={packedItem}
				fromContainerId="cnt-1"
				fromBagName="Main Bag"
			/>
		);

		expect(screen.getByRole('button', { name: /moving/i })).toBeDisabled();
	});

	it('excludes the current bag from the destination list', async () => {
		const user = setupUser();

		useBagsListMock.mockReturnValue({
			data: [
				{ id: 'bag-1', containerId: 'cnt-1', name: 'Main Bag' }, // excluded
				{ id: 'bag-2', containerId: 'cnt-2', name: 'Travel Bag' },
			],
			isLoading: false,
		});

		renderWithStore(
			<MoveItemForm
				packedItem={packedItem}
				fromContainerId="cnt-1"
				fromBagName="Main Bag"
			/>
		);

		await user.click(screen.getByRole('combobox'));

		expect(screen.queryByText(/^main bag$/i)).not.toBeInTheDocument();
		expect(screen.getByText(/travel bag/i)).toBeInTheDocument();
	});
});
