import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@shared/utils', () => {
	return {
		appErrorMap: {
			serverError: vi.fn(),
			forbidden: vi.fn(),
		},
	};
});

import { defineAbilityFor, requirePermission } from '@shared/middlewares';
import { appErrorMap } from '@shared/utils';
import { Role, Action, Subject, Scope } from '@prisma-generated/enums';
import { ErrorCode } from '@beggy/shared/constants';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const createAbilityMock = (permissions: Record<string, boolean>) => ({
	can: vi.fn((action: Action, subject: string) => {
		return permissions[`${action}:${subject}`] ?? false;
	}),
});

const createReq = (ability?: any) =>
	({
		ability,
		user: { id: 'user-1' },
	}) as any;

const next = vi.fn();

// ─────────────────────────────────────────────────────────────────────────────
// defineAbilityFor
// ─────────────────────────────────────────────────────────────────────────────

describe('defineAbilityFor()', () => {
	it('allows manage action on any and own scopes for admin role', () => {
		const ability = defineAbilityFor(Role.ADMIN);

		expect(ability.can(Action.MANAGE, `${Subject.BAG}:${Scope.ANY}`)).toBe(
			true
		);
		expect(ability.can(Action.MANAGE, `${Subject.BAG}:${Scope.OWN}`)).toBe(
			true
		);
	});

	it('allows own scope when any scope permission exists', () => {
		// Arrange
		const ability = defineAbilityFor(Role.MEMBER);

		// Act + Assert
		expect(ability.can(Action.READ, `${Subject.BAG}:${Scope.ANY}`)).toBe(
			true
		);

		expect(ability.can(Action.READ, `${Subject.BAG}:${Scope.OWN}`)).toBe(
			true
		);
	});

	it('allows manage action on any and own scopes for admin role', () => {
		const ability = defineAbilityFor(Role.ADMIN);

		expect(ability.can(Action.MANAGE, `${Subject.ITEM}:${Scope.ANY}`)).toBe(
			true
		);

		expect(ability.can(Action.MANAGE, `${Subject.ITEM}:${Scope.OWN}`)).toBe(
			true
		);
	});

	it('denies undefined actions for the role', () => {
		const ability = defineAbilityFor(Role.USER);

		expect(ability.can(Action.DELETE, `${Subject.USER}:${Scope.ANY}`)).toBe(
			false
		);
	});

	it('returns empty ability when role is unknown', () => {
		const ability = defineAbilityFor('UNKNOWN_ROLE' as Role);

		expect(ability.rules.length).toBe(0);
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// requirePermission
// ─────────────────────────────────────────────────────────────────────────────

describe('requirePermission()', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('throws when ability is not initialized', async () => {
		const error = new Error() as any;
		error.code = ErrorCode.ABILITY_NOT_INITIALIZED;

		vi.mocked(appErrorMap.serverError).mockReturnValue(error);

		const middleware = requirePermission(Action.CREATE, Subject.BAG);

		const req = createReq(undefined);

		await expect(middleware(req, {} as any, next)).rejects.toBe(error);

		expect(appErrorMap.serverError).toHaveBeenCalledWith(
			ErrorCode.ABILITY_NOT_INITIALIZED
		);
	});

	it('denies access when permission is missing', async () => {
		const error = new Error() as any;
		error.code = ErrorCode.INSUFFICIENT_PERMISSIONS;

		vi.mocked(appErrorMap.forbidden).mockReturnValue(error);

		const ability = createAbilityMock({});

		const middleware = requirePermission(
			Action.CREATE,
			Subject.BAG,
			Scope.OWN
		);

		const req = createReq(ability);

		await expect(middleware(req, {} as any, next)).rejects.toBe(error);

		expect(appErrorMap.forbidden).toHaveBeenCalledWith(
			ErrorCode.INSUFFICIENT_PERMISSIONS
		);
	});

	it('allows access when direct permission exists', async () => {
		const ability = createAbilityMock({
			[`${Action.CREATE}:${Subject.BAG}:${Scope.OWN}`]: true,
		});

		const middleware = requirePermission(
			Action.CREATE,
			Subject.BAG,
			Scope.OWN
		);

		const req = createReq(ability);

		await middleware(req, {} as any, next);

		expect(next).toHaveBeenCalledTimes(1);
	});

	it('allows access when manage permission exists', async () => {
		const ability = createAbilityMock({
			[`${Action.MANAGE}:${Subject.BAG}:${Scope.OWN}`]: true,
		});

		const middleware = requirePermission(
			Action.CREATE,
			Subject.BAG,
			Scope.OWN
		);

		const req = createReq(ability);

		await middleware(req, {} as any, next);

		expect(next).toHaveBeenCalledTimes(1);
	});

	it('uses scoped subject when checking permission', async () => {
		const ability = createAbilityMock({
			[`${Action.READ}:${Subject.BAG}:${Scope.ANY}`]: true,
		});

		const middleware = requirePermission(
			Action.READ,
			Subject.BAG,
			Scope.ANY
		);

		const req = createReq(ability);

		await middleware(req, {} as any, next);

		expect(ability.can).toHaveBeenCalledWith(
			Action.READ,
			`${Subject.BAG}:${Scope.ANY}`
		);
	});
});
