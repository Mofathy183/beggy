import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../LoginForm';

const loginMock = vi.fn();
const useLoginMock = vi.fn();

vi.mock('@features/auth/hooks', () => ({
	useLogin: () => useLoginMock(),
}));

describe('LoginForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();

		useLoginMock.mockReturnValue({
			login: loginMock,
			isLoading: false,
			serverError: null,
		});
	});

	it('displays email and password fields', () => {
		render(<LoginForm />);

		expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: /sign in/i })
		).toBeInTheDocument();
	});

	it('submits credentials when form is valid', async () => {
		const user = userEvent.setup();

		render(<LoginForm />);

		await user.type(screen.getByLabelText(/email/i), 'test@example.com');
		await user.type(screen.getByLabelText(/password/i), 'Password123!');
		await user.click(screen.getByRole('button', { name: /sign in/i }));

		expect(loginMock).toHaveBeenCalledTimes(1);

		expect((loginMock.mock as any).calls[0][0]).toEqual({
			email: 'test@example.com',
			password: 'Password123!',
			rememberMe: false,
		});
	});

	it('disables inputs and button when loading', () => {
		useLoginMock.mockReturnValue({
			login: loginMock,
			isLoading: true,
			serverError: null,
		});

		render(<LoginForm />);

		expect(
			screen.getByRole('button', { name: /signing in/i })
		).toBeDisabled();

		expect(screen.getByLabelText(/email/i)).toBeDisabled();
		expect(screen.getByLabelText(/password/i)).toBeDisabled();
	});

	it('displays server error message when present', () => {
		useLoginMock.mockReturnValue({
			login: loginMock,
			isLoading: false,
			serverError: 'Invalid credentials',
		});

		render(<LoginForm />);

		expect(screen.getByRole('alert')).toHaveTextContent(
			/invalid credentials/i
		);
	});
});
