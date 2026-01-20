import { User, Profile } from '@prisma/generated/prisma/client';
import { getAge, getDisplayName } from '@prisma';
import type {
	UserDTO,
	AdminUserDTO,
	ProfileDTO,
} from '@beggy/shared/types';
import { Role, Gender } from '@beggy/shared/constants';
import { toISO } from "@shared/utils"

type ProfileWithComputed = Profile & {
	displayName?: string | null;
	age?: number | null;
};


export const UserMapper = {
	/**
	 * Maps a Prisma User model to a public UserDTO.
	 *
	 * @remarks
	 * - Used for lists and non-privileged admin views
	 * - Does NOT expose status or verification flags
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
	 * Maps a Prisma User model to an AdminUserDTO.
	 *
	 * @remarks
	 * - Intended for privileged administrative endpoints
	 * - Extends the base UserDTO with sensitive flags
	 */
	toAdminDTO(user: User): AdminUserDTO {
		return {
			...this.toDTO(user),
			isActive: user.isActive,
			isEmailVerified: user.isEmailVerified,
		};
	},

	/**
	 * Maps a Prisma Profile model to a ProfileDTO.
	 *
	 * @remarks
	 * - Exposes only safe, user-facing profile fields
	 * - Computes derived fields (displayName, age)
	 */
	toProfileDTO(profile: ProfileWithComputed): ProfileDTO {
		return {
			id: profile.id,
			userId: profile.userId,
			firstName: profile.firstName,
			lastName: profile.lastName,
			avatarUrl: profile.avatarUrl,
			gender: profile.gender as Gender,
			birthDate: profile.birthDate ? toISO(profile.birthDate) : null,
			country: profile.country,
			city: profile.city,
			displayName:
				profile?.displayName ??
				getDisplayName(profile.firstName, profile.lastName),
			age: profile?.age ? getAge(profile.birthDate) : null,
			createdAt: toISO(profile.createdAt),
			updatedAt: toISO(profile.updatedAt),
		};
	},

	/**
	 * Maps a Prisma User with Profile relation
	 * into an admin-ready composite response.
	 *
	 * @remarks
	 * - Convenience mapper for GET /users/:id
	 * - Prevents controller-level composition logic
	 */
	toAdminDetails(user: User & { profile: Profile | null }) {
		return {
			user: this.toAdminDTO(user),
			profile: user.profile ? this.toProfileDTO(user.profile) : null,
		};
	},
};
