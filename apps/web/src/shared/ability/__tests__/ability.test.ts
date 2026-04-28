import { describe, it, expect } from 'vitest';
import { defineAbilityForUser } from '../ability';
import { Action, Scope, Subject } from '@beggy/shared/constants';
import type { Permissions } from '@beggy/shared/types';

describe('defineAbilityForUser()', () => {
	it('returns no rules when permissions are empty', () => {
		const ability = defineAbilityForUser([]);

		expect(ability.rules).toHaveLength(0);
	});

	it('grants abilities using scoped subjects exactly as defined', () => {
		const permissions: Permissions = [
			{
				action: Action.READ,
				subject: Subject.USER,
				scope: Scope.OWN,
			},
		];

		const ability = defineAbilityForUser(permissions);

		expect(ability.can(Action.READ, 'USER:OWN')).toBe(true);
		expect(ability.can(Action.READ, 'USER:ANY')).toBe(false);
	});

	it('allows OWN access when scope is ANY', () => {
		const permissions: Permissions = [
			{
				action: Action.READ,
				subject: Subject.USER,
				scope: Scope.ANY,
			},
		];

		const ability = defineAbilityForUser(permissions);

		expect(ability.can(Action.READ, 'USER:ANY')).toBe(true);
		expect(ability.can(Action.READ, 'USER:OWN')).toBe(true);
	});

	it('grants both OWN and ANY when action is MANAGE', () => {
		const permissions: Permissions = [
			{
				action: Action.MANAGE,
				subject: Subject.USER,
				scope: Scope.OWN, // irrelevant for MANAGE
			},
		];

		const ability = defineAbilityForUser(permissions);

		expect(ability.can(Action.MANAGE, 'USER:OWN')).toBe(true);
		expect(ability.can(Action.MANAGE, 'USER:ANY')).toBe(true);
	});

	it('does not allow abilities that were not provided', () => {
		const permissions: Permissions = [
			{
				action: Action.READ,
				subject: Subject.USER,
				scope: Scope.OWN,
			},
		];

		const ability = defineAbilityForUser(permissions);

		expect(ability.can(Action.DELETE, 'USER:OWN')).toBe(false);
		expect(ability.can(Action.READ, 'PROFILE:OWN')).toBe(false);
	});

	it('supports multiple permissions without overriding each other', () => {
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

		expect(ability.can(Action.READ, 'USER:OWN')).toBe(true);
		expect(ability.can(Action.UPDATE, 'PROFILE:OWN')).toBe(true);
	});

	it('denies checks when subject is not a scoped string', () => {
		const permissions: Permissions = [
			{
				action: Action.READ,
				subject: Subject.USER,
				scope: Scope.OWN,
			},
		];

		const ability = defineAbilityForUser(permissions);

		expect(ability.can(Action.READ, 'USER' as any)).toBe(false);
	});
});
