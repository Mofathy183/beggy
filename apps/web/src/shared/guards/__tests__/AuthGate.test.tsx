import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';

import AuthGate from '../AuthGate';
import { renderWithStore } from '@tests/utils';

const replaceMock = vi.fn();

vi.mock('next/navigation', () => ({
	useRouter: () => ({
		replace: replaceMock,
	}),
}));

vi.mock('@features/auth/auth.api', () => ({
	useMeQuery: vi.fn(),
}));

import { useMeQuery } from '@features/auth/auth.api';

describe('AuthGate', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('blocks rendering while authentication is loading', () => {
		(useMeQuery as any).mockReturnValue({
			isLoading: true,
			isError: false,
			data: undefined,
		});

		renderWithStore(
			<AuthGate>
				<div>Protected Content</div>
			</AuthGate>
		);

		expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
	});

	it('renders children and initializes permissions for authenticated users', () => {
		(useMeQuery as any).mockReturnValue({
			isLoading: false,
			isError: false,
			data: {
				data: {
					permissions: ['read:dashboard'],
				},
			},
		});

		const { store } = renderWithStore(
			<AuthGate>
				<div>Protected Content</div>
			</AuthGate>
		);

		expect(screen.getByText('Protected Content')).toBeInTheDocument();

		const abilityState = (store as any).getState().ability;

		expect(abilityState.permissions).toEqual(['read:dashboard']);
	});

	it('clears permissions and redirects to login when authentication fails', () => {
		(useMeQuery as any).mockReturnValue({
			isLoading: false,
			isError: true,
			data: undefined,
		});

		const { store } = renderWithStore(
			<AuthGate>
				<div>Protected Content</div>
			</AuthGate>
		);

		expect(replaceMock).toHaveBeenCalledWith('/login');

		const abilityState = (store as any).getState().ability;

		expect(abilityState.permissions).toEqual([]);
	});
});
