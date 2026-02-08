import { describe, it, expect } from 'vitest';
import { defineAbilityForUser } from '../ability';
import { Action, Scope, Subject } from '@beggy/shared/constants';
import type { Permissions } from '@beggy/shared/types';

describe('defineAbilityForUser', () => {
	it('returns an ability with no rules when permissions are empty', () => {
		const ability = defineAbilityForUser([]);

		expect(ability.rules).toHaveLength(0);
	});

	it('grants abilities exactly as provided by backend permissions', () => {
		const permissions: Permissions = [
			{
				action: Action.READ,
				subject: Subject.USER,
				scope: Scope.OWN,
			},
			{
				action: Action.UPDATE,
				subject: Subject.PROFILE,
				scope: Scope.OWN,
			},
		];

		const ability = defineAbilityForUser(permissions);

		expect(ability.can(Action.READ, Subject.USER)).toBe(true);
		expect(ability.can(Action.UPDATE, Subject.PROFILE)).toBe(true);
	});

	it('does not grant permissions that were not provided', () => {
		const permissions: Permissions = [
			{
				action: Action.READ,
				subject: Subject.USER,
				scope: Scope.OWN,
			},
		];

		const ability = defineAbilityForUser(permissions);

		expect(ability.can(Action.DELETE, Subject.USER)).toBe(false);
		expect(ability.can(Action.READ, Subject.PROFILE)).toBe(false);
	});

	it('rejects object-based subject checks to enforce tuple-only usage', () => {
		const permissions: Permissions = [
			{
				action: Action.READ,
				subject: Subject.USER,
				scope: Scope.OWN,
			},
		];

		const ability = defineAbilityForUser(permissions);

		expect(() => {
			ability.can(Action.READ, { __typename: Subject.USER } as any);
		}).toThrow();
	});
});
