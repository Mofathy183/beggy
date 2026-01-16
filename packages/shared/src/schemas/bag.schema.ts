import * as z from 'zod';
import { FieldsSchema } from '../schemas/fields.schema.js';
import { BagType, BagFeature, Size, Material } from '../types/bag.types.js';

/**
 * Bag-related validation schemas.
 *
 * @remarks
 * - Uses Zod strict objects to prevent unknown keys
 * - Designed for self-service user actions (create / update)
 * - Defaults are applied only during creation
 * - Update schemas follow PATCH semantics (no forced overwrites)
 */
export const BagSchema = {
	/**
	 * Create-bag schema.
	 *
	 * @remarks
	 * - Used when a user creates a new bag
	 * - Required fields define the bag’s physical constraints
	 * - Optional fields receive safe defaults where applicable
	 */
	create: z.strictObject({
		/** User-defined bag name */
		name: FieldsSchema.name('Bag Name', 'product'),

		/** Bag type classification (e.g. backpack, duffel) */
		type: FieldsSchema.enum<typeof BagType>(BagType),

		/**
		 * Optional color descriptor.
		 *
		 * @remarks
		 * - Defaults to "black" if not provided
		 * - Normalized at schema level to simplify service logic
		 */
		color: z.string().optional().default('black'),

		/** Bag size classification */
		size: FieldsSchema.enum<typeof Size>(Size),

		/** Maximum volume capacity the bag can hold */
		maxCapacity: FieldsSchema.number('bag', 'capacity'),

		/** Maximum safe weight the bag can carry */
		maxWeight: FieldsSchema.number('bag', 'weight'),

		/** Optional bag material */
		material: FieldsSchema.enum<typeof Material>(Material, false),

		/**
		 * Optional list of bag features.
		 *
		 * @remarks
		 * - Empty or missing list means no special features
		 * - Enum values are validated individually
		 */
		features: FieldsSchema.array(
			FieldsSchema.enum<typeof BagFeature>(BagFeature, false),
			false
		),
	}),

	/**
	 * Update-bag schema.
	 *
	 * @remarks
	 * - Used for partial updates only
	 * - Fields are optional to avoid accidental overwrites
	 * - No defaults are applied during updates
	 */
	update: z.strictObject({
		/** Updated bag name */
		name: FieldsSchema.name('Bag Name', 'product', false),

		/** Updated bag type */
		type: FieldsSchema.enum<typeof BagType>(BagType, false),

		/** Updated color value */
		color: z.string().optional(),

		/** Updated size classification */
		size: FieldsSchema.enum<typeof Size>(Size, false),

		/** Updated maximum capacity */
		maxCapacity: FieldsSchema.number('bag', 'capacity', false),

		/** Updated maximum weight limit */
		maxWeight: FieldsSchema.number('bag', 'weight', false),

		/** Updated bag material */
		material: FieldsSchema.enum<typeof Material>(Material, false),

		/** Updated feature list */
		features: FieldsSchema.array(
			FieldsSchema.enum<typeof BagFeature>(BagFeature, false),
			false
		),
	}),
};
