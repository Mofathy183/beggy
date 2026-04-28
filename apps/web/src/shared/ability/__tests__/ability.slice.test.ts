import {
	setPermissions,
	abilityReducer,
	clearPermissions,
} from '../ability.slice';
import type { Permissions } from '@beggy/shared/types';
import { Action, Scope, Subject } from '@beggy/shared/constants';

describe('abilityReducer', () => {
	const initialState = {
		permissions: [],
	};

	const mockPermissions: Permissions = [
		{ action: Action.READ, subject: Subject.USER, scope: Scope.OWN },
	];

	const otherPermissions: Permissions = [
		{ action: Action.CREATE, subject: Subject.USER, scope: Scope.ANY },
	];

	it('returns the initial state for unknown actions', () => {
		expect(abilityReducer(undefined, { type: 'unknown' })).toEqual(
			initialState
		);
	});

	it('replaces permissions with the provided payload', () => {
		const nextState = abilityReducer(
			initialState,
			setPermissions({ permissions: mockPermissions })
		);

		expect(nextState.permissions).toEqual(mockPermissions);
	});

	it('overwrites existing permissions when setPermissions is called again', () => {
		const stateWithPermissions = abilityReducer(
			initialState,
			setPermissions({ permissions: mockPermissions })
		);

		const nextState = abilityReducer(
			stateWithPermissions,
			setPermissions({ permissions: otherPermissions })
		);

		expect(nextState.permissions).toEqual(otherPermissions);
	});

	it('clears all permissions', () => {
		const stateWithPermissions = {
			permissions: mockPermissions,
		};

		const nextState = abilityReducer(
			stateWithPermissions,
			clearPermissions()
		);

		expect(nextState.permissions).toEqual([]);
	});

	it('clears permissions after they were previously set', () => {
		const stateWithPermissions = abilityReducer(
			initialState,
			setPermissions({ permissions: mockPermissions })
		);

		const nextState = abilityReducer(
			stateWithPermissions,
			clearPermissions()
		);

		expect(nextState.permissions).toEqual([]);
	});

	it('does not mutate the previous state when setting permissions', () => {
		const prevState = { permissions: [] as Permissions };

		const nextState = abilityReducer(
			prevState,
			setPermissions({ permissions: mockPermissions })
		);

		expect(prevState.permissions).toEqual([]); // unchanged
		expect(nextState).not.toBe(prevState);
	});

	it('does not mutate the previous state when clearing permissions', () => {
		const prevState = { permissions: mockPermissions };

		const nextState = abilityReducer(prevState, clearPermissions());

		expect(prevState.permissions).toEqual(mockPermissions); // unchanged
		expect(nextState).not.toBe(prevState);
	});
});
