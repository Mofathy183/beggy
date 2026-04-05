import { describe, it, expect } from 'vitest';
import { UserMapper } from '@modules/users';
import {
	buildUser,
	buildUsers,
} from '@modules/users/__tests__/factories/user.factory';
import type { User } from '@prisma/generated/prisma/client';

describe('UserMapper', () => {
	describe('toDTO()', () => {
		it('returns a public user DTO', () => {
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

		it('excludes administrative fields from the DTO', () => {
			// Arrange
			const user = buildUser({
				isActive: false,
				isEmailVerified: true,
			});

			// Act
			const dto = UserMapper.toDTO(user as User) as any;

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
		it('returns an admin user DTO', () => {
			// Arrange
			const user = buildUser({
				isActive: false,
				isEmailVerified: true,
			});

			// Act
			const dto = UserMapper.toAdminDTO(user as User);

			// Assert
			expect(dto).toEqual({
				id: user.id,
				email: user.email,
				role: user.role,
				createdAt: user.createdAt.toISOString(),
				updatedAt: user.updatedAt.toISOString(),
				isActive: user.isActive,
				isEmailVerified: user.isEmailVerified,
			});
		});

		it('extends the base DTO with administrative fields', () => {
			// Arrange
			const user = buildUser();

			// Act
			const base = UserMapper.toDTO(user as User);
			const admin = UserMapper.toAdminDTO(user as User);

			// Assert
			expect(admin).toMatchObject(base);
		});
	});

	describe('toAdminDTOList()', () => {
		it('returns a list of admin DTOs', () => {
			// Arrange
			const users = buildUsers(3);

			// Act
			const result = UserMapper.toAdminDTOList(users as User[]);

			// Assert
			expect(result).toHaveLength(3);

			result.forEach((dto, index) => {
				const user = users[index] as any;

				expect(dto).toEqual({
					id: user.id,
					email: user.email,
					role: user.role,
					createdAt: user.createdAt.toISOString(),
					updatedAt: user.updatedAt.toISOString(),
					isActive: user.isActive,
					isEmailVerified: user.isEmailVerified,
				});
			});
		});

		it('returns an empty array when the input list is empty', () => {
			// Arrange
			const users: User[] = [];

			// Act
			const result = UserMapper.toAdminDTOList(users);

			// Assert
			expect(result).toEqual([]);
		});
	});
});
