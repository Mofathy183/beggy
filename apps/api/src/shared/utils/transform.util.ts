import { z } from 'zod';
import type {
	ItemsOrderByWithAggregationInput,
	SortOrder,
	SuitcasesOrderByWithAggregationInput,
} from '@prisma/generated/prisma/internal/prismaNamespace';
import type {
	ProfileFilterInput,
	ProfileOrderByInput,
	BagFilterInput,
	BagOrderByInput,
	ItemFilterInput,
	ItemOrderByInput,
	SuitcaseFilterInput,
	SuitcaseOrderByInput,
} from '@beggy/shared/types';
import type { ValidationFieldErrors, ZodErrorTree } from '@shared/types';
import {
	ProfileWhereInput,
	ProfileOrderByWithAggregationInput,
	BagsWhereInput,
	BagsOrderByWithAggregationInput,
	SuitcasesWhereInput,
	ItemsWhereInput,
} from '@prisma-generated/models';

/**
 * Recursively formats a single Zod error tree node into a ValidationFieldErrors structure.
 *
 * This function walks the output of `z.treeifyError()` and:
 * - Treats nodes with direct errors as leaf nodes
 * - Recursively processes nested object properties
 * - Recursively processes array item errors using index-based keys
 * - Omits empty branches to keep the output minimal and meaningful
 *
 * This function is internal and should not be used directly outside
 * of validation error formatting utilities.
 *
 * @param node - A single node from Zod's treeifyError error structure
 * @returns A ValidationFieldErrors subtree, or `undefined` if the node contains no errors
 */
const formatNode = (node: ZodErrorTree): ValidationFieldErrors | undefined => {
	// Leaf node:
	// If this node contains direct validation errors, return them immediately.
	// Zod guarantees these error messages are strings at runtime.
	if (node.errors.length > 0) {
		return node.errors.filter((e): e is string => typeof e === 'string');
	}

	// Container for nested validation errors
	const result: Record<string, ValidationFieldErrors> = {};
	let hasErrors = false;

	// Handle nested object properties (e.g. schema.shape fields)
	if (node.properties) {
		for (const key of Object.keys(node.properties)) {
			const propertyNode = node.properties[key];

			// Defensive check: ensure the property node exists
			if (propertyNode) {
				const formatted = formatNode(propertyNode);
				if (formatted !== undefined) {
					hasErrors = true;
					result[key] = formatted;
				}
			}
		}
	}

	// Handle array item errors (index-based validation)
	if (node.items) {
		const itemsResult: Record<string, ValidationFieldErrors> = {};

		node.items.forEach((item, index) => {
			const formatted = formatNode(item);
			if (formatted !== undefined) {
				hasErrors = true;
				itemsResult[index.toString()] = formatted;
			}
		});

		// Only include array errors if at least one item produced validation output
		if (Object.keys(itemsResult).length > 0) {
			result.items = itemsResult;
		}
	}

	// Return undefined when this branch has no validation errors
	return hasErrors ? result : undefined;
};

/**
 * Converts a Zod `treeifyError` result into a `ValidationFieldErrors` structure.
 *
 * This function serves as the public entry point for formatting Zod validation errors.
 * It encapsulates Zod-specific error structures and returns a stable,
 * API-friendly validation error tree.
 *
 * This function is typically used in:
 * - Global error-handling middleware
 * - Validation pipelines before controller execution
 *
 * @param tree - The output of `z.treeifyError(error)`
 * @returns A nested validation error structure, or `undefined` if no validation errors exist
 */
export const formatValidationError = (
	tree: ReturnType<typeof z.treeifyError>
): ValidationFieldErrors | undefined => {
	// Cast is safe: this utility operates on the known runtime structure
	// produced by `z.treeifyError()`
	return formatNode(tree as ZodErrorTree);
};

/**
 * Builds a Prisma-compatible numeric range filter.
 *
 * @remarks
 * - Safely ignores undefined or null bounds
 * - Produces `{ gte, lte }` only when values are provided
 * - Designed for reuse across entities (weight, capacity, volume, etc.)
 *
 * @param range - Optional numeric range with min/max bounds
 * @returns Prisma range filter or undefined
 */
