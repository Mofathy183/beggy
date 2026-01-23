import { faker } from '@faker-js/faker';
import type { ProfileModel } from '@prisma-generated/models';
import { Gender } from '@prisma-generated/enums.js';

/**
 * Fields that can be overridden when creating a Profile via factories.
 *
 * Intentionally excludes:
 * - identity fields
 * - timestamps
 * - computed fields
 * - userId (must always be explicit)
 */
type ProfileFactoryOverrides = Partial<
	Pick<
		ProfileModel,
		| 'firstName'
		| 'lastName'
		| 'avatarUrl'
		| 'gender'
		| 'birthDate'
		| 'country'
		| 'city'
	>
>;

/**
 * Optional configuration flags for profile factories.
 */
type ProfileFactoryOptions = {
	/**
	 * When enabled, optional user-editable fields
	 * (avatar, gender, birthDate, country, city)
	 * will be populated with realistic fake data.
	 *
	 * When disabled (default), these fields are `null`,
	 * reflecting real-world incomplete profiles.
	 */
	withDetails?: boolean;
};

/**
 * Creates a valid **non-persisted** Profile entity.
 *
 * Use this factory when testing:
 * - profile creation and update DTOs
 * - request bodies
 * - frontend form state
 *
 * IMPORTANT:
 * - `userId` is required and must be provided explicitly
 * - Does NOT generate `id` or timestamps
 * - Does NOT include computed fields (`displayName`, `age`)
 * - Optional fields default to `null` unless `withDetails` is enabled
 */
export const profileFactory = (
	userId: string,
	overrides: ProfileFactoryOverrides = {},
	options: ProfileFactoryOptions = {}
): Omit<
	ProfileModel,
	'id' | 'createdAt' | 'updatedAt' | 'displayName' | 'age'
> => ({
	userId,

	firstName: overrides.firstName ?? faker.person.firstName(),
	lastName: overrides.lastName ?? faker.person.lastName(),

	avatarUrl:
		overrides.avatarUrl ??
		(options.withDetails ? faker.image.avatar() : null),

	gender:
		overrides.gender ??
		(options.withDetails
			? faker.helpers.arrayElement(Object.values(Gender))
			: null),

	birthDate:
		overrides.birthDate ??
		(options.withDetails
			? faker.date.birthdate({ min: 18, max: 65, mode: 'age' })
			: null),

	country:
		overrides.country ??
		(options.withDetails ? faker.location.country() : null),

	city:
		overrides.city ?? (options.withDetails ? faker.location.city() : null),
});

/**
 * Creates a **persisted** Profile entity.
 *
 * Use this factory when testing:
 * - API responses
 * - database query results
 * - ownership and user/profile relationships
 *
 * Represents a Profile that already exists in the system.
 *
 * IMPORTANT:
 * - Computed fields (`displayName`, `age`) are intentionally excluded
 *   and should be added explicitly at the serialization layer if needed.
 */
export const buildProfile = (
	userId: string,
	overrides: ProfileFactoryOverrides = {}
): ProfileModel => {
	const createdAt = faker.date.past();
	const updatedAt = faker.date.between({ from: createdAt, to: new Date() });

	return {
		id: faker.string.uuid(),

		...profileFactory(userId, overrides),

		createdAt,
		updatedAt,
	};
};

/**
 * Creates a list of **persisted** Profile entities.
 *
 * Useful for:
 * - list endpoints
 * - pagination tests
 * - mocking database results
 *
 * IMPORTANT:
 * - All profiles belong to the provided userId
 * - Profiles are generated independently
 */
export const buildProfiles = (
	count: number,
	userId: string,
	overrides: ProfileFactoryOverrides = {}
): ProfileModel[] =>
	Array.from({ length: count }, () => buildProfile(userId, overrides));
