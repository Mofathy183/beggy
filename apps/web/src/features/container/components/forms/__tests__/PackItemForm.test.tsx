import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, render } from '@testing-library/react';
import { setupUser } from '@tests';
import PackItemForm from '../PackItemForm';
import { notify } from '@shared/utils';

// ─── Zod bypass (IMPORTANT) ───────────────────────────────────────

vi.mock('@hookform/resolvers/zod', () => ({
	zodResolver: () => async (values: unknown) => ({
		values,
		errors: {},
	}),
}));

// ─── Mocks ───────────────────────────────────────────────────────

const packMock = vi.fn();
const resetMock = vi.fn();

const useContainerActionsMock = vi.fn();
const useItemsListMock = vi.fn();

vi.mock('@features/container/hooks', () => ({
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

// ─── Test Data ───────────────────────────────────────────────────

const items = [
	{ id: 'item-1', name: 'Camera' },
	{ id: 'item-2', name: 'Laptop' },
];

const defaultHookState = () => ({
	pack: packMock,
	isPacking: false,
	isAnyLoading: false,
	states: {
		pack: {
			error: null,
			reset: resetMock,
			isLoading: false,
		},
		move: { isLoading: false },
		unpack: { isLoading: false },
	},
});

// ─── Setup ───────────────────────────────────────────────────────

beforeEach(() => {
	vi.clearAllMocks();

	useContainerActionsMock.mockReturnValue(defaultHookState());

	useItemsListMock.mockReturnValue({
		data: items,
		isLoading: false,
	});
});

// ─── Tests ───────────────────────────────────────────────────────

describe('PackItemForm', () => {
	it('renders form fields for packing an item', () => {
		render(<PackItemForm containerId="bag-1" />);

		expect(screen.getByLabelText(/item/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
	});

	it('calls pack when the form is submitted with valid input', async () => {
		const user = setupUser();

		render(<PackItemForm containerId="bag-1" />);

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

		render(
			<PackItemForm
				containerId="bag-1"
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
		const apiError = { body: { message: 'Failed' } };

		packMock.mockImplementation(async (_id, _values, { onError }) => {
			onError?.(apiError);
		});

		render(<PackItemForm containerId="bag-1" />);

		await user.click(screen.getByRole('button', { name: /pack it/i }));

		await waitFor(() => {
			expect(mockedNotify.error.fromHttp).toHaveBeenCalledWith(apiError);
		});
	});

	it('renders server error when the hook returns an error', () => {
		useContainerActionsMock.mockReturnValue({
			...defaultHookState(),
			states: {
				pack: {
					error: {
						body: {
							message: 'Server error',
							suggestion: 'Try again',
						},
					},
					reset: resetMock,
					isLoading: false,
				},
			},
		});

		render(<PackItemForm containerId="bag-1" />);

		expect(screen.getByRole('alert')).toBeInTheDocument();
		expect(screen.getByText(/server error/i)).toBeInTheDocument();
	});

	it('calls reset when the user edits a field after a server error', async () => {
		const user = setupUser();

		useContainerActionsMock.mockReturnValue({
			...defaultHookState(),
			states: {
				pack: {
					error: { body: { message: 'Server error' } },
					reset: resetMock,
					isLoading: false,
				},
			},
		});

		render(<PackItemForm containerId="bag-1" />);

		await user.type(screen.getByLabelText(/quantity/i), '2');

		await waitFor(() => {
			expect(resetMock).toHaveBeenCalled();
		});
	});

	it('disables submit button while the pack request is in progress', () => {
		useContainerActionsMock.mockReturnValue({
			...defaultHookState(),
			isPacking: true,
		});

		render(<PackItemForm containerId="bag-1" />);

		expect(screen.getByRole('button', { name: /packing/i })).toBeDisabled();
	});

	it('disables item selection when a preselected item is provided', () => {
		render(<PackItemForm containerId="bag-1" preselectedItemId="item-1" />);

		const select = screen.getByLabelText(/item/i);

		expect(select).toBeDisabled();
	});
});
