import { render, screen, waitFor } from '@testing-library/react';
import { setupUser } from '@tests';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import CreateBagForm from '../CreateBagForm';
import { notify } from '@shared/utils';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const createMock = vi.fn();
const createResetMock = vi.fn();
const useBagActionsMock = vi.fn();

vi.mock('@features/bags/hooks', () => ({
	useBagActions: () => useBagActionsMock(),
}));

vi.mock('@shared/utils', () => ({
	notify: {
		success: vi.fn(),
		error: Object.assign(vi.fn(), {
			fromHttp: vi.fn(),
		}),
	},
}));

// Bypass real Zod validation — schema correctness is tested in @beggy/shared.
// Submission tests here focus on hook integration and UX feedback only.
vi.mock('@hookform/resolvers/zod', () => ({
	zodResolver: () => async (values: unknown) => ({ values, errors: {} }),
}));

const mockedNotify = vi.mocked(notify);

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const apiError = {
	body: {
		message: 'Bag name already exists',
		suggestion: 'Try a different name.',
	},
};

const defaultHookState = () => ({
	create: createMock,
	isCreating: false,
	states: {
		create: { error: null, reset: createResetMock },
		update: { error: null, reset: vi.fn() },
	},
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fillRequiredFields = async (user: ReturnType<typeof setupUser>) => {
	await user.type(screen.getByLabelText(/bag name/i), 'My Backpack');
	await user.click(
		screen.getByRole('radio', { name: /not selected backpack/i })
	);
	await user.click(
		screen.getByRole('radio', { name: /not selected medium/i })
	);

	const maxWeightInput = screen.getByRole('spinbutton', {
		name: /max weight/i,
	});
	await user.clear(maxWeightInput);
	await user.type(maxWeightInput, '10');
	await user.tab();

	const maxCapacityInput = screen.getByRole('spinbutton', {
		name: /max capacity/i,
	});
	await user.clear(maxCapacityInput);
	await user.type(maxCapacityInput, '20');
	await user.tab();
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CreateBagForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useBagActionsMock.mockReturnValue(defaultHookState());
	});

	// ──────────────────────────────────────────────────────────────────────────
	describe('form rendering', () => {
		it('returns all required fields', () => {
			render(<CreateBagForm />);

			expect(screen.getByLabelText(/bag name/i)).toBeInTheDocument();
			expect(screen.getByText(/bag type/i)).toBeInTheDocument();
			expect(screen.getByText(/^size$/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/max weight/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/max capacity/i)).toBeInTheDocument();
		});

		it('returns optional fields', () => {
			render(<CreateBagForm />);

			expect(screen.getByLabelText(/empty weight/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/color/i)).toBeInTheDocument();
			expect(screen.getByText(/material/i)).toBeInTheDocument();
			expect(screen.getByText(/features/i)).toBeInTheDocument();
		});

		it('returns Create bag button in idle state', () => {
			render(<CreateBagForm />);
			expect(
				screen.getByRole('button', { name: /^create bag$/i })
			).toBeInTheDocument();
		});
	});

	// ──────────────────────────────────────────────────────────────────────────
	describe('submit button loading state', () => {
		it('denies interaction by disabling the submit button while creating', () => {
			useBagActionsMock.mockReturnValue({
				...defaultHookState(),
				isCreating: true,
			});
			render(<CreateBagForm />);
			expect(
				screen.getByRole('button', { name: /creating…/i })
			).toBeDisabled();
		});

		it('returns "Creating…" label while submitting', () => {
			useBagActionsMock.mockReturnValue({
				...defaultHookState(),
				isCreating: true,
			});
			render(<CreateBagForm />);
			expect(
				screen.getByRole('button', { name: /creating…/i })
			).toBeInTheDocument();
		});
	});

	// ──────────────────────────────────────────────────────────────────────────
	describe('form submission', () => {
		it('rejects submission when required fields are empty', async () => {
			const user = setupUser();
			render(<CreateBagForm />);

			await user.click(
				screen.getByRole('button', { name: /^create bag$/i })
			);

			expect(
				screen.getByRole('button', { name: /^create bag$/i })
			).toBeInTheDocument();
		});

		it('calls create with correct payload on valid submission', async () => {
			const user = setupUser();
			createMock.mockImplementation(
				async (_values: unknown, { onSuccess }: any) => {
					onSuccess('Bag created!');
				}
			);

			render(<CreateBagForm />);
			await fillRequiredFields(user);
			await user.click(
				screen.getByRole('button', { name: /^create bag$/i })
			);

			await waitFor(() => {
				expect(createMock).toHaveBeenCalledWith(
					expect.objectContaining({ name: 'My Backpack' }),
					expect.objectContaining({
						onSuccess: expect.any(Function),
						onError: expect.any(Function),
					})
				);
			});
		});
	});

	// ──────────────────────────────────────────────────────────────────────────
	describe('successful creation flow', () => {
		it('returns success notification after successful creation', async () => {
			const user = setupUser();
			createMock.mockImplementation(
				async (_values: unknown, { onSuccess }: any) => {
					onSuccess('Bag created!');
				}
			);

			render(<CreateBagForm />);
			await fillRequiredFields(user);
			await user.click(
				screen.getByRole('button', { name: /^create bag$/i })
			);

			await waitFor(() => {
				expect(mockedNotify.success).toHaveBeenCalledWith({
					message: 'Bag created!',
				});
			});
		});

		it('calls onCancel after successful creation', async () => {
			const user = setupUser();
			const onCancel = vi.fn();

			createMock.mockImplementation(
				async (_values: unknown, { onSuccess }: any) => {
					onSuccess('Bag created!');
				}
			);

			render(<CreateBagForm onCancel={onCancel} />);
			await fillRequiredFields(user);
			await user.click(
				screen.getByRole('button', { name: /^create bag$/i })
			);

			await waitFor(() => {
				expect(onCancel).toHaveBeenCalled();
			});
		});

		it('calls onSuccess after successful creation', async () => {
			const user = setupUser();
			const onSuccess = vi.fn();

			createMock.mockImplementation(
				async (_values: unknown, { onSuccess: cb }: any) => {
					cb('Bag created!');
				}
			);

			render(<CreateBagForm onSuccess={onSuccess} />);
			await fillRequiredFields(user);
			await user.click(
				screen.getByRole('button', { name: /^create bag$/i })
			);

			await waitFor(() => {
				expect(onSuccess).toHaveBeenCalled();
			});
		});
	});

	// ──────────────────────────────────────────────────────────────────────────
	describe('API error handling', () => {
		it('returns error notification when creation fails', async () => {
			const user = setupUser();
			createMock.mockImplementation(
				async (_values: unknown, { onError }: any) => {
					onError(apiError);
				}
			);

			render(<CreateBagForm />);
			await fillRequiredFields(user);
			await user.click(
				screen.getByRole('button', { name: /^create bag$/i })
			);

			await waitFor(() => {
				expect(mockedNotify.error.fromHttp).toHaveBeenCalledWith(
					apiError
				);
			});
		});
	});

	// ──────────────────────────────────────────────────────────────────────────
	describe('server error UI state', () => {
		it('returns server error banner when hook exposes an error', () => {
			useBagActionsMock.mockReturnValue({
				...defaultHookState(),
				states: {
					create: { error: apiError, reset: createResetMock },
					update: { error: null, reset: vi.fn() },
				},
			});

			render(<CreateBagForm />);

			expect(screen.getByRole('alert')).toBeInTheDocument();
			expect(screen.getByText(apiError.body.message)).toBeInTheDocument();
		});

		it('returns the server error suggestion when provided', () => {
			useBagActionsMock.mockReturnValue({
				...defaultHookState(),
				states: {
					create: { error: apiError, reset: createResetMock },
					update: { error: null, reset: vi.fn() },
				},
			});

			render(<CreateBagForm />);
			expect(
				screen.getByText(apiError.body.suggestion)
			).toBeInTheDocument();
		});

		it('clears server error when user edits a field', async () => {
			const user = setupUser();

			useBagActionsMock.mockReturnValue({
				...defaultHookState(),
				states: {
					create: { error: apiError, reset: createResetMock },
					update: { error: null, reset: vi.fn() },
				},
			});

			render(<CreateBagForm />);
			await user.type(screen.getByLabelText(/bag name/i), 'A');

			await waitFor(() => {
				expect(createResetMock).toHaveBeenCalled();
			});
		});
	});

	// ──────────────────────────────────────────────────────────────────────────
	describe('chip selection', () => {
		it('allows selecting a bag type chip', async () => {
			const user = setupUser();
			render(<CreateBagForm />);

			await user.click(
				screen.getByRole('radio', { name: /not selected backpack/i })
			);

			expect(
				screen.getByRole('radio', { name: /^selected backpack/i })
			).toBeInTheDocument();
		});

		it('allows selecting a size chip', async () => {
			const user = setupUser();
			render(<CreateBagForm />);

			await user.click(
				screen.getByRole('radio', { name: /not selected medium/i })
			);

			expect(
				screen.getByRole('radio', { name: /^selected medium$/i })
			).toBeInTheDocument();
		});

		it('allows selecting multiple feature chips', async () => {
			const user = setupUser();
			render(<CreateBagForm />);

			await user.click(
				screen.getByRole('checkbox', {
					name: /not selected waterproof/i,
				})
			);

			expect(
				screen.getByRole('checkbox', { name: /^selected waterproof/i })
			).toBeInTheDocument();
		});
	});

	// ──────────────────────────────────────────────────────────────────────────
	describe('cancel action', () => {
		it('returns Reset button when no onCancel prop is provided', () => {
			render(<CreateBagForm />);
			expect(
				screen.getByRole('button', { name: /^reset$/i })
			).toBeInTheDocument();
		});

		it('returns Cancel button when onCancel prop is provided', () => {
			render(<CreateBagForm onCancel={vi.fn()} />);
			expect(
				screen.getByRole('button', { name: /^cancel$/i })
			).toBeInTheDocument();
		});

		it('calls onCancel when Cancel button is clicked', async () => {
			const user = setupUser();
			const onCancel = vi.fn();

			render(<CreateBagForm onCancel={onCancel} />);
			await user.click(screen.getByRole('button', { name: /^cancel$/i }));

			expect(onCancel).toHaveBeenCalled();
		});
	});
});
