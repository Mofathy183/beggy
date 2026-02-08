import reducer, { setPermissions, clearPermissions } from '../ability.slice';
import type { Permissions } from '@beggy/shared/types';
import { Action, Scope, Subject } from '@beggy/shared/constants';

describe('abilitySlice', () => {
	const initialState = {
		permissions: [],
	};

	it('should return initial state', () => {
		expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
	});

	it('should set permissions from backend', () => {
		const permissions: Permissions = [
			{ action: Action.READ, subject: Subject.USER, scope: Scope.OWN },
		];

		const nextState = reducer(
			initialState,
			setPermissions({ permissions })
		);

		expect(nextState.permissions).toEqual(permissions);
	});

	it('should clear permissions', () => {
		const stateWithPermissions = {
			permissions: [
				{
					action: Action.READ,
					subject: Subject.USER,
					scope: Scope.OWN,
				},
			],
		};

		const nextState = reducer(stateWithPermissions, clearPermissions());

		expect(nextState.permissions).toEqual([]);
	});
});