export const buildNumberRange = (range?: {
	min?: number | null;
	max?: number | null;
}) => {
	if (!range) return undefined;

	return {
		...(range.min != null && { gte: range.min }),
		...(range.max != null && { lte: range.max }),
	};
};

/**
 * Builds a Prisma-compatible date range filter.
 *
 * @remarks
 * - Used for `createdAt`, `updatedAt`, or any temporal fields
 * - Keeps API filter semantics aligned with database querying
 *
 * @param range - Optional date range with from/to bounds
 * @returns Prisma date range filter or undefined
 */
export const buildDateRange = (range?: {
	from?: Date | null;
	to?: Date | null;
}) => {
	if (!range) return undefined;

	return {
		...(range.from != null && { gte: range.from }),
		...(range.to != null && { lte: range.to }),
	};
};

/**
 * Builds a Prisma `orderBy` object with a safe fallback.
 *
 * @remarks
 * - Defaults ordering to `createdAt` to ensure stable pagination
 * - Generic over allowed sortable fields to preserve type safety
 *
 * @param orderBy - Field name to sort by
 * @param direction - Sort direction (`asc` | `desc`)
 * @param fallback - Fallback field when orderBy is undefined
 * @returns Prisma orderBy object
 */
export const buildOrderBy = <T extends string>(
	orderBy?: T,
	direction: SortOrder = 'asc',
	fallback: T = 'createdAt' as T
) => ({
	[orderBy ?? fallback]: direction,
});

/**
 * Standardized return type for query builders.
 *
 * @remarks
 * - Keeps resolvers thin and consistent
 * - Allows swapping Prisma for another ORM with minimal refactor
 */
type BuildQuery<W, O> = {
	where: W;
	orderBy: O;
};

//*========================================================================
//*#################### Profile query builder #############################
//*========================================================================

/**
 * Applies basic profile filters that do not require ranges.
 *
 * @remarks
 * - Text search uses case-insensitive `contains`
 * - Mutates the `where` object intentionally to avoid allocations
 */
const applyProfileBasics = (
	where: ProfileWhereInput,
	filter: ProfileFilterInput
) => {
	if (filter.city)
		where.city = {
			contains: filter.city,
			mode: 'insensitive',
		};
	if (filter.country)
		where.country = {
			contains: filter.country,
			mode: 'insensitive',
		};
};

/**
 * Builds a complete Prisma query for profiles.
 *
 * @remarks
 * - Composes basics + date ranges + ordering
 * - Keeps resolver logic declarative and predictable
 */
export const buildProfileQuery = (
	filter: ProfileFilterInput,
	orderBy: ProfileOrderByInput
): BuildQuery<ProfileWhereInput, ProfileOrderByWithAggregationInput> => {
	const where: ProfileWhereInput = {};

	applyProfileBasics(where, filter);

	where.createdAt = buildDateRange({
		from: filter.createdAt?.from,
		to: filter.createdAt?.to,
	});

	return {
		where,
		orderBy: buildOrderBy<keyof ProfileOrderByWithAggregationInput>(
			orderBy.orderBy ?? 'createdAt',
			orderBy.direction as SortOrder
		),
	};
};

//*========================================================================
//*#################### Bag query builder #################################
//*========================================================================

/**
 * Applies non-range bag filters.
 *
 * @remarks
 * - Enums are matched exactly
 * - Color uses partial, case-insensitive search
 */
const applyBagBasics = (where: BagsWhereInput, filter: BagFilterInput) => {
	if (filter.type) where.type = filter.type;

	if (filter.size) where.size = filter.size;

	if (filter.material) where.material = filter.material;

	if (filter.color)
		where.color = {
			contains: filter.color,
			mode: 'insensitive',
		};
};

/**
 * Builds a Prisma query for bags.
 *
 * @remarks
 * - Capacity and weight are handled via shared numeric range builder
 * - Designed to mirror suitcase filtering for mental consistency
 */
