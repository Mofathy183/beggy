import { Prisma } from '@prisma-generated/client';
import { PrismaBagModel, PrismaSuitcaseModel } from '@prisma';
import {
	//*======={Suitcase and Bags}========
	calculateCurrentCapacity,
	calculateCurrentWeight,
	calculateRemainingCapacity,
	calculateRemainingWeight,
	calculateCapacityPercentage,
	calculateWeightPercentage,
	checkIsFull,
	checkIsOverCapacity,
	checkIsOverweight,
	getContainerStatus,
	calculateItemCount,
	//*======={Suitcase and Bags}========
} from '@beggy/shared/containers';

// ============================================================================
// USER STATUS & DISPLAY HELPERS
// ============================================================================

/**
 * Returns a formatted display name (capitalized first + last name)
 */
export function getDisplayName(firstName: string, lastName: string): string {
	if (!firstName?.trim() || !lastName?.trim()) return '';

	const capitalize = (value: string) =>
		value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

	return `${capitalize(firstName.trim())} ${capitalize(lastName.trim())}`;
}

/**
 * Calculates age from a birth date
 */
export function getAge(
	birthDate: string | Date | null | undefined
): number | null {
	if (!birthDate) return null;

	const date = new Date(birthDate);
	if (isNaN(date.getTime())) return null;

	const today = new Date();
	let age = today.getFullYear() - date.getFullYear();
	const monthDiff = today.getMonth() - date.getMonth();
	const dayDiff = today.getDate() - date.getDate();

	if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
		age--;
	}

	return age;
}

export const profileExtensions = Prisma.defineExtension({
	name: 'ProfileComputedFields',
	result: {
		profile: {
			displayName: {
				needs: { firstName: true, lastName: true },
				compute(user) {
					const { firstName, lastName } = user;
					return getDisplayName(firstName, lastName);
				},
			},
			age: {
				needs: { birthDate: true },
				compute(user) {
					const { birthDate } = user;
					return getAge(birthDate);
				},
			},
		},
	},
});

