import { faker } from '@faker-js/faker';
import { type Suitcase } from '../../src/types/suitcase.types';
import {
	SuitcaseFeature,
	SuitcaseType,
	WheelType,
} from '../../src/constants/suitcase.enums';
import { Material, Size } from '../../src/constants/bag.enums';
import { type ItemFactoryOverrides, buildItem } from './item.factory';
import { type SuitcaseItems } from '../../src/types';

type SuitcaseFactoryOverrides = Partial<
	Pick<
		Suitcase,
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
	Suitcase,
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
 * Options required to build a SuitcaseItems join entity.
 */
type SuitcaseItemsOptions = {
	/**
	 * Identifier of the owning user.
	 */
	userId: string;

	/**
	 * Optional existing suitcase identifier.
	 */
	suitcaseId?: string;

	/**
	 * Optional existing item identifier.
	 */
	itemId?: string;
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
): Suitcase => {
	const createdAt = faker.date.past();
	const updatedAt = faker.date.between({ from: createdAt, to: new Date() });

	return {
		id: faker.string.uuid(),

		...suitcaseFactory(userId, overrides),

		createdAt,
		updatedAt,
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
): Suitcase[] =>
	Array.from({ length: count }, () => buildSuitcase(userId, overrides));

/**
 * Creates a **persisted** SuitcaseItems join entity.
 *
 * Use for:
 * - airline weight checks
 * - suitcase capacity validation
 * - packing rule enforcement tests
 */
export const buildSuitcaseItem = (
	options: SuitcaseItemsOptions,
	suitcaseOverrides: SuitcaseFactoryOverrides = {},
	itemOverrides: ItemFactoryOverrides = {}
): SuitcaseItems => {
	const createdAt = faker.date.past();
	const updatedAt = faker.date.between({ from: createdAt, to: new Date() });

	const suitcase = buildSuitcase(options.userId, suitcaseOverrides);
	const item = buildItem(options.userId, itemOverrides);

	return {
		suitcaseId: options.suitcaseId ?? suitcase.id,
		itemId: options.itemId ?? item.id,

		suitcase,
		item,

		createdAt,
		updatedAt,
	};
};

/**
 * Creates multiple **persisted** SuitcaseItems join entities.
 */
export const buildSuitcaseItems = (
	count: number,
	options: SuitcaseItemsOptions,
	suitcaseOverrides: SuitcaseFactoryOverrides = {},
	itemOverrides: ItemFactoryOverrides = {}
): SuitcaseItems[] =>
	Array.from({ length: count }, () =>
		buildSuitcaseItem(options, suitcaseOverrides, itemOverrides)
	);
