import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PublicOnlyRoute from '../PublicOnlyRoute';

const replaceMock = vi.fn();
const useAppSelectorMock = vi.fn();

vi.mock('next/navigation', () => ({
	useRouter: () => ({
		replace: replaceMock,
	}),
}));

vi.mock('@shared/store', () => ({
	useAppSelector: (selector: any) => useAppSelectorMock(selector),
}));

describe('PublicOnlyRoute', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('blocks access when auth is not initialized', () => {
		useAppSelectorMock.mockReturnValue({
			status: 'unauthenticated',
			initialized: false,
		});

		const { container } = render(
			<PublicOnlyRoute>
				<div>Login Page</div>
			</PublicOnlyRoute>
		);

		expect(container.firstChild).toBeNull();
		expect(replaceMock).not.toHaveBeenCalled();
	});

	it('redirects authenticated users to dashboard', () => {
		useAppSelectorMock.mockReturnValue({
			status: 'authenticated',
			initialized: true,
		});

		const { container } = render(
			<PublicOnlyRoute>
				<div>Login Page</div>
			</PublicOnlyRoute>
		);

		expect(replaceMock).toHaveBeenCalledWith('/dashboard');
		expect(container.firstChild).toBeNull();
	});

	it('displays children when user is unauthenticated', () => {
		useAppSelectorMock.mockReturnValue({
			status: 'unauthenticated',
			initialized: true,
		});

		render(
			<PublicOnlyRoute>
				<div>Login Page</div>
			</PublicOnlyRoute>
		);

		expect(screen.getByText('Login Page')).toBeInTheDocument();
		expect(replaceMock).not.toHaveBeenCalled();
	});
});
