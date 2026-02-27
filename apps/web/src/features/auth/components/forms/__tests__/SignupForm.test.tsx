import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SignupForm from '../SignupForm';

const signupMock = vi.fn();
const useSignupMock = vi.fn();

vi.mock('@features/auth/hooks', () => ({
	useSignup: () => useSignupMock(),
}));

describe('SignupForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();

		useSignupMock.mockReturnValue({
			signup: signupMock,
			isLoading: false,
			serverError: null,
		});
	});

	it('submits registration data when form is valid', async () => {
		const user = userEvent.setup();
		render(<SignupForm />);

		await user.type(screen.getByLabelText(/first name/i), 'Mohamed');
		await user.type(screen.getByLabelText(/last name/i), 'Fathy');
		await user.type(screen.getByLabelText(/email/i), 'test@example.com');
		await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
		await user.type(
			screen.getByLabelText(/confirm password/i),
			'Password123!'
		);

		await user.click(
			screen.getByRole('button', { name: /create account/i })
		);

		expect(signupMock).toHaveBeenCalledTimes(1);

		expect((signupMock.mock as any).calls[0][0]).toEqual(
			expect.objectContaining({
				firstName: 'Mohamed',
				lastName: 'Fathy',
				email: 'test@example.com',
				password: 'Password123!',
				avatarUrl: null,
				gender: undefined,
				birthDate: undefined,
				country: '',
				city: '',
			})
		);
	});

	it('displays validation errors when required fields are empty', async () => {
		const user = userEvent.setup();
		render(<SignupForm />);

		await user.click(
			screen.getByRole('button', { name: /create account/i })
		);

		expect(await screen.findAllByRole('alert')).not.toHaveLength(0);
		expect(signupMock).not.toHaveBeenCalled();
	});

	it('displays error when passwords do not match', async () => {
		const user = userEvent.setup();
		render(<SignupForm />);

		await user.type(screen.getByLabelText(/first name/i), 'Mohamed');
		await user.type(screen.getByLabelText(/last name/i), 'Fathy');
		await user.type(screen.getByLabelText(/email/i), 'test@example.com');
		await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
		await user.type(
			screen.getByLabelText(/confirm password/i),
			'Different123!'
		);

		await user.click(
			screen.getByRole('button', { name: /create account/i })
		);

		expect(await screen.findByRole('alert')).toBeInTheDocument();
		expect(signupMock).not.toHaveBeenCalled();
	});

	it('disables inputs and button when loading', () => {
		useSignupMock.mockReturnValue({
			signup: signupMock,
			isLoading: true,
			serverError: null,
		});

		render(<SignupForm />);

		expect(
			screen.getByRole('button', { name: /creating account/i })
		).toBeDisabled();

		expect(screen.getByLabelText(/first name/i)).toBeDisabled();
		expect(screen.getByLabelText(/email/i)).toBeDisabled();
	});

	it('displays server error message when present', () => {
		useSignupMock.mockReturnValue({
			signup: signupMock,
			isLoading: false,
			serverError: 'Email already exists',
		});

		render(<SignupForm />);

		expect(screen.getByRole('alert')).toHaveTextContent(
			/email already exists/i
		);
	});
});
