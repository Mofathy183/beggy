import { faker } from '@faker-js/faker';
import type { SuitcaseDTO } from '../../src/types/suitcase.types.js';
import {
	SuitcaseFeature,
	SuitcaseType,
	WheelType,
} from '../../src/constants/suitcase.enums.js';
import { Material, Size } from '../../src/constants/bag.enums.js';

type SuitcaseFactoryOverrides = Partial<
	Pick<
		SuitcaseDTO,
		| 'name'
		| 'brand'
		| 'type'
		| 'color'
		| 'size'
		| 'maxCapacity'
		| 'maxWeight'
		| 'suitcaseWeight'
		| 'material'
		| 'features'
		| 'wheels'
	>
>;

type SuitcaseFactoryOmitFields = Omit<
	SuitcaseDTO,
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

type SuitcaseFactoryOptions = {
	/**
	 * When enabled, optional descriptive fields
	 * (brand, color, material, wheels, features)
	 * will be populated with realistic fake data.
	 */
	withDetails?: boolean;
};

/**
 * Creates a valid **non-persisted** Suitcase entity.
 *
 * Use for:
 * - request payloads
 * - form state
 * - validation and business-rule tests
 *
 * IMPORTANT:
 * - `userId` is required
 * - No identity or timestamps
 * - No computed or derived fields
 */
export const suitcaseFactory = (
	userId: string,
	overrides: SuitcaseFactoryOverrides = {},
	options: SuitcaseFactoryOptions = {}
): SuitcaseFactoryOmitFields => ({
	userId,

	name: overrides.name ?? faker.commerce.productName(),

	brand:
		overrides.brand ?? (options.withDetails ? faker.company.name() : null),

	type:
		overrides.type ??
		faker.helpers.arrayElement(Object.values(SuitcaseType)),

	size: overrides.size ?? faker.helpers.arrayElement(Object.values(Size)),

	maxCapacity:
		overrides.maxCapacity ?? faker.number.int({ min: 20, max: 120 }),

	maxWeight:
		overrides.maxWeight ??
		faker.number.float({ min: 7, max: 32, fractionDigits: 2 }),

	suitcaseWeight:
		overrides.suitcaseWeight ??
		faker.number.float({ min: 3, max: 7, fractionDigits: 2 }),

	color:
		overrides.color ??
		(options.withDetails ? faker.color.human() : 'black'),

	material:
		overrides.material ??
		(options.withDetails
			? faker.helpers.arrayElement(Object.values(Material))
			: null),

	wheels:
		overrides.wheels ??
		(options.withDetails
			? faker.helpers.arrayElement(Object.values(WheelType))
			: null),

	features:
		overrides.features ??
		(options.withDetails
			? faker.helpers.arrayElements(Object.values(SuitcaseFeature), {
					min: 0,
					max: 4,
				})
			: []),
});

/**
 * Creates a **persisted** Suitcase entity.
 *
 * Use for:
 * - API responses
 * - database query mocks
 * - authorization and ownership tests
 */
export const buildSuitcase = (
	userId: string,
	overrides: SuitcaseFactoryOverrides = {}
): Omit<SuitcaseDTO, 'createdAt' | 'updatedAt'> => {
	// const createdAt = faker.date.past().toISOString();
	// const updatedAt = faker.date.between({ from: createdAt, to: new Date() }).toISOString();

	return {
		id: faker.string.uuid(),

		...suitcaseFactory(userId, overrides),
	};
};

/**
 * Creates multiple **persisted** Suitcase entities.
 *
 * Useful for:
 * - list endpoints
 * - pagination tests
 * - multi-suitcase ownership scenarios
 */
export const buildSuitcases = (
	count: number,
	userId: string,
	overrides: SuitcaseFactoryOverrides = {}
): Omit<SuitcaseDTO, 'createdAt' | 'updatedAt'>[] =>
	Array.from({ length: count }, () => buildSuitcase(userId, overrides));

