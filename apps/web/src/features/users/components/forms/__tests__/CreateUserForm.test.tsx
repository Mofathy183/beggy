import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { setupUser } from '@tests';
import CreateUserForm from '../CreateUserForm';

import { notify } from '@shared/utils';

// ─── Mocks ───────────────────────────────────────────────────────────

const createUserMock = vi.fn();
const resetMutationMock = vi.fn();

const statesMock = {
	create: {
		isLoading: false,
		error: null,
		reset: resetMutationMock,
	},
};

vi.mock('@features/users/hooks', () => ({
	useUserMutations: () => ({
		createUser: createUserMock,
		states: statesMock,
	}),
}));

vi.mock('@shared/utils', () => ({
	notify: {
		success: vi.fn(),
		error: {
			fromHttp: vi.fn(),
		},
	},
}));

// ─── Helpers ─────────────────────────────────────────────────────────

const fillForm = async (user: ReturnType<typeof setupUser>) => {
	await user.type(screen.getByLabelText(/first name/i), 'Bruce');
	await user.type(screen.getByLabelText(/last name/i), 'Wayne');
	await user.type(screen.getByLabelText(/email/i), 'bruce@wayne.com');

	await user.type(screen.getByLabelText(/^password$/i), 'Password123@@');
	await user.type(
		screen.getByLabelText(/confirm password/i),
		'Password123@@'
	);
};

// ─── Setup ───────────────────────────────────────────────────────────

beforeEach(() => {
	vi.clearAllMocks();

	statesMock.create.isLoading = false;
	statesMock.create.error = null;
});

// ─── Tests ───────────────────────────────────────────────────────────

describe('CreateUserForm', () => {
	describe('rendering', () => {
		it('renders create user form fields', () => {
			render(<CreateUserForm />);

			expect(
				screen.getByRole('button', { name: /create user/i })
			).toBeInTheDocument();

			expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();

			expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();

			expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
		});
	});

	describe('form submission', () => {
		it('creates user when form is submitted with valid input', async () => {
			const user = setupUser();

			createUserMock.mockReturnValue({
				unwrap: vi.fn().mockResolvedValue({
					message: 'User created',
				}),
			});

			render(<CreateUserForm />);

			await fillForm(user);

			await user.click(
				screen.getByRole('button', { name: /create user/i })
			);

			await waitFor(() => {
				expect(createUserMock).toHaveBeenCalledWith({
					firstName: 'Bruce',
					lastName: 'Wayne',
					email: 'bruce@wayne.com',
					password: 'Password123@@',
					confirmPassword: 'Password123@@',
				});
			});
		});

		it('does not submit when user creation is loading', async () => {
			const user = setupUser();

			statesMock.create.isLoading = true;

			render(<CreateUserForm />);

			await user.click(screen.getByRole('button', { name: /creating/i }));

			expect(createUserMock).not.toHaveBeenCalled();
		});
	});

	describe('success flow', () => {
		it('shows success notification when user creation succeeds', async () => {
			const user = setupUser();

			createUserMock.mockReturnValue({
				unwrap: vi.fn().mockResolvedValue({
					message: 'User created',
				}),
			});

			render(<CreateUserForm />);

			await fillForm(user);

			await user.click(
				screen.getByRole('button', { name: /create user/i })
			);

			await waitFor(() => {
				expect(notify.success).toHaveBeenCalledWith({
					message: 'User created',
				});
			});
		});
	});

	describe('error handling', () => {
		it('shows error notification when user creation fails', async () => {
			const user = setupUser();

			const httpError = {
				body: {
					message: 'Conflict',
				},
			};

			createUserMock.mockReturnValue({
				unwrap: vi.fn().mockRejectedValue(httpError),
			});

			render(<CreateUserForm />);

			await fillForm(user);

			await user.click(
				screen.getByRole('button', { name: /create user/i })
			);

			await waitFor(() => {
				expect(notify.error.fromHttp).toHaveBeenCalledWith(httpError);
			});
		});

		it('clears server error when user edits a field', async () => {
			const user = setupUser();

			(statesMock.create as any).error = {
				body: {
					message: 'Conflict',
					suggestion: 'Try another email',
				},
			};

			render(<CreateUserForm />);

			await user.type(screen.getByLabelText(/first name/i), 'B');

			await waitFor(() => {
				expect(resetMutationMock).toHaveBeenCalled();
			});
		});
	});

	describe('cancel behavior', () => {
		it('calls onCancel when cancel button is clicked', async () => {
			const user = setupUser();

			const onCancel = vi.fn();

			render(<CreateUserForm onCancel={onCancel} />);

			await user.click(screen.getByRole('button', { name: /cancel/i }));

			expect(onCancel).toHaveBeenCalled();
		});

		it('resets form fields when reset button is clicked and no onCancel is provided', async () => {
			const user = setupUser();

			render(<CreateUserForm />);

			const firstName = screen.getByLabelText(/first name/i);

			await user.type(firstName, 'Bruce');

			await user.click(screen.getByRole('button', { name: /reset/i }));

			await waitFor(() => {
				expect(firstName).toHaveValue('');
			});
		});
	});
});
