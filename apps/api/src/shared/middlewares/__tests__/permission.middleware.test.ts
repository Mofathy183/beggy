import { describe, it, expect, vi } from 'vitest';
import { defineAbilityFor, requirePermission } from '@shared/middlewares';
import { Role, Action, Subject, ErrorCode } from '@beggy/shared/constants';

const mockNext = vi.fn();

const mockAbility = (canDo: boolean) => ({
	can: vi.fn().mockReturnValue(canDo),
	cannot: vi.fn().mockReturnValue(!canDo),
});

const mockReq = (ability?: any) =>
	({
		ability,
	}) as any;

describe('defineAbilityFor', () => {
	it('allows actions defined for the role', () => {
		const ability = defineAbilityFor(Role.ADMIN);

		expect(ability.can(Action.MANAGE, Subject.BAG)).toBe(true);
	});

	it('denies actions not defined for the role', () => {
		const ability = defineAbilityFor(Role.USER);

		expect(ability.can(Action.DELETE, Subject.USER)).toBe(false);
	});

	it('returns no permissions for unknown roles', () => {
		const ability = defineAbilityFor('UNKNOWN_ROLE' as Role);

		expect(ability.rules.length).toBe(0);
	});
});

describe('requirePermission', () => {
	it('throws when ability is not initialized', async () => {
		const middleware = requirePermission(Action.CREATE, Subject.BAG);

		const req = mockReq(undefined);

		await expect(
			middleware(req, {} as any, mockNext)
		).rejects.toMatchObject({
			code: ErrorCode.ABILITY_NOT_INITIALIZED,
		});
	});

	it('denies access when permission is missing', async () => {
		const middleware = requirePermission(Action.CREATE, Subject.BAG);

		const ability = mockAbility(false);
		const req = mockReq(ability);

		await expect(
			middleware(req, {} as any, mockNext)
		).rejects.toMatchObject({
			code: ErrorCode.INSUFFICIENT_PERMISSIONS,
		});
	});

	it('allows requests with sufficient permission', async () => {
		const middleware = requirePermission(Action.CREATE, Subject.BAG);

		const ability = mockAbility(true);
		const req = mockReq(ability);

		await middleware(req, {} as any, mockNext);

		expect(mockNext).toHaveBeenCalledOnce();
	});
});
