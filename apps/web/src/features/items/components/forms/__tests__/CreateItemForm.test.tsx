import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { setupUser } from '@tests';

import CreateItemForm from '../CreateItemForm';
import { notify } from '@shared/utils';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const createMock = vi.fn();
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

vi.mock('@hookform/resolvers/zod', () => ({
	zodResolver: () => async (values: unknown) => ({ values, errors: {} }),
}));

const mockedNotify = vi.mocked(notify);

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const defaultHookState = () => ({
	create: createMock,
	isCreating: false,
	states: {
		create: { error: null, reset: resetMock },
	},
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CreateItemForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useItemsActionsMock.mockReturnValue(defaultHookState());
	});

	// ── Rendering ──────────────────────────────────────────────────────────────

	it('returns item creation fields', () => {
		render(<CreateItemForm />);

		expect(screen.getByLabelText(/item name/i)).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: /add item/i })
		).toBeInTheDocument();
		expect(
			screen.getByLabelText(/mark item as fragile/i)
		).toBeInTheDocument();
	});

	it('returns the weight and volume number inputs', () => {
		render(<CreateItemForm />);

		expect(
			screen.getByRole('spinbutton', { name: /^weight$/i })
		).toBeInTheDocument();

		expect(
			screen.getByRole('spinbutton', { name: /^volume$/i })
		).toBeInTheDocument();
	});

	// ── Loading state ──────────────────────────────────────────────────────────

	it('denies interaction by disabling the submit button while creating', () => {
		useItemsActionsMock.mockReturnValue({
			...defaultHookState(),
			isCreating: true,
		});
		render(<CreateItemForm />);
		expect(screen.getByRole('button', { name: /adding/i })).toBeDisabled();
	});

	// ── Submission ─────────────────────────────────────────────────────────────

	it('calls create when the form is submitted', async () => {
		const user = setupUser();
		createMock.mockImplementation(async (_v, { onSuccess }) =>
			onSuccess('')
		);

		render(<CreateItemForm />);
		await user.click(screen.getByRole('button', { name: /add item/i }));

		await waitFor(() => {
			expect(createMock).toHaveBeenCalledWith(
				expect.any(Object),
				expect.objectContaining({
					onSuccess: expect.any(Function),
					onError: expect.any(Function),
				})
			);
		});
	});

	it('calls create with the correct name when the user fills in the name field', async () => {
		const user = setupUser();
		createMock.mockImplementation(async (_v, { onSuccess }) =>
			onSuccess('')
		);

		render(<CreateItemForm />);
		await user.type(screen.getByLabelText(/item name/i), 'Passport');
		await user.click(screen.getByRole('button', { name: /add item/i }));

		await waitFor(() => {
			expect(createMock).toHaveBeenCalledWith(
				expect.objectContaining({ name: 'Passport' }),
				expect.any(Object)
			);
		});
	});

	// ── Success flow ───────────────────────────────────────────────────────────

	it('returns success notification when item creation succeeds', async () => {
		const user = setupUser();
		const onSuccess = vi.fn();
		const onCancel = vi.fn();

		createMock.mockImplementation(async (_v, { onSuccess: cb }) => {
			cb('Item added successfully');
		});

		render(<CreateItemForm onSuccess={onSuccess} onCancel={onCancel} />);
		await user.click(screen.getByRole('button', { name: /add item/i }));

		await waitFor(() => {
			expect(mockedNotify.success).toHaveBeenCalledWith({
				message: 'Item added successfully',
			});
			expect(onCancel).toHaveBeenCalled();
			expect(onSuccess).toHaveBeenCalled();
		});
	});

	// ── Error handling ─────────────────────────────────────────────────────────

	it('returns error notification when item creation fails', async () => {
		const user = setupUser();
		const apiError = { body: { message: 'Item already exists' } };

		createMock.mockImplementation(async (_v, { onError }) => {
			onError(apiError);
		});

		render(<CreateItemForm />);
		await user.click(screen.getByRole('button', { name: /add item/i }));

		await waitFor(() => {
			expect(mockedNotify.error.fromHttp).toHaveBeenCalledWith(apiError);
		});
	});

	it('returns server error banner when the hook exposes an error', () => {
		useItemsActionsMock.mockReturnValue({
			...defaultHookState(),
			states: {
				create: {
					error: {
						body: {
							message: 'Something went wrong',
							suggestion: 'Try again.',
						},
					},
					reset: resetMock,
				},
			},
		});

		render(<CreateItemForm />);

		expect(screen.getByRole('alert')).toBeInTheDocument();
		expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
	});

	// ── Server error reset ─────────────────────────────────────────────────────

	it('clears server error when user edits a field', async () => {
		const user = setupUser();
		useItemsActionsMock.mockReturnValue({
			...defaultHookState(),
			states: {
				create: {
					error: { body: { message: 'Server error' } },
					reset: resetMock,
				},
			},
		});

		render(<CreateItemForm />);
		await user.type(screen.getByLabelText(/item name/i), 'Camera');

		await waitFor(() => {
			expect(resetMock).toHaveBeenCalled();
		});
	});
});
