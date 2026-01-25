import { faker } from '@faker-js/faker';
import type { ContainerItem } from '../../src/types/constraints.types';
import { WeightUnit, VolumeUnit } from '../../src/constants/item.enums';

/**
 * Relaxed ContainerItem used ONLY for test factories.
 *
 * Allows building partial/invalid states for edge-case testing.
 */
export type FactoryContainerItem = Partial<
	Omit<ContainerItem, 'item'> & {
		item?: Partial<ContainerItem['item']>;
	}
>;

/**
 * Builds a fake ContainerItem for tests.
 *
 * @param overrides - Optional partial overrides for fine-grained control
 * @returns Fully valid ContainerItem
 *
 * @example
 * buildContainerItem();
 * buildContainerItem({ quantity: 3 });
 * buildContainerItem({ item: { weight: 2 } });
 */
export const buildContainerItem = (
	overrides: FactoryContainerItem = {}
): ContainerItem => {
	const { quantity, item } = overrides;
	return {
		quantity: quantity ?? faker.number.int({ min: 1, max: 10 }),

		item: {
			weight:
				item?.weight ??
				faker.number.float({
					min: 0.1,
					max: 10,
					fractionDigits: 2,
				}),

			weightUnit:
				item?.weightUnit ??
				faker.helpers.arrayElement(Object.values(WeightUnit)),

			volume:
				item?.volume ??
				faker.number.float({
					min: 0.1,
					max: 50,
					fractionDigits: 2,
				}),

			volumeUnit:
				item?.volumeUnit ??
				faker.helpers.arrayElement(Object.values(VolumeUnit)),
		},
	};
};