export const bagExtensions = Prisma.defineExtension({
	name: 'BagComputedFields',
	result: {
		bags: {
			currentWeight: {
				needs: {},
				compute(bag: PrismaBagModel): number | null {
					if ('bagItems' in bag && !Array.isArray(bag.bagItems))
						return null;
					// If bagItems is undefined or not an array, treat as empty array
					const items = Array.isArray(bag.bagItems)
						? bag.bagItems
						: [];
					return calculateCurrentWeight(items);
				},
			},
			currentCapacity: {
				needs: {},
				compute(bag: PrismaBagModel) {
					if ('bagItems' in bag && !bag?.bagItems) return null;
					const items = Array.isArray(bag.bagItems)
						? bag.bagItems
						: [];
					return calculateCurrentCapacity(items);
				},
			},
			remainingWeight: {
				needs: { maxWeight: true },
				compute(bag: PrismaBagModel) {
					if ('bagItems' in bag && !bag?.bagItems) return null;
					const items = Array.isArray(bag.bagItems)
						? bag.bagItems
						: [];

					const currentWeight = calculateCurrentWeight(items);

					return calculateRemainingWeight(
						currentWeight,
						bag.maxWeight
					);
				},
			},
			remainingCapacity: {
				needs: { maxCapacity: true },
				compute(bag: PrismaBagModel) {
					if ('bagItems' in bag && !bag?.bagItems) return null;
					const items = Array.isArray(bag.bagItems)
						? bag.bagItems
						: [];

					const currentCapacity = calculateCurrentCapacity(items);

					return calculateRemainingCapacity(
						currentCapacity,
						bag.maxCapacity
					);
				},
			},
			isOverweight: {
				needs: { maxCapacity: true },
				compute(bag: PrismaBagModel) {
					if ('bagItems' in bag && !bag?.bagItems) return null;
					const items = Array.isArray(bag.bagItems)
						? bag.bagItems
						: [];

					const currentWeight = calculateCurrentWeight(items);
					return checkIsOverweight(currentWeight, bag.maxWeight);
				},
			},
			isOverCapacity: {
				needs: { maxCapacity: true },
				compute(bag: PrismaBagModel) {
					if ('bagItems' in bag && !bag?.bagItems) return null;
					const items = Array.isArray(bag.bagItems)
						? bag.bagItems
						: [];

					const currentCapacity = calculateCurrentCapacity(items);

					return checkIsOverCapacity(
						currentCapacity,
						bag.maxCapacity
					);
				},
			},
			isFull: {
				needs: { maxCapacity: true, maxWeight: true },
				compute(bag: PrismaBagModel) {
					if ('bagItems' in bag && !bag?.bagItems) return null;
					const items = Array.isArray(bag.bagItems)
						? bag.bagItems
						: [];

					const { maxWeight, maxCapacity } = bag;
					const currentCapacity = calculateCurrentCapacity(items);
					const currentWeight = calculateCurrentWeight(items);

					return checkIsFull(
						currentWeight,
						maxWeight,
						currentCapacity,
						maxCapacity
					);
				},
			},
			weightPercentage: {
				needs: { maxWeight: true },
				compute(bag: PrismaBagModel) {
					if ('bagItems' in bag && !bag?.bagItems) return null;
					const items = Array.isArray(bag.bagItems)
						? bag.bagItems
						: [];
					const currentWeight = calculateCurrentWeight(items);
					return calculateWeightPercentage(
						currentWeight,
						bag.maxWeight
					);
				},
			},
			capacityPercentage: {
				needs: { maxCapacity: true },
				compute(bag: PrismaBagModel) {
					if ('bagItems' in bag && !bag?.bagItems) return null;
					const items = Array.isArray(bag.bagItems)
						? bag.bagItems
						: [];

					const currentCapacity = calculateCurrentCapacity(items);

					return calculateCapacityPercentage(
						currentCapacity,
						bag.maxCapacity
					);
				},
			},
			itemCount: {
				needs: {},
				compute(bag: PrismaBagModel) {
					if ('bagItems' in bag && !bag?.bagItems) return null;
					const items = Array.isArray(bag.bagItems)
						? bag.bagItems
						: [];

					return calculateItemCount(items);
				},
			},
			status: {
				needs: { maxCapacity: true, maxWeight: true },
				compute(bag: PrismaBagModel) {
					if ('bagItems' in bag && !bag?.bagItems) return null;
					const items = Array.isArray(bag.bagItems)
						? bag.bagItems
						: [];

					const { maxWeight, maxCapacity } = bag;
					const currentCapacity = calculateCurrentCapacity(items);
					const currentWeight = calculateCurrentWeight(items);

					const itemCount = calculateItemCount(items);
					const isFull = checkIsFull(
						currentWeight,
						maxWeight,
						currentCapacity,
						maxCapacity
					);
					const isOverWeight = checkIsOverweight(
						currentWeight,
						bag.maxWeight
					);
					const isOverCapacity = checkIsOverCapacity(
						currentCapacity,
						bag.maxCapacity
					);

					return getContainerStatus(
						isOverWeight,
						isOverCapacity,
						isFull,
						itemCount
					);
				},
			},
		},
	},
});

