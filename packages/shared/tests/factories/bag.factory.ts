import { faker } from '@faker-js/faker';
import { Bag, BagFeature, BagType, Size, Material } from '@beggy/shared/types';

type BagFactoryOverrides = Partial<
	Pick<
		Bag,
		| 'name'
		| 'type'
		| 'color'
		| 'size'
		| 'maxCapacity'
		| 'maxWeight'
		| 'bagWeight'
		| 'material'
		| 'features'
	>
>;

type BagFactoryOmitFields = Omit<
	Bag,
	| 'id'
	| 'createdAt'
	| 'updatedAt'
	| 'currentWeight'
	| 'currentCapacity'
	| 'remainingWeight'
	| 'remainingCapacity'
	| 'isOverweight'
	| 'isOverCapacity'
	| 'isFull'
	| 'weightPercentage'
	| 'capacityPercentage'
	| 'itemCount'
	| 'status'
>;

/**
 * Optional configuration flags for Bag factories.
 */
type BagFactoryOptions = {
	/**
	 * When enabled, optional descriptive fields
	 * (color, material, features) will be populated
	 * with realistic fake data.
	 *
	 * Defaults to `false` to reflect real-world usage.
	 */
	withDetails?: boolean;
};

/**
 * Creates a valid **non-persisted** Bag entity.
 *
 * Use this factory when testing:
 * - bag creation / update DTOs
 * - request payloads
 * - frontend form state
 *
 * IMPORTANT:
 * - `userId` is required and must be provided explicitly
 * - Does NOT generate identity or timestamps
 * - Does NOT include computed fields or metrics
 */
export const bagFactory = (
	userId: string,
	overrides: BagFactoryOverrides = {},
	options: BagFactoryOptions = {}
): BagFactoryOmitFields => ({
	userId,

	name: overrides.name ?? faker.commerce.productName(),
	type: overrides.type ?? faker.helpers.arrayElement(Object.values(BagType)),
	size: overrides.size ?? faker.helpers.arrayElement(Object.values(Size)),

	maxCapacity:
		overrides.maxCapacity ??
		faker.number.float({ min: 20, max: 120, fractionDigits: 2 }),
	maxWeight:
		overrides.maxWeight ??
		faker.number.float({ min: 5, max: 40, fractionDigits: 2 }),
	bagWeight:
		overrides.bagWeight ??
		faker.number.float({ min: 1, max: 5, fractionDigits: 2 }),

	color:
		overrides.color ?? (options.withDetails ? faker.color.human() : null),

	material:
		overrides.material ??
		(options.withDetails
			? faker.helpers.arrayElement(Object.values(Material))
			: null),

	features:
		overrides.features ??
		(options.withDetails
			? faker.helpers.arrayElements(Object.values(BagFeature), {
					min: 0,
					max: 3,
				})
			: []),
});

/**
 * Creates a **persisted** Bag entity.
 *
 * Use this factory when testing:
 * - API responses
 * - database results
 * - ownership and authorization rules
 *
 * Represents a Bag that already exists in the system.
 */
export const buildBag = (
	userId: string,
	overrides: BagFactoryOverrides = {}
): Bag => {
	const createdAt = faker.date.past();
	const updatedAt = faker.date.between({ from: createdAt, to: new Date() });

	return {
		id: faker.string.uuid(),

		...bagFactory(userId, overrides),

		createdAt,
		updatedAt,
	};
};

/**
 * Creates a list of **persisted** Bag entities.
 *
 * Useful for:
 * - list and pagination tests
 * - ownership scenarios
 * - mocking database query results
 *
 * IMPORTANT:
 * - All bags belong to the provided user
 * - Bags are generated independently
 */
export const buildBags = (
	count: number,
	userId: string,
	overrides: BagFactoryOverrides = {}
): Bag[] => Array.from({ length: count }, () => buildBag(userId, overrides));
