/**
 * Gender classification for user profiles.
 *
 * @remarks
 * - Optional and user-provided
 * - Should never be required for authentication or authorization
 * - Included strictly for profile and UX personalization
 */
export enum Gender {
	MALE = 'MALE',
	FEMALE = 'FEMALE',
	OTHER = 'OTHER',
}

/**
 * Allowed "order by" fields for Profile queries.
 *
 * @remarks
 * - Exposes only non-sensitive, profile-facing fields
 * - Prevents sorting by internal or private profile attributes
 */
export enum ProfileOrderByField {
	CREATED_AT = 'createdAt',
	UPDATED_AT = 'updatedAt',
	FIRST_NAME = 'firstName',
	LAST_NAME = 'lastName',
}
