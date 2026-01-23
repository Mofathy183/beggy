import { describe, it, expect } from 'vitest';
import { UserMapper } from '@modules/users';
import { buildUser } from '@modules/users/__tests__/factories/user.factory';
import type { User } from '@prisma/generated/prisma/client';

describe('UserMapper', () => {
	describe('toDTO()', () => {
		it('returns a public user representation', () => {
			// Arrange
			const user = buildUser();

			// Act
			const dto = UserMapper.toDTO(user as User);

			// Assert
			expect(dto).toEqual({
				id: user.id,
				email: user.email,
				role: user.role,
				createdAt: user.createdAt.toISOString(),
				updatedAt: user.updatedAt.toISOString(),
			});
		});

		it('excludes administrative fields', () => {
			// Arrange
			const user = {
				...buildUser(),
				isActive: false,
				isEmailVerified: true,
			};

			// Act
			const dto = UserMapper.toDTO(user) as any;

			// Assert
			expect(dto.isActive).toBeUndefined();
			expect(dto.isEmailVerified).toBeUndefined();
		});

		it('formats timestamps as ISO strings', () => {
			// Arrange
			const user = buildUser();

			// Act
			const dto = UserMapper.toDTO(user as User);

			// Assert
			expect(dto.createdAt).toBe(user.createdAt.toISOString());
			expect(dto.updatedAt).toBe(user.updatedAt.toISOString());
		});
	});

	describe('toAdminDTO()', () => {
		it('returns an administrative user representation', () => {
			// Arrange
			const user = {
				...buildUser(),
				isActive: false,
				isEmailVerified: true,
			};

			// Act
			const dto = UserMapper.toAdminDTO(user);

			// Assert
			expect(dto).toMatchObject({
				id: user.id,
				email: user.email,
				role: user.role,
				isActive: user.isActive,
				isEmailVerified: user.isEmailVerified,
			});
		});

		it('includes operational flags', () => {
			// Arrange
			const user = {
				...buildUser(),
				isActive: false,
				isEmailVerified: true,
			};

			// Act
			const dto = UserMapper.toAdminDTO(user);

			// Assert
			expect(dto.isActive).toBe(false);
			expect(dto.isEmailVerified).toBe(true);
		});
	});
});
