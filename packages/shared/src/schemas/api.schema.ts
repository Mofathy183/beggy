/**
 * NOTE:
 * Filters currently use implicit AND logic.
 * TODO:* Future versions may support nested AND / OR / NOT groups.
 */
import {
	BagType,
	Size,
	Material,
	BagOrderByField,
} from '../constants/bag.enums.js';
import { ItemOrderByField, ItemCategory } from '../constants/item.enums.js';
import {
	SuitcaseType,
	WheelType,
	SuitcaseOrderByField,
} from '../constants/suitcase.enums.js';
import { OrderDirection } from '../constants/api.enums.js';
import { ProfileOrderByField } from '../constants/profile.enums.js';
import type { NumericEntity, NumericMetric } from '../types/schema.types.js';
import { normalizeRound } from '../utils/schema.util.js';
import { NUMBER_CONFIG } from '../constants/constraints.js';
import { FieldsSchema } from '../schemas/fields.schema.js';
import * as z from 'zod';
import { Role } from '../constants/auth.enums.js';
import { UserOrderByField } from '../constants/user.enums.js';

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
		orderBy: FieldsSchema.enum(enumValues, false),

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
					.transform((val) => normalizeRound(val, decimals)),

				/**
				 * Maximum value (inclusive).
				 */
				max: baseSchema
					.lte(lte, { error: messages.lte })
					.optional()
					.transform((val) => normalizeRound(val, decimals)),
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
	 * User filtering schema.
	 *
	 * @remarks
	 * - Intended for administrative or privileged list queries
	 * - All fields are optional to allow flexible combinations
	 * - Mapped directly to Prisma `where` conditions downstream
	 */
	userFilter: z.strictObject({
		/**
		 * User email address.
		 *
		 * @remarks
		 * - Optional exact-match filter
		 * - Useful for locating a specific account
		 * - Case-sensitivity should be handled at the DB layer if needed
		 */
		email: FieldsSchema.email(false),

		/**
		 * User role filter.
		 *
		 * @remarks
		 * - Restricts results to a specific system role
		 * - Enum-based validation prevents privilege escalation attempts
		 */
		role: FieldsSchema.enum<typeof Role>(Role, false),

		/**
		 * Account active status.
		 *
		 * @remarks
		 * - Used for moderation and lifecycle management
		 * - Commonly paired with pagination and ordering
		 */
		isActive: z.boolean().optional(),

		/**
		 * Email verification status.
		 *
		 * @remarks
		 * - Helps identify unverified or manually verified accounts
		 * - Useful for compliance or onboarding audits
		 */
		isEmailVerified: z.boolean().optional(),

		/**
		 * User creation date range.
		 *
		 * @remarks
		 * - Supports filtering users created within a specific period
		 * - Typically translated into `gte` / `lte` Prisma filters
		 */
		createdAt: dateRangeSchema.optional(),
	}),

	/**
	 * Profile filter schema.
	 *
	 * @remarks
	 * - Supports location-based filtering
	 * - Allows date range filtering on creation date
	 */
	profileFilter: z.strictObject({
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
		weight: numberRangeSchema('item', 'weight').optional(),
		volume: numberRangeSchema('item', 'volume').optional(),
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
		maxCapacity: numberRangeSchema('bag', 'capacity').optional(),
		maxWeight: numberRangeSchema('bag', 'weight').optional(),
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
		maxCapacity: numberRangeSchema('suitcase', 'capacity').optional(),
		maxWeight: numberRangeSchema('suitcase', 'weight').optional(),
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
	userOrderBy: buildOrderBySchema<typeof UserOrderByField>(UserOrderByField),
	profileOrderBy:
		buildOrderBySchema<typeof ProfileOrderByField>(ProfileOrderByField),
	itemOrderBy: buildOrderBySchema<typeof ItemOrderByField>(ItemOrderByField),
	bagOrderBy: buildOrderBySchema<typeof BagOrderByField>(BagOrderByField),
	suitcaseOrderBy:
		buildOrderBySchema<typeof SuitcaseOrderByField>(SuitcaseOrderByField),
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
	uuid: z.strictObject({
		id: z.uuidv4({
			error: 'That ID doesn’t look quite right — it should be a proper unique identifier, like a travel tag that helps us find the right record.',
		}),
	}),
};

/**
 * Pagination query schema.
 *
 * @remarks
 * - Used to validate pagination parameters in list endpoints
 * - Enforces safe boundaries to protect the database
 * - Defaults are applied at schema level to simplify controller logic
 *
 * @example
 * ```ts
 * const pagination = PaginationSchema.pagination.parse(req.query);
 * // → { page: 1, limit: 10 }
 * ```
 */
export const PaginationSchema = {
	/**
	 * Pagination parameters object.
	 *
	 * @remarks
	 * - Strict object prevents unexpected query keys
	 * - Intended for offset-based pagination (page + limit)
	 */
	pagination: z.strictObject({
		/**
		 * Page number (1-based).
		 *
		 * @remarks
		 * - Must be a positive integer
		 * - Defaults to `1` when omitted
		 * - Upper bound limits excessive page jumps
		 */
		page: z
			.number({
				error: 'That page number doesn’t look quite right — let’s make sure it’s a real number before setting off.',
			})
			.int()
			.gte(1, {
				error: 'Pages start at 1, traveler — think of it as boarding from the first gate, not the tarmac.',
			})
			.lte(100, {
				error: 'That’s quite a leap! Let’s keep it under page 100 to stay on track.',
			})
			.default(1),

		/**
		 * Maximum number of items per page.
		 *
		 * @remarks
		 * - Must be a positive integer
		 * - Defaults to `10` for predictable API behavior
		 * - Hard cap prevents abuse and heavy queries
		 */
		limit: z
			.number({
				error: 'That limit needs to be a number — like knowing how many bags you’re allowed to check in.',
			})
			.int()
			.gte(1, {
				error: 'You’ll want at least one item per page — no point opening an empty suitcase.',
			})
			.lte(100, {
				error: 'That’s a heavy load! Let’s keep it under 100 per page so things run smoothly.',
			})
			.default(10),
	}),
};
