import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@shared/utils', () => ({
	appErrorMap: {
		serverError: vi.fn(),
		forbidden: vi.fn(),
	},
}));

vi.mock('@shared/middlewares', async () => {
	const actual = await vi.importActual<any>('@shared/middlewares');
	return {
		...actual,
		logger: {
			error: vi.fn(),
			warn: vi.fn(),
		},
	};
});

import { defineAbilityFor, requirePermission } from '@shared/middlewares';
import { appErrorMap } from '@shared/utils';
import { Role, Action, Subject, Scope } from '@prisma-generated/enums';
import { ErrorCode } from '@beggy/shared/constants';

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

describe('defineAbilityFor()', () => {
	it('allows admin to manage any and own bag', () => {
		// Act
		const ability = defineAbilityFor(Role.ADMIN);

		// Assert
		expect(ability.can(Action.MANAGE, `${Subject.BAG}:${Scope.ANY}`)).toBe(
			true
		);
		expect(ability.can(Action.MANAGE, `${Subject.BAG}:${Scope.OWN}`)).toBe(
			true
		);
	});

	it('allows admin to manage any and own item', () => {
		// Act
		const ability = defineAbilityFor(Role.ADMIN);

		// Assert
		expect(ability.can(Action.MANAGE, `${Subject.ITEM}:${Scope.ANY}`)).toBe(
			true
		);
		expect(ability.can(Action.MANAGE, `${Subject.ITEM}:${Scope.OWN}`)).toBe(
			true
		);
	});

	it('allows own scope when any permission exists', () => {
		// Act
		const ability = defineAbilityFor(Role.MEMBER);

		// Assert
		expect(ability.can(Action.READ, `${Subject.BAG}:${Scope.ANY}`)).toBe(
			true
		);
		expect(ability.can(Action.READ, `${Subject.BAG}:${Scope.OWN}`)).toBe(
			true
		);
	});

	it('denies undefined actions', () => {
		// Act
		const ability = defineAbilityFor(Role.USER);

		// Assert
		expect(ability.can(Action.DELETE, `${Subject.USER}:${Scope.ANY}`)).toBe(
			false
		);
	});

	it('returns empty rules for unknown role', () => {
		// Act
		const ability = defineAbilityFor('UNKNOWN_ROLE' as Role);

		// Assert
		expect(ability.rules.length).toBe(0);
	});
});

describe('requirePermission()', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('throws when ability is missing', async () => {
		// Arrange
		const error = new Error() as any;
		error.code = ErrorCode.ABILITY_NOT_INITIALIZED;

		vi.mocked(appErrorMap.serverError).mockReturnValue(error);

		const middleware = requirePermission(Action.CREATE, Subject.BAG);

		const req = createReq(undefined);
		const next = vi.fn();

		// Act + Assert
		await expect(middleware(req, {} as any, next)).rejects.toBe(error);

		expect(appErrorMap.serverError).toHaveBeenCalledWith(
			ErrorCode.ABILITY_NOT_INITIALIZED
		);
	});

	it('denies when permission is missing', async () => {
		// Arrange
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
		const next = vi.fn();

		// Act + Assert
		await expect(middleware(req, {} as any, next)).rejects.toBe(error);

		expect(appErrorMap.forbidden).toHaveBeenCalledWith(
			ErrorCode.INSUFFICIENT_PERMISSIONS
		);
	});

	it('allows when permission exists', async () => {
		// Arrange
		const ability = createAbilityMock({
			[`${Action.CREATE}:${Subject.BAG}:${Scope.OWN}`]: true,
		});

		const middleware = requirePermission(
			Action.CREATE,
			Subject.BAG,
			Scope.OWN
		);

		const req = createReq(ability);
		const next = vi.fn();

		// Act
		await middleware(req, {} as any, next);

		// Assert
		expect(next).toHaveBeenCalledTimes(1);
	});

	it('checks scoped subject correctly', async () => {
		// Arrange
		const ability = createAbilityMock({
			[`${Action.READ}:${Subject.BAG}:${Scope.ANY}`]: true,
		});

		const middleware = requirePermission(
			Action.READ,
			Subject.BAG,
			Scope.ANY
		);

		const req = createReq(ability);
		const next = vi.fn();

		// Act
		await middleware(req, {} as any, next);

		// Assert
		expect(ability.can).toHaveBeenCalledWith(
			Action.READ,
			`${Subject.BAG}:${Scope.ANY}`
		);
	});
});
