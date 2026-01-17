/**
 * Allowed user ordering fields.
 *
 * @remarks
 * - Defines the whitelist of sortable fields for user list endpoints
 * - Prevents arbitrary or unsafe ordering inputs
 * - Designed to be consumed by a shared `orderBy` schema builder
 */
export enum UserOrderByField {
	CREATED_AT = 'createdAt',
	UPDATED_AT = 'updatedAt',
	EMAIL = 'email',
	ROLE = 'role',
}
