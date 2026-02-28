import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import OAuthButtons from '../OAuthButtons';

vi.mock('@/env', () => ({
	env: {
		API_URL: 'http://localhost:4000',
	},
}));

describe('OAuthButtons', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders "Continue with" copy by default', () => {
		render(<OAuthButtons />);

		expect(screen.getByText('Continue with Google')).toBeInTheDocument();
		expect(screen.getByText('Continue with Facebook')).toBeInTheDocument();
	});

	it('renders "Sign up with" copy when mode="signup"', () => {
		render(<OAuthButtons mode="signup" />);

		expect(screen.getByText('Sign up with Google')).toBeInTheDocument();
		expect(screen.getByText('Sign up with Facebook')).toBeInTheDocument();
	});

	it('renders correct Google OAuth link', () => {
		render(<OAuthButtons />);

		const link = screen.getByLabelText('Continue with Google');

		expect(link).toHaveAttribute(
			'href',
			'http://localhost:4000/auth/google'
		);
	});
});
