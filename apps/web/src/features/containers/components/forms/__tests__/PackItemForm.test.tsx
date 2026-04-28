import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithStore, setupUser } from '@tests';
import PackItemForm from '../PackItemForm';
import { notify } from '@shared/utils';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const packMock = vi.fn();
const resetMock = vi.fn();
const useContainerActionsMock = vi.fn();
const useItemsListMock = vi.fn();

vi.mock('@hookform/resolvers/zod', () => ({
	zodResolver: () => async (values: unknown) => ({ values, errors: {} }),
}));

vi.mock('@features/containers/hooks', () => ({
	useContainerActions: () => useContainerActionsMock(),
}));

vi.mock('@features/items/hooks', () => ({
	useItemsList: () => useItemsListMock(),
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

const items = [
	{ id: 'item-1', name: 'Camera' },
	{ id: 'item-2', name: 'Laptop' },
];

const apiError = {
	body: { message: 'Server error', suggestion: 'Try again' },
};

const defaultHookState = () => ({
	pack: packMock,
	isPacking: false,
	isAnyLoading: false,
	states: {
		pack: { error: null, reset: resetMock, isLoading: false },
		move: { isLoading: false },
		unpack: { isLoading: false },
	},
});

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
	vi.clearAllMocks();
	useContainerActionsMock.mockReturnValue(defaultHookState());
	useItemsListMock.mockReturnValue({ data: items, isLoading: false });
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('PackItemForm', () => {
	it('renders form fields for packing an item', () => {
		renderWithStore(<PackItemForm containerId="cnt-1" />);

		expect(screen.getByRole('combobox')).toBeInTheDocument();
		expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
	});

	it('calls pack when the form is submitted', async () => {
		const user = setupUser();

		renderWithStore(<PackItemForm containerId="cnt-1" />);

		await user.click(screen.getByRole('button', { name: /pack it/i }));

		await waitFor(() => {
			expect(packMock).toHaveBeenCalled();
		});
	});

	it('calls success notification and callbacks when pack succeeds', async () => {
		const user = setupUser();
		const onSuccess = vi.fn();
		const onCancel = vi.fn();

		packMock.mockImplementation(async (_id, _values, { onSuccess: cb }) => {
			cb?.('Item packed!');
		});

		renderWithStore(
			<PackItemForm
				containerId="cnt-1"
				onSuccess={onSuccess}
				onCancel={onCancel}
			/>
		);

		await user.click(screen.getByRole('button', { name: /pack it/i }));

		await waitFor(() => {
			expect(mockedNotify.success).toHaveBeenCalledWith({
				message: 'Item packed!',
			});
			expect(onCancel).toHaveBeenCalled();
			expect(onSuccess).toHaveBeenCalled();
		});
	});

	it('calls error notification when pack fails', async () => {
		const user = setupUser();

		packMock.mockImplementation(async (_id, _values, { onError }) => {
			onError?.(apiError);
		});

		renderWithStore(<PackItemForm containerId="cnt-1" />);

		await user.click(screen.getByRole('button', { name: /pack it/i }));

		await waitFor(() => {
			expect(mockedNotify.error.fromHttp).toHaveBeenCalledWith(apiError);
		});
	});

	it('renders server error banner when the hook exposes an error', () => {
		useContainerActionsMock.mockReturnValue({
			...defaultHookState(),
			states: {
				pack: { error: apiError, reset: resetMock, isLoading: false },
				move: { isLoading: false },
				unpack: { isLoading: false },
			},
		});

		renderWithStore(<PackItemForm containerId="cnt-1" />);

		expect(screen.getByRole('alert')).toBeInTheDocument();
		expect(screen.getByText(/server error/i)).toBeInTheDocument();
	});

	it('clears server error when user edits a field', async () => {
		const user = setupUser();

		useContainerActionsMock.mockReturnValue({
			...defaultHookState(),
			states: {
				pack: {
					error: { body: { message: 'Server error' } },
					reset: resetMock,
					isLoading: false,
				},
				move: { isLoading: false },
				unpack: { isLoading: false },
			},
		});

		renderWithStore(<PackItemForm containerId="cnt-1" />);

		await user.type(screen.getByLabelText(/quantity/i), '2');

		await waitFor(() => {
			expect(resetMock).toHaveBeenCalled();
		});
	});

	it('disables submit button while the pack request is in progress', () => {
		useContainerActionsMock.mockReturnValue({
			...defaultHookState(),
			isPacking: true,
			states: {
				pack: { error: null, reset: resetMock, isLoading: true },
				move: { isLoading: false },
				unpack: { isLoading: false },
			},
		});

		renderWithStore(<PackItemForm containerId="cnt-1" />);

		expect(screen.getByRole('button', { name: /packing/i })).toBeDisabled();
	});

	it('disables item selection when a preselected item is provided', () => {
		renderWithStore(
			<PackItemForm containerId="cnt-1" preselectedItemId="item-1" />
		);

		// When locked, a disabled text input replaces the combobox
		expect(screen.getByLabelText(/pre-selected/i)).toBeDisabled();
	});
});
