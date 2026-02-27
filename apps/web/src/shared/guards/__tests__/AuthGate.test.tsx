import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';

import AuthGate from '../AuthGate';
import { renderWithStore } from '@tests/utils';
import { Role } from '@beggy/shared/constants';

const replaceMock = vi.fn();

vi.mock('next/navigation', () => ({
	useRouter: () => ({
		replace: replaceMock,
	}),
}));

describe('AuthGate', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders nothing while auth is not initialized', () => {
		renderWithStore(
			<AuthGate>
				<div>Protected</div>
			</AuthGate>,
			{
				preloadedState: {
					auth: {
						status: 'loading',
						initialized: false,
						user: null,
						profile: null,
						auth: null,
						error: null,
					},
				} as any,
			}
		);

		expect(screen.queryByText('Protected')).not.toBeInTheDocument();
		expect(replaceMock).not.toHaveBeenCalled();
	});

	it('redirects unauthenticated users to login', () => {
		renderWithStore(
			<AuthGate>
				<div>Protected</div>
			</AuthGate>,
			{
				preloadedState: {
					auth: {
						status: 'unauthenticated',
						initialized: true,
						user: null,
						profile: null,
						auth: null,
						error: null,
					},
				} as any,
			}
		);

		expect(replaceMock).toHaveBeenCalledWith('/login');
		expect(screen.queryByText('Protected')).not.toBeInTheDocument();
	});

	it('renders children when user is authenticated', () => {
		renderWithStore(
			<AuthGate>
				<div>Protected</div>
			</AuthGate>,
			{
				preloadedState: {
					auth: {
						status: 'authenticated',
						initialized: true,
						user: {
							id: '1',
							email: 'a@a.com',
							role: Role.USER,
							createdAt: '',
						},
						profile: null,
						auth: null,
						error: null,
					},
				} as any,
			}
		);

		expect(screen.getByText('Protected')).toBeInTheDocument();
		expect(replaceMock).not.toHaveBeenCalled();
	});
});
