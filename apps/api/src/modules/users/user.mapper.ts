import { type User } from '@prisma/generated/prisma/client';
import type { UserDTO, AdminUserDTO } from '@beggy/shared/types';
import { type Role } from '@beggy/shared/constants';
import { toISO } from '@shared/utils';

/**
 * User domain mapper.
 *
 * @description
 * Transforms persistence-layer User models into API-safe DTOs.
 *
 * @remarks
 * - Centralizes serialization (e.g. date normalization)
 * - Enforces explicit data exposure per use-case
 * - Does not perform authorization or mutate input
 */
export const UserMapper = {
	/**
	 * Maps a User entity to a public-facing DTO.
	 *
	 * @remarks
	 * Intended for non-privileged contexts (e.g. listings, self views).
	 * Excludes operational and security-related fields.
	 *
	 * @param user - Persistence-layer User entity
	 * @returns Public-safe {@link UserDTO}
	 */
	toDTO(user: User): UserDTO {
		return {
			id: user.id,
			email: user.email,
			role: user.role as Role,
			createdAt: toISO(user.createdAt),
			updatedAt: toISO(user.updatedAt),
		};
	},

	/**
	 * Maps a User entity to an admin-level DTO.
	 *
	 * @remarks
	 * Extends the public DTO with operational flags.
	 * Must only be used in trusted administrative contexts.
	 *
	 * @param user - Persistence-layer User entity
	 * @returns {@link AdminUserDTO} including sensitive fields
	 */
	toAdminDTO(user: User): AdminUserDTO {
		return {
			...this.toDTO(user),
			isActive: user.isActive,
			isEmailVerified: user.isEmailVerified,
		};
	},

	/**
	 * Maps a collection of users to admin DTOs.
	 *
	 * @param users - Persistence-layer User entities
	 * @returns Array of {@link AdminUserDTO}
	 */
	toAdminDTOList(users: User[]): AdminUserDTO[] {
		return users.map((user) => this.toAdminDTO(user));
	},
};
