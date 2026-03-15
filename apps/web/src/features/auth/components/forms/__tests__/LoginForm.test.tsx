import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import LoginForm from '../LoginForm';

const loginMock = vi.fn();
const resetMock = vi.fn();
const useLoginMock = vi.fn();

vi.mock('@features/auth/hooks', () => ({
	useLogin: () => useLoginMock(),
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

describe('LoginForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();

		useLoginMock.mockReturnValue({
			login: loginMock,
			reset: resetMock,
			isLoading: false,
			error: null,
		});
	});

	it('renders the email and password fields', () => {
		render(<LoginForm />);

		expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: /sign in/i })
		).toBeInTheDocument();
	});

	it('submits the credentials when the form is valid', async () => {
		const user = userEvent.setup();

		render(<LoginForm />);

		await user.type(screen.getByLabelText(/email/i), 'test@example.com');
		await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
		await user.click(screen.getByRole('button', { name: /sign in/i }));

		expect(loginMock).toHaveBeenCalledTimes(1);

		expect((loginMock.mock as any).calls[0][0]).toEqual({
			email: 'test@example.com',
			password: 'Password123!',
			rememberMe: false,
		});
	});

	it('disables the form while the login request is in progress', () => {
		useLoginMock.mockReturnValue({
			login: loginMock,
			reset: resetMock,
			isLoading: true,
			error: null,
		});

		render(<LoginForm />);

		expect(
			screen.getByRole('button', { name: /signing in/i })
		).toBeDisabled();
		expect(screen.getByLabelText(/email/i)).toBeDisabled();
		expect(screen.getByLabelText(/^password$/i)).toBeDisabled();
	});

	it('shows the server error message when login fails', () => {
		useLoginMock.mockReturnValue({
			login: loginMock,
			reset: resetMock,
			isLoading: false,
			error: {
				body: {
					message: 'Invalid credentials',
					suggestion: 'Try again',
				},
			},
		});

		render(<LoginForm />);

		expect(screen.getByRole('alert')).toHaveTextContent(
			/invalid credentials/i
		);
	});

	it('shows a success notification when login succeeds', async () => {
		const user = userEvent.setup();

		loginMock.mockImplementation(async (_, { onSuccess }) => {
			onSuccess('Welcome back!');
		});

		render(<LoginForm />);

		await user.type(screen.getByLabelText(/email/i), 'test@example.com');
		await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
		await user.click(screen.getByRole('button', { name: /sign in/i }));

		expect(mockedNotify.success).toHaveBeenCalledWith({
			message: 'Welcome back!',
		});
	});

	it('shows an error notification when the api returns an error', async () => {
		const user = userEvent.setup();

		const apiError = {
			body: {
				message: 'Invalid credentials',
				suggestion: 'Check your password',
			},
		};

		loginMock.mockImplementation(async (_, { onError }) => {
			onError(apiError);
		});

		render(<LoginForm />);

		await user.type(screen.getByLabelText(/email/i), 'test@example.com');
		await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
		await user.click(screen.getByRole('button', { name: /sign in/i }));

		await waitFor(() => {
			expect(mockedNotify.error.fromHttp).toHaveBeenCalledWith(apiError);
		});
	});
});
