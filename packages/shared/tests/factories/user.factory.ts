import { faker } from '@faker-js/faker';
import { type UserDTO } from '../../src/types/user.types.js';
import { Role } from '../../src/constants/auth.enums.js';

/**
 * Fields that can be overridden when creating a User via factories.
 *
 * IMPORTANT:
 * - This intentionally excludes relations and system-managed fields.
 * - A factory should only allow overrides for fields it actually owns.
 */
type UserFactoryOverrides = Partial<Pick<UserDTO, 'email' | 'role'>>;

/**
 * Optional configuration for factory-generated values.
 * Used when you want more control without hardcoding overrides.
 */
type UserFactoryOptions = {
	email?: {
		firstName?: string;
		lastName?: string;
	};
};

/**
 * Creates a valid **non-persisted** User entity.
 *
 * Use this factory when testing:
 * - request bodies
 * - DTOs
 * - schema validation
 * - frontend form data
 *
 * This function intentionally:
 * - does NOT generate `id`
 * - does NOT generate timestamps
 * - does NOT create relations
 */
export const userFactory = (
	overrides: UserFactoryOverrides = {},
	options: UserFactoryOptions = {}
): Omit<UserDTO, 'id' | 'createdAt' | 'updatedAt'> => ({
	email: overrides.email ?? faker.internet.email(options.email),

	role: overrides.role ?? Role.USER,
});

/**
 * Creates a **persisted** User entity.
 *
 * Use this factory when testing:
 * - API responses
 * - authentication / authorization
 * - ownership and permissions
 * - database mocks (Prisma results)
 *
 * This represents a User that already exists in the system.
 */
export const buildUser = (
	overrides: UserFactoryOverrides = {},
	options: UserFactoryOptions = {}
): Omit<UserDTO, 'createdAt' | 'updatedAt'> => {
	// const createdAt = faker.date.past().toISOString();
	// const updatedAt = faker.date.between({ from: createdAt, to: new Date() }).toISOString();

	return {
		id: faker.string.uuid(),

		...userFactory(overrides, options),
	};
};

/**
 * Creates a list of **persisted** User entities.
 *
 * This is a convenience wrapper around `buildUser` and should be used when
 * testing scenarios that require multiple users, such as:
 *
 * - pagination and list endpoints
 * - authorization and permission checks
 * - ownership and access control
 * - database query results
 *
 * IMPORTANT:
 * - All returned users are considered persisted (they include `id` and timestamps).
 * - Relations are NOT created automatically.
 * - Each user is generated independently.
 *
 * @param count - Number of users to generate.
 * @param overrides - Optional field overrides applied to every generated user.
 * @param options - Optional configuration for generated values (e.g. email details).
 *
 * @returns An array of persisted `User` entities.
 */
export const buildUsers = (
	count: number,
	overrides?: UserFactoryOverrides,
	options?: UserFactoryOptions
): Omit<UserDTO, 'createdAt' | 'updatedAt'>[] =>
	Array.from({ length: count }, () => buildUser(overrides, options));
