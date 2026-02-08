import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';

import ProtectedRoute from '../ProtectedRoute';
import { renderWithStore, mockApiReducer } from '@tests/utils';
import { Action, Subject, Scope } from '@beggy/shared/constants';

import * as abilityModule from '@shared/store/ability';

describe('ProtectedRoute', () => {
	it('renders children for users with the required ability', () => {
		vi.spyOn(abilityModule, 'useAbility').mockReturnValue({
			can: () => true,
		} as any);

		renderWithStore(
			<ProtectedRoute action={Action.READ} subject={Subject.USER}>
				<div>Allowed Content</div>
			</ProtectedRoute>
		);

		expect(screen.getByText('Allowed Content')).toBeInTheDocument();
	});

	it('renders fallback for users without the required ability', () => {
		renderWithStore(
			<ProtectedRoute
				action={Action.DELETE}
				subject={Subject.USER}
				fallback={<div>Forbidden</div>}
			>
				<div>Protected Content</div>
			</ProtectedRoute>,
			{
				preloadedState: {
					api: mockApiReducer as any,
					ability: {
						permissions: [
							{
								action: Action.READ,
								subject: Subject.USER,
								scope: Scope.OWN,
							},
						],
					},
				},
			}
		);

		expect(screen.getByText('Forbidden')).toBeInTheDocument();

		expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
	});

	it('renders nothing when access is denied and no fallback is provided', () => {
		renderWithStore(
			<ProtectedRoute action={Action.UPDATE} subject={Subject.USER}>
				<div>Protected Content</div>
			</ProtectedRoute>,
			{
				preloadedState: {
					api: mockApiReducer as any,
					ability: {
						permissions: [],
					},
				},
			}
		);

		expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
	});
});
