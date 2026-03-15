import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import SignupForm from '../SignupForm';

const signupMock = vi.fn();
const resetMock = vi.fn();
const useSignupMock = vi.fn();

vi.mock('@features/auth/hooks', () => ({
	useSignup: () => useSignupMock(),
}));

vi.mock('@shared/utils', () => ({
	notify: {
		success: vi.fn(),
		error: Object.assign(vi.fn(), {
			fromHttp: vi.fn(),
		}),
	},
}));

import { notify } from '@shared/utils';

const mockedNotify = vi.mocked(notify);

describe('SignupForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();

		useSignupMock.mockReturnValue({
			signup: signupMock,
			reset: resetMock,
			isLoading: false,
			error: null,
		});
	});

	it('submits the registration data when the form is valid', async () => {
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
	});

	it('shows validation errors when the form is empty', async () => {
		const user = userEvent.setup();

		render(<SignupForm />);

		await user.click(
			screen.getByRole('button', { name: /create account/i })
		);

		expect(await screen.findAllByRole('alert')).not.toHaveLength(0);
		expect(signupMock).not.toHaveBeenCalled();
	});

	it('shows a success notification when signup is successful', async () => {
		const user = userEvent.setup();

		signupMock.mockImplementation(async (_values, { onSuccess }) => {
			onSuccess('Account created successfully');
		});

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

		expect(mockedNotify.success).toHaveBeenCalledWith({
			message: 'Account created successfully',
		});
	});

	it('shows an error notification when signup fails', async () => {
		const user = userEvent.setup();

		const httpError = {
			body: {
				message: 'Email already exists',
				suggestion: 'Try signing in instead',
			},
		};

		signupMock.mockImplementation(async (_values, { onError }) => {
			onError(httpError);
		});

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

		expect(mockedNotify.error.fromHttp).toHaveBeenCalledWith(httpError);
	});

	it('disables the form while the signup request is in progress', () => {
		useSignupMock.mockReturnValue({
			signup: signupMock,
			reset: resetMock,
			isLoading: true,
			error: null,
		});

		render(<SignupForm />);

		expect(
			screen.getByRole('button', { name: /creating account/i })
		).toBeDisabled();
	});

	it('shows the server error banner when an error is present', () => {
		useSignupMock.mockReturnValue({
			signup: signupMock,
			reset: resetMock,
			isLoading: false,
			error: {
				body: {
					message: 'Email already exists',
					suggestion: 'Try signing in instead',
				},
			},
		});

		render(<SignupForm />);

		expect(screen.getByRole('alert')).toHaveTextContent(
			/email already exists/i
		);
	});
});
