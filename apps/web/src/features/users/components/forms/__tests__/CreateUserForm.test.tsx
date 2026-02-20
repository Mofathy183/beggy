import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import CreateUserForm from '../CreateUserForm';
import { useUserMutations } from '@features/users/hooks';

vi.mock('@features/users/hooks', () => ({
	useUserMutations: vi.fn(),
}));

describe('CreateUserForm', () => {
	const mockCreateUser = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		(useUserMutations as any).mockReturnValue({
			createUser: mockCreateUser,
			states: {
				create: { isLoading: false },
			},
		});
	});

	const fillForm = async () => {
		await userEvent.type(screen.getByLabelText(/first name/i), 'John');
		await userEvent.type(screen.getByLabelText(/last name/i), 'Doe');
		await userEvent.type(
			screen.getByLabelText(/email/i),
			'john@example.com'
		);
		await userEvent.type(
			screen.getByLabelText(/^password$/i),
			'Password123!'
		);
		await userEvent.type(
			screen.getByLabelText(/confirm password/i),
			'Password123!'
		);
	};

	it('calls createUser on successful submit', async () => {
		mockCreateUser.mockReturnValue({
			unwrap: () => Promise.resolve({}),
		});

		render(<CreateUserForm />);

		await fillForm();

		await userEvent.click(
			screen.getByRole('button', { name: /create user/i })
		);

		await waitFor(() => {
			expect(mockCreateUser).toHaveBeenCalledWith(
				expect.objectContaining({
					firstName: 'John',
					lastName: 'Doe',
					email: 'john@example.com',
					password: 'Password123!',
				})
			);
		});
	});

	it('shows server error when mutation fails', async () => {
		mockCreateUser.mockReturnValue({
			unwrap: () =>
				Promise.reject({
					data: { message: 'Email already exists' },
				}),
		});

		render(<CreateUserForm />);

		await fillForm();

		await userEvent.click(
			screen.getByRole('button', { name: /create user/i })
		);

		expect(
			await screen.findByText(/email already exists/i)
		).toBeInTheDocument();
	});

	it('disables submit button when loading', () => {
		(useUserMutations as any).mockReturnValue({
			createUser: mockCreateUser,
			states: {
				create: { isLoading: true },
			},
		});

		render(<CreateUserForm />);

		expect(
			screen.getByRole('button', { name: /creating/i })
		).toBeDisabled();
	});
});