export const suitcaseExtensions = Prisma.defineExtension({
	name: 'SuitcaseComputedFields',
	result: {
		suitcases: {
			currentWeight: {
				needs: {},
				compute(suitcase: PrismaSuitcaseModel) {
					if ('suitcaseItems' in suitcase && !suitcase?.suitcaseItems)
						return null;
					const items = Array.isArray(suitcase.suitcaseItems)
						? suitcase.suitcaseItems
						: [];
					return calculateCurrentWeight(items);
				},
			},
			currentCapacity: {
				needs: {},
				compute(suitcase: PrismaSuitcaseModel) {
					if ('suitcaseItems' in suitcase && !suitcase?.suitcaseItems)
						return null;
					const items = Array.isArray(suitcase.suitcaseItems)
						? suitcase.suitcaseItems
						: [];
					return calculateCurrentCapacity(items);
				},
			},
			remainingWeight: {
				needs: { maxWeight: true },
				compute(suitcase: PrismaSuitcaseModel) {
					if ('suitcaseItems' in suitcase && !suitcase?.suitcaseItems)
						return null;
					const items = Array.isArray(suitcase.suitcaseItems)
						? suitcase.suitcaseItems
						: [];

					const currentWeight = calculateCurrentWeight(items);

					return calculateRemainingWeight(
						currentWeight,
						suitcase.maxWeight
					);
				},
			},
			remainingCapacity: {
				needs: { maxCapacity: true },
				compute(suitcase: PrismaSuitcaseModel) {
					if ('suitcaseItems' in suitcase && !suitcase?.suitcaseItems)
						return null;
					const items = Array.isArray(suitcase.suitcaseItems)
						? suitcase.suitcaseItems
						: [];

					const currentCapacity = calculateCurrentCapacity(items);

					return calculateRemainingCapacity(
						currentCapacity,
						suitcase.maxCapacity
					);
				},
			},
			isOverweight: {
				needs: { maxCapacity: true },
				compute(suitcase: PrismaSuitcaseModel) {
					if ('suitcaseItems' in suitcase && !suitcase?.suitcaseItems)
						return null;
					const items = Array.isArray(suitcase.suitcaseItems)
						? suitcase.suitcaseItems
						: [];

					const currentWeight = calculateCurrentWeight(items);
					return checkIsOverweight(currentWeight, suitcase.maxWeight);
				},
			},
			isOverCapacity: {
				needs: { maxCapacity: true },
				compute(suitcase: PrismaSuitcaseModel) {
					if ('suitcaseItems' in suitcase && !suitcase?.suitcaseItems)
						return null;
					const items = Array.isArray(suitcase.suitcaseItems)
						? suitcase.suitcaseItems
						: [];

					const currentCapacity = calculateCurrentCapacity(items);

					return checkIsOverCapacity(
						currentCapacity,
						suitcase.maxCapacity
					);
				},
			},
			isFull: {
				needs: { maxCapacity: true, maxWeight: true },
				compute(suitcase: PrismaSuitcaseModel) {
					if ('suitcaseItems' in suitcase && !suitcase?.suitcaseItems)
						return null;
					const items = Array.isArray(suitcase.suitcaseItems)
						? suitcase.suitcaseItems
						: [];

					const { maxWeight, maxCapacity } = suitcase;
					const currentCapacity = calculateCurrentCapacity(items);
					const currentWeight = calculateCurrentWeight(items);

					return checkIsFull(
						currentWeight,
						maxWeight,
						currentCapacity,
						maxCapacity
					);
				},
			},
			weightPercentage: {
				needs: { maxWeight: true },
				compute(suitcase: PrismaSuitcaseModel) {
					if ('suitcaseItems' in suitcase && !suitcase?.suitcaseItems)
						return null;
					const items = Array.isArray(suitcase.suitcaseItems)
						? suitcase.suitcaseItems
						: [];

					const currentWeight = calculateCurrentWeight(items);

					return calculateWeightPercentage(
						currentWeight,
						suitcase.maxWeight
					);
				},
			},
			capacityPercentage: {
				needs: { maxCapacity: true },
				compute(suitcase: PrismaSuitcaseModel) {
					if ('suitcaseItems' in suitcase && !suitcase?.suitcaseItems)
						return null;
					const items = Array.isArray(suitcase.suitcaseItems)
						? suitcase.suitcaseItems
						: [];

					const currentCapacity = calculateCurrentCapacity(items);

					return calculateCapacityPercentage(
						currentCapacity,
						suitcase.maxCapacity
					);
				},
			},
			itemCount: {
				needs: {},
				compute(suitcase: PrismaSuitcaseModel) {
					if ('suitcaseItems' in suitcase && !suitcase?.suitcaseItems)
						return null;
					const items = Array.isArray(suitcase.suitcaseItems)
						? suitcase.suitcaseItems
						: [];

					return calculateItemCount(items);
				},
			},
			status: {
				needs: { maxCapacity: true, maxWeight: true },
				compute(suitcase: PrismaSuitcaseModel) {
					if ('suitcaseItems' in suitcase && !suitcase?.suitcaseItems)
						return null;
					const items = Array.isArray(suitcase.suitcaseItems)
						? suitcase.suitcaseItems
						: [];

					const { maxWeight, maxCapacity } = suitcase;
					const currentCapacity = calculateCurrentCapacity(items);
					const currentWeight = calculateCurrentWeight(items);

					const itemCount = calculateItemCount(items);
					const isFull = checkIsFull(
						currentWeight,
						maxWeight,
						currentCapacity,
						maxCapacity
					);
					const isOverWeight = checkIsOverweight(
						currentWeight,
						suitcase.maxWeight
					);
					const isOverCapacity = checkIsOverCapacity(
						currentCapacity,
						suitcase.maxCapacity
					);

					return getContainerStatus(
						isOverWeight,
						isOverCapacity,
						isFull,
						itemCount
					);
				},
			},
		},
	},
});
