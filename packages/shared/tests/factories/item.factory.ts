import { faker } from '@faker-js/faker';
import type { ItemDTO } from '../../src/types/item.types';
import {
	ItemCategory,
	WeightUnit,
	VolumeUnit,
} from '../../src/constants/item.enums';

export type ItemFactoryOverrides = Partial<
	Pick<
		ItemDTO,
		| 'name'
		| 'category'
		| 'quantity'
		| 'weight'
		| 'weightUnit'
		| 'volume'
		| 'volumeUnit'
		| 'color'
		| 'isFragile'
	>
>;

type ItemFactoryOmitFields = Omit<ItemDTO, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Optional configuration flags for Item factories.
 */
type ItemFactoryOptions = {
	/**
	 * When enabled, optional descriptive fields
	 * such as color will be populated.
	 */
	withDetails?: boolean;
};

/**
 * Creates a valid **non-persisted** Item entity.
 *
 * Use for:
 * - request payloads
 * - form state
 * - validation and business-rule tests
 *
 * IMPORTANT:
 * - `userId` is required
 * - Does NOT generate identity or timestamps
 * - Units and measurements are always consistent
 */
export const itemFactory = (
	userId: string,
	overrides: ItemFactoryOverrides = {},
	options: ItemFactoryOptions = {}
): ItemFactoryOmitFields => ({
	userId,

	name: overrides.name ?? faker.commerce.productName(),

	category:
		overrides.category ??
		faker.helpers.arrayElement(Object.values(ItemCategory)),

	quantity: overrides.quantity ?? faker.number.int({ min: 1, max: 10 }),

	weight:
		overrides.weight ??
		faker.number.float({
			min: 0.1,
			max: 10,
			fractionDigits: 2,
		}),

	weightUnit:
		overrides.weightUnit ??
		faker.helpers.arrayElement(Object.values(WeightUnit)),

	volume:
		overrides.volume ??
		faker.number.float({
			min: 0.1,
			max: 50,
			fractionDigits: 2,
		}),

	volumeUnit:
		overrides.volumeUnit ??
		faker.helpers.arrayElement(Object.values(VolumeUnit)),

	isFragile: overrides.isFragile ?? false,

	color:
		overrides.color ??
		(options.withDetails ? faker.color.human() : 'black'),
});

/**
 * Creates a **persisted** Item entity.
 *
 * Use for:
 * - API responses
 * - database mocks
 * - ownership and authorization tests
 */
export const buildItem = (
	userId: string,
	overrides: ItemFactoryOverrides = {}
): Omit<ItemDTO, 'createdAt' | 'updatedAt'> => {
	// const createdAt = faker.date.past().toISOString();
	// const updatedAt = faker.date.between({ from: createdAt, to: new Date() }).toISOString();

	return {
		id: faker.string.uuid(),

		...itemFactory(userId, overrides),
	};
};

/**
 * Creates multiple **persisted** Item entities.
 *
 * Useful for:
 * - list endpoints
 * - container population tests
 * - capacity and weight calculations
 */
export const buildItems = (
	count: number,
	userId: string,
	overrides: ItemFactoryOverrides = {}
): Omit<ItemDTO, 'createdAt' | 'updatedAt'>[] =>
	Array.from({ length: count }, () => buildItem(userId, overrides));
