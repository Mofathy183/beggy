import {
	BagType,
	ItemCategory,
	Size,
	SuitcaseType,
	WheelType,
	Material,
	OrderDirection,
	UserOrderByField,
	BagOrderByField,
	SuitcaseOrderByField,
	ItemOrderByField,
	NumericEntity,
	NumericMetric,
} from '@/types';
import { NUMBER_CONFIG, safeRound } from '@/utils';
import * as z from 'zod';
import { FieldsSchema } from '@/schemas';

/**
 * Factory for building "order by" query schemas.
 *
 * @remarks
 * - Generic over enum values to ensure only allowed fields are sortable
 * - Defaults ordering direction to ASC to simplify client usage
 * - Uses strict object to prevent unexpected query keys
 *
 * @param enumValues - Enum of allowed sortable fields
 */
export const buildOrderBySchema = <E extends Record<string, string>>(
	enumValues: E
) =>
	z.strictObject({
		/**
		 * Field to order by.
		 *
		 * @remarks
		 * - Must be one of the explicitly allowed enum values
		 * - Prevents ordering by sensitive or non-indexed columns
		 */
		field: FieldsSchema.enum(enumValues, false),

		/**
		 * Ordering direction.
		 *
		 * @remarks
		 * - Defaults to ASC for predictable behavior
		 * - DESC must be explicitly requested
		 */
		direction: FieldsSchema.enum(OrderDirection, false).default(
			OrderDirection.ASC
		),
	});

/**
 * Date range filter schema.
 *
 * @remarks
 * - Used for createdAt / updatedAt filtering
 * - Both boundaries are optional
 * - Enforces logical ordering (from <= to)
 */
export const dateRangeSchema = z
	.strictObject({
		/**
		 * Start date (inclusive).
		 */
		from: FieldsSchema.date(false),

		/**
		 * End date (inclusive).
		 */
		to: FieldsSchema.date(false),
	})
	/**
	 * Cross-field validation.
	 *
	 * @remarks
	 * - Ensures the range flows forward in time
	 * - Error is attached to `to` for better UX
	 */
	.superRefine(({ from, to }, ctx) => {
		if (from && to && from > to) {
			ctx.addIssue({
				code: 'custom',
				path: ['to'],
				message:
					'Looks like your return date comes before your departure — let’s swap those so your trip flows in the right direction.',
			});
		}
	});

/**
 * Numeric range filter factory.
 *
 * @remarks
 * - Backed by NUMBER_CONFIG (single source of truth)
 * - Supports optional min / max boundaries
 * - Applies rounding to configured precision
 * - Enforces domain-specific constraints
 *
 * @param type - Numeric entity (bag | suitcase | item)
 * @param metric - Metric within the entity (weight | capacity | volume | quantity)
 */
export const numberRangeSchema = <M extends NumericEntity>(
	type: M,
	metric: NumericMetric<M>
) => {
	const { gte, lte, decimals, messages } = NUMBER_CONFIG[type][metric];

	/**
	 * Base numeric schema.
	 *
	 * @remarks
	 * - No positivity enforced here (delegated to min/max)
	 * - Keeps error messaging domain-aware
	 */
	const baseSchema = z.number({ error: messages.number });

	return (
		z
			.strictObject({
				/**
				 * Minimum value (inclusive).
				 */
				min: baseSchema
					.gte(gte, { error: messages.gte })
					.optional()
					.transform((val) => safeRound(val, decimals)),

				/**
				 * Maximum value (inclusive).
				 */
				max: baseSchema
					.lte(lte, { error: messages.lte })
					.optional()
					.transform((val) => safeRound(val, decimals)),
			})
			/**
			 * Cross-field validation.
			 *
			 * @remarks
			 * - At least one boundary must be provided
			 * - Ensures min <= max when both are present
			 */
			.superRefine(({ min, max }, ctx) => {
				if (min == null && max == null) {
					ctx.addIssue({
						code: 'custom',
						message:
							'Let’s add at least a minimum or maximum — having both blank leaves the range a bit too open-ended.',
					});
				}

				if (min != null && max != null && min > max) {
					ctx.addIssue({
						code: 'custom',
						path: ['max'],
						message:
							'Your minimum is higher than your maximum — let’s flip those around so the range makes sense.',
					});
				}
			})
	);
};

