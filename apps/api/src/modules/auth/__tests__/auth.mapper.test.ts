import { describe, it, expect, vi, beforeEach } from 'vitest';

import { AuthMapper } from '../auth.mapper';
import { Role, AuthProvider } from '@beggy/shared/constants';

import { buildUser } from '@modules/users/__tests__/factories/user.factory';
import { buildProfile } from '@modules/profiles/__tests__/factories/profile.factory';

import { getAge, getDisplayName } from '@prisma/prisma.util';
import { toISO } from '@shared/utils';

vi.mock('@prisma/prisma.util', () => ({
	getDisplayName: vi.fn(),
	getAge: vi.fn(),
}));

vi.mock('@shared/utils/transform.util', () => ({
	toISO: vi.fn(),
}));

describe('AuthMapper', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('toDTO()', () => {
		it('returns mapped user identity with ISO date', () => {
			const user = {
				...buildUser({ role: Role.USER }),
				profile: null,
				account: [],
			};

			(toISO as any).mockReturnValue('2026-01-01T00:00:00.000Z');

			const result = AuthMapper.toDTO(user as any, []);

			expect(toISO).toHaveBeenCalledWith(user.createdAt);

			expect(result.user).toEqual({
				id: user.id,
				email: user.email,
				role: Role.USER,
				createdAt: '2026-01-01T00:00:00.000Z',
			});
		});

		it('returns null profile when profile does not exist', () => {
			const user = {
				...buildUser(),
				profile: null,
				account: [],
			};

			const result = AuthMapper.toDTO(user as any, []);

			expect(result.profile).toBeNull();
		});

		it('maps profile and calculates age when birthDate exists', () => {
			const profile = buildProfile(
				'user-id',
				{},
				{
					withDetails: true,
				}
			);

			(getDisplayName as any).mockReturnValue('Jane Doe');
			(getAge as any).mockReturnValue(28);

			const user = {
				...buildUser(),
				profile,
				account: [],
			};

			const result = AuthMapper.toDTO(user as any, []);

			expect(getDisplayName).toHaveBeenCalledWith(
				profile.firstName,
				profile.lastName
			);

			expect(getAge).toHaveBeenCalledWith(profile.birthDate);

			expect(result.profile).toEqual({
				firstName: profile.firstName,
				lastName: profile.lastName,
				avatarUrl: profile.avatarUrl,
				displayName: 'Jane Doe',
				age: 28,
				city: profile.city,
				country: profile.country,
			});
		});

		it('returns null age when birthDate is missing', () => {
			const profile = buildProfile('user-id', {
				birthDate: null,
			});

			const user = {
				...buildUser(),
				profile,
				account: [],
			};

			const result = AuthMapper.toDTO(user as any, []);

			expect(getAge).not.toHaveBeenCalled();
			expect(result.profile?.age).toBeNull();
		});

		it('returns auth providers and detects local auth', () => {
			const user = {
				...buildUser(),
				profile: null,
				account: [
					{ authProvider: AuthProvider.LOCAL },
					{ authProvider: AuthProvider.GOOGLE },
				],
			};

			const result = AuthMapper.toDTO(user as any, []);

			expect(result.auth.providers).toEqual([
				AuthProvider.LOCAL,
				AuthProvider.GOOGLE,
			]);

			expect(result.auth.hasLocalAuth).toBe(true);
		});

		it('returns hasLocalAuth false when no local provider exists', () => {
			const user = {
				...buildUser(),
				profile: null,
				account: [{ authProvider: AuthProvider.GOOGLE }],
			};

			const result = AuthMapper.toDTO(user as any, []);

			expect(result.auth.hasLocalAuth).toBe(false);
		});

		it('passes permissions through unchanged', () => {
			const permissions = [
				{ action: 'READ', scope: 'OWN', subject: 'PROFILE' },
			];

			const user = {
				...buildUser(),
				profile: null,
				account: [],
			};

			const result = AuthMapper.toDTO(user as any, permissions as any);

			expect(result.permissions).toBe(permissions);
		});
	});
});