export const buildBagQuery = (
	filter: BagFilterInput,
	orderBy: BagOrderByInput
): BuildQuery<BagsWhereInput, BagsOrderByWithAggregationInput> => {
	const where: BagsWhereInput = {};

	applyBagBasics(where, filter);

	where.maxCapacity = buildNumberRange(filter.maxCapacity);
	where.maxWeight = buildNumberRange(filter.maxWeight);
	where.createdAt = buildDateRange({
		from: filter.createdAt?.from,
		to: filter.createdAt?.to,
	});

	return {
		where,
		orderBy: buildOrderBy<keyof BagsOrderByWithAggregationInput>(
			orderBy.orderBy ?? 'createdAt',
			orderBy.direction as SortOrder
		),
	};
};

//*========================================================================
//*#################### Item query builder ################################
//*========================================================================

/**
 * Applies basic item filters.
 *
 * @remarks
 * - Boolean fields are checked explicitly to allow `false`
 * - Color search is case-insensitive and partial
 */
const applyItemBasics = (where: ItemsWhereInput, filter: ItemFilterInput) => {
	if (filter.category) where.category = filter.category;

	if (filter.color)
		where.color = {
			contains: filter.color,
			mode: 'insensitive',
		};

	if (filter.isFragile !== undefined) {
		where.isFragile = filter.isFragile;
	}
};

/**
 * Builds a Prisma query for items.
 *
 * @remarks
 * - Weight and volume are treated as independent numeric ranges
 * - Fragility is modeled as an explicit boolean filter
 */
export const buildItemQuery = (
	filter: ItemFilterInput,
	orderBy: ItemOrderByInput
): BuildQuery<ItemsWhereInput, ItemsOrderByWithAggregationInput> => {
	const where: ItemsWhereInput = {};

	applyItemBasics(where, filter);

	where.weight = buildNumberRange(filter.weight);
	where.volume = buildNumberRange(filter.volume);
	where.createdAt = buildDateRange({
		from: filter.createdAt?.from,
		to: filter.createdAt?.to,
	});

	return {
		where,
		orderBy: buildOrderBy<keyof ItemsOrderByWithAggregationInput>(
			orderBy.orderBy ?? 'createdAt',
			orderBy.direction as SortOrder
		),
	};
};

//*========================================================================
//*#################### Suitcase query builder ############################
//*========================================================================

/**
 * Applies suitcase-specific categorical filters.
 *
 * @remarks
 * - Mirrors bag filtering to reduce cognitive load
 * - Wheel type is treated as a discrete enum filter
 */
const applySuitcaseBasics = (
	where: SuitcasesWhereInput,
	filter: SuitcaseFilterInput
) => {
	if (filter.type) where.type = filter.type;

	if (filter.size) where.size = filter.size;

	if (filter.material) where.material = filter.material;

	if (filter.wheels) where.wheels = filter.wheels;

	if (filter.color)
		where.color = {
			contains: filter.color,
			mode: 'insensitive',
		};
};

/**
 * Builds a Prisma query for suitcases.
 *
 * @remarks
 * - Capacity and weight limits use shared numeric range logic
 * - Designed to stay symmetrical with bag queries
 */
export const buildSuitcaseQuery = (
	filter: SuitcaseFilterInput,
	orderBy: SuitcaseOrderByInput
): BuildQuery<SuitcasesWhereInput, SuitcasesOrderByWithAggregationInput> => {
	const where: SuitcasesWhereInput = {};

	applySuitcaseBasics(where, filter);

	where.maxCapacity = buildNumberRange(filter.maxCapacity);
	where.maxWeight = buildNumberRange(filter.maxWeight);
	where.createdAt = buildDateRange({
		from: filter.createdAt?.from,
		to: filter.createdAt?.to,
	});

	return {
		where,
		orderBy: buildOrderBy<keyof SuitcasesOrderByWithAggregationInput>(
			orderBy.orderBy ?? 'createdAt',
			orderBy.direction as SortOrder
		),
	};
};