/**
 * Query filter schemas.
 *
 * @remarks
 * - Used for validating request query parameters
 * - Each schema is entity-specific
 * - Strict objects prevent unexpected or unsafe filters
 */
export const QuerySchema = {
	/**
	 * User filter schema.
	 *
	 * @remarks
	 * - Supports location-based filtering
	 * - Allows date range filtering on creation date
	 */
	userFilter: z.strictObject({
		city: FieldsSchema.name('City Name', 'place', false),
		country: FieldsSchema.name('Country Name', 'place', false),
		createdAt: dateRangeSchema.optional(),
	}),

	/**
	 * Item filter schema.
	 *
	 * @remarks
	 * - Supports categorical and numeric filtering
	 * - Weight and volume use domain-aware range validation
	 */
	itemFilter: z.strictObject({
		category: FieldsSchema.enum(ItemCategory, false),
		color: z.string().optional(),
		isFragile: z.boolean().optional(),
		weight: numberRangeSchema('item', 'weight'),
		volume: numberRangeSchema('item', 'volume'),
		createdAt: dateRangeSchema.optional(),
	}),

	/**
	 * Bag filter schema.
	 *
	 * @remarks
	 * - Designed around physical constraints (capacity / weight)
	 * - Prevents invalid ranges and values early
	 */
	bagFilter: z.strictObject({
		type: FieldsSchema.enum(BagType, false),
		size: FieldsSchema.enum(Size, false),
		material: FieldsSchema.enum(Material, false),
		color: z.string().optional(),
		maxCapacity: numberRangeSchema('bag', 'capacity'),
		maxWeight: numberRangeSchema('bag', 'weight'),
		createdAt: dateRangeSchema.optional(),
	}),

	/**
	 * Suitcase filter schema.
	 *
	 * @remarks
	 * - Mirrors bag filtering with suitcase-specific fields
	 * - Wheel type included as a discrete filter
	 */
	suitcaseFilter: z.strictObject({
		type: FieldsSchema.enum(SuitcaseType, false),
		size: FieldsSchema.enum(Size, false),
		material: FieldsSchema.enum(Material, false),
		wheels: FieldsSchema.enum(WheelType, false),
		color: z.string().optional(),
		maxCapacity: numberRangeSchema('suitcase', 'capacity'),
		maxWeight: numberRangeSchema('suitcase', 'weight'),
		createdAt: dateRangeSchema.optional(),
	}),
};

/**
 * Order-by Query schemas.
 *
 * @remarks
 * - Centralized ordering rules per entity
 * - Prevents ordering by unauthorized fields
 */
export const OrderByQuerySchemas = {
	userOrderBy: buildOrderBySchema(UserOrderByField),
	itemOrderBy: buildOrderBySchema(ItemOrderByField),
	bagOrderBy: buildOrderBySchema(BagOrderByField),
	suitcaseOrderBy: buildOrderBySchema(SuitcaseOrderByField),
};

/**
 * Route parameter schemas.
 *
 * @remarks
 * - Used for validating path parameters (e.g. :id)
 * - Keeps controllers and services free from malformed identifiers
 */
export const ParamsSchema = {
	/**
	 * UUID v4 parameter.
	 *
	 * @remarks
	 * - Validates UUID format only (existence is checked later)
	 * - Prevents invalid DB lookups and noisy errors
	 */
	uuid: z.uuidv4({
		error: 'That ID doesn’t look quite right — it should be a proper unique identifier, like a travel tag that helps us find the right record.',
	}),
};
