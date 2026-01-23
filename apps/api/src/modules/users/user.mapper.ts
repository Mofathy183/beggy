import { User } from '@prisma/generated/prisma/client';
import type { UserDTO, AdminUserDTO } from '@beggy/shared/types';
import { Role } from '@beggy/shared/constants';
import { toISO } from '@shared/utils';

/**
 * User domain mapper.
 *
 * @remarks
 * - Transforms persistence-layer User models into API-safe DTOs
 * - Enforces explicit exposure rules per endpoint type
 * - Centralizes user field normalization and serialization
 *
 * This mapper intentionally:
 * - Does NOT perform authorization checks
 * - Does NOT expose internal database-only fields
 * - Does NOT mutate the input entity
 */
export const UserMapper = {
	/**
	 * Maps a User model to a public-facing {@link UserDTO}.
	 *
	 * @remarks
	 * - Used for list endpoints and non-privileged views
	 * - Excludes sensitive operational fields
	 *   (e.g. activation and verification flags)
	 *
	 * @param user - User entity from the persistence layer
	 * @returns Normalized {@link UserDTO}
	 *
	 * @example
	 * ```ts
	 * const users = dbUsers.map(UserMapper.toDTO);
	 * ```
	 */
	toDTO(user: User): UserDTO {
		return {
			/** Unique user identifier */
			id: user.id,

			/** User email address */
			email: user.email,

			/** Assigned system role */
			role: user.role as Role,

			/** Account creation timestamp (ISO-8601) */
			createdAt: toISO(user.createdAt),

			/** Last update timestamp (ISO-8601) */
			updatedAt: toISO(user.updatedAt),
		};
	},

	/**
	 * Maps a User model to an administrative {@link AdminUserDTO}.
	 *
	 * @remarks
	 * - Intended for privileged administrative endpoints only
	 * - Extends {@link UserDTO} with operational and trust flags
	 * - Should never be exposed to public or self-service endpoints
	 *
	 * @param user - User entity from the persistence layer
	 * @returns {@link AdminUserDTO} with sensitive fields included
	 *
	 * @example
	 * ```ts
	 * const adminUser = UserMapper.toAdminDTO(user);
	 * ```
	 */
	toAdminDTO(user: User): AdminUserDTO {
		return {
			...this.toDTO(user),

			/** Whether the account is currently active */
			isActive: user.isActive,

			/** Whether the user's email has been verified */
			isEmailVerified: user.isEmailVerified,
		};
	},
};
