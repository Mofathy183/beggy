import { AuthProvider, Role } from '@beggy/shared/constants';
import { AuthMeDTO, Permissions } from '@beggy/shared/types';
import { AuthMe } from '@shared/types';
import { toISO } from '@shared/utils';
import { getAge, getDisplayName } from '@prisma/prisma.util';

/**
 * AuthMapper
 *
 * Maps internal auth domain models into safe, public-facing DTOs.
 * This layer enforces data exposure boundaries between backend and client.
 */
export const AuthMapper = {
	/**
	 * Converts an authenticated user domain model into an AuthMeDTO.
	 *
	 * @remarks
	 * - Excludes sensitive authentication data
	 * - Normalizes profile fields for UI consumption
	 * - Exposes auth capabilities instead of credentials
	 */
	toDTO: (user: AuthMe, permissions: Permissions): AuthMeDTO => {
		const providers = user.account.map(
			(account) => account.authProvider
		) as AuthProvider[];

		// Indicates whether the user has a LOCAL auth method linked
		const hasLocalAuth = user.account.some(
			(account) => account.authProvider === 'LOCAL'
		);

		return {
			user: {
				id: user.id,
				email: user.email,
				role: user.role as Role,
				createdAt: toISO(user.createdAt),
			},

			profile: user.profile
				? {
						firstName: user.profile.firstName,
						lastName: user.profile.lastName,
						avatarUrl: user.profile.avatarUrl,
						displayName: getDisplayName(
							user.profile.firstName,
							user.profile.lastName
						),
						age: user.profile.birthDate
							? getAge(user.profile.birthDate)
							: null,
						city: user.profile.city,
						country: user.profile.country,
					}
				: null,

			permissions,

			auth: {
				providers,
				hasLocalAuth,
			},
		};
	},
};
