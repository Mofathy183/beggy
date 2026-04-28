import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithStore, setupUser } from '@tests';
import type { PackedItemDTO } from '@beggy/shared/types';
import { WeightUnit, VolumeUnit, ItemCategory } from '@beggy/shared/constants';
import UnpackItemForm from '../UnpackItemForm';
import { notify } from '@shared/utils';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const unpackMock = vi.fn();
const resetMock = vi.fn();
const useContainerActionsMock = vi.fn();

vi.mock('@hookform/resolvers/zod', () => ({
	zodResolver: () => async (values: unknown) => ({ values, errors: {} }),
}));

vi.mock('@features/containers/hooks', () => ({
	useContainerActions: () => useContainerActionsMock(),
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
	quantity: 3,
	weight: 1,
	weightUnit: WeightUnit.KILOGRAM,
	volume: 1,
	volumeUnit: VolumeUnit.LITER,
	category: ItemCategory.ELECTRONICS,
	isFragile: true,
};

const apiError = {
	body: { message: 'Server error', suggestion: 'Try again' },
};

const defaultHookState = () => ({
	unpack: unpackMock,
	isUnpacking: false,
	isAnyLoading: false,
	states: {
		unpack: { error: null, reset: resetMock, isLoading: false },
		pack: { isLoading: false },
		move: { isLoading: false },
	},
});

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
	vi.clearAllMocks();
	useContainerActionsMock.mockReturnValue(defaultHookState());
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('UnpackItemForm', () => {
	it('renders form fields for unpacking an item', () => {
		renderWithStore(
			<UnpackItemForm containerId="cnt-1" packedItem={packedItem} />
		);

		expect(
			screen.getByLabelText(/item being unpacked/i)
		).toBeInTheDocument();
		expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
	});

	it('displays the item name in the read-only field', () => {
		renderWithStore(
			<UnpackItemForm containerId="cnt-1" packedItem={packedItem} />
		);

		expect(screen.getByLabelText(/item being unpacked/i)).toHaveValue(
			'Camera'
		);
	});

	it('displays the max quantity in the quantity label', () => {
		renderWithStore(
			<UnpackItemForm containerId="cnt-1" packedItem={packedItem} />
		);

		expect(
			screen.getByLabelText(/quantity \(max 3\)/i)
		).toBeInTheDocument();
	});

	it('returns Remove it button in idle state', () => {
		renderWithStore(
			<UnpackItemForm containerId="cnt-1" packedItem={packedItem} />
		);

		expect(
			screen.getByRole('button', { name: /^remove it$/i })
		).toBeInTheDocument();
	});

	it('calls unpack when the form is submitted', async () => {
		const user = setupUser();

		renderWithStore(
			<UnpackItemForm containerId="cnt-1" packedItem={packedItem} />
		);

		await user.click(screen.getByRole('button', { name: /^remove it$/i }));

		await waitFor(() => {
			expect(unpackMock).toHaveBeenCalled();
		});
	});

	it('calls success notification and callbacks when unpack succeeds', async () => {
		const user = setupUser();
		const onSuccess = vi.fn();
		const onCancel = vi.fn();

		unpackMock.mockImplementation(
			async (_id, _values, { onSuccess: cb }) => {
				cb?.('Item removed!');
			}
		);

		renderWithStore(
			<UnpackItemForm
				containerId="cnt-1"
				packedItem={packedItem}
				onSuccess={onSuccess}
				onCancel={onCancel}
			/>
		);

		await user.click(screen.getByRole('button', { name: /^remove it$/i }));

		await waitFor(() => {
			expect(mockedNotify.success).toHaveBeenCalledWith({
				message: 'Item removed!',
			});
			expect(onCancel).toHaveBeenCalled();
			expect(onSuccess).toHaveBeenCalled();
		});
	});

	it('calls error notification when unpack fails', async () => {
		const user = setupUser();

		unpackMock.mockImplementation(async (_id, _values, { onError }) => {
			onError?.(apiError);
		});

		renderWithStore(
			<UnpackItemForm containerId="cnt-1" packedItem={packedItem} />
		);

		await user.click(screen.getByRole('button', { name: /^remove it$/i }));

		await waitFor(() => {
			expect(mockedNotify.error.fromHttp).toHaveBeenCalledWith(apiError);
		});
	});

	it('renders server error banner when the hook exposes an error', () => {
		useContainerActionsMock.mockReturnValue({
			...defaultHookState(),
			states: {
				unpack: { error: apiError, reset: resetMock, isLoading: false },
				pack: { isLoading: false },
				move: { isLoading: false },
			},
		});

		renderWithStore(
			<UnpackItemForm containerId="cnt-1" packedItem={packedItem} />
		);

		expect(screen.getByRole('alert')).toBeInTheDocument();
		expect(screen.getByText(/server error/i)).toBeInTheDocument();
	});

	it('clears server error when user edits a field', async () => {
		const user = setupUser();

		useContainerActionsMock.mockReturnValue({
			...defaultHookState(),
			states: {
				unpack: {
					error: { body: { message: 'Server error' } },
					reset: resetMock,
					isLoading: false,
				},
				pack: { isLoading: false },
				move: { isLoading: false },
			},
		});

		renderWithStore(
			<UnpackItemForm containerId="cnt-1" packedItem={packedItem} />
		);

		await user.type(screen.getByLabelText(/quantity/i), '1');

		await waitFor(() => {
			expect(resetMock).toHaveBeenCalled();
		});
	});

	it('disables submit button while the unpack request is in progress', () => {
		useContainerActionsMock.mockReturnValue({
			...defaultHookState(),
			isUnpacking: true,
			states: {
				unpack: { error: null, reset: resetMock, isLoading: true },
				pack: { isLoading: false },
				move: { isLoading: false },
			},
		});

		renderWithStore(
			<UnpackItemForm containerId="cnt-1" packedItem={packedItem} />
		);

		expect(
			screen.getByRole('button', { name: /removing/i })
		).toBeDisabled();
	});

	it('calls onCancel when Cancel button is clicked', async () => {
		const user = setupUser();
		const onCancel = vi.fn();

		renderWithStore(
			<UnpackItemForm
				containerId="cnt-1"
				packedItem={packedItem}
				onCancel={onCancel}
			/>
		);

		await user.click(screen.getByRole('button', { name: /^cancel$/i }));

		expect(onCancel).toHaveBeenCalled();
	});
});
