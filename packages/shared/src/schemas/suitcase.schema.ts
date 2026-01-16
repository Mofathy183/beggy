import * as z from 'zod';
import { FieldsSchema } from '../schemas/fields.schema.js';
import { Size, Material } from '../types/bag.types.js';
import {
	WheelType,
	SuitcaseFeature,
	SuitcaseType,
} from '../types/suitcase.types.js';

/**
 * Suitcase-related validation schemas.
 *
 * @remarks
 * - Suitcases represent larger containers with static constraints
 * - Designed for shared usage across web forms and API routes
 * - Uses strict validation to prevent mass assignment
 */
export const SuitcaseSchema = {
	/**
	 * Create-suitcase schema.
	 *
	 * @remarks
	 * - Used when creating a new suitcase
	 * - Capacity and type fields are required
	 * - Optional descriptive fields improve UX but are not mandatory
	 */
	create: z.strictObject({
		/** User-defined suitcase name */
		name: FieldsSchema.name('Suitcase Name', 'product'),

		/** Optional brand name */
		brand: FieldsSchema.name('Suitcase Brand', 'brand', false),

		/** Suitcase type classification */
		type: FieldsSchema.enum<typeof SuitcaseType>(SuitcaseType),

		/**
		 * Optional color descriptor.
		 *
		 * @remarks
		 * - Defaults to "black"
		 * - Applied only during creation
		 */
		color: z.string().optional().default('black'),

		/** Suitcase size classification */
		size: FieldsSchema.enum<typeof Size>(Size),

		/** Maximum internal capacity */
		maxCapacity: FieldsSchema.number('suitcase', 'capacity'),

		/** Maximum safe weight */
		maxWeight: FieldsSchema.number('suitcase', 'weight'),

		/** Optional suitcase material */
		material: FieldsSchema.enum<typeof Material>(Material, false),

		/** Optional list of supported features */
		features: FieldsSchema.array(
			FieldsSchema.enum<typeof SuitcaseFeature>(SuitcaseFeature, false),
			false
		),

		/** Optional wheel configuration */
		wheels: FieldsSchema.enum<typeof WheelType>(WheelType, false),
	}),

	/**
	 * Update-suitcase schema.
	 *
	 * @remarks
	 * - Partial update only
	 * - Does not apply defaults
	 * - Safe for PATCH-style API endpoints
	 */
	update: z.strictObject({
		/** Updated suitcase name */
		name: FieldsSchema.name('Suitcase Name', 'product', false),

		/** Updated brand */
		brand: FieldsSchema.name('Suitcase Brand', 'brand', false),

		/** Updated suitcase type */
		type: FieldsSchema.enum<typeof SuitcaseType>(SuitcaseType, false),

		/** Updated color value */
		color: z.string().optional(),

		/** Updated size */
		size: FieldsSchema.enum<typeof Size>(Size, false),

		/** Updated maximum capacity */
		maxCapacity: FieldsSchema.number('suitcase', 'capacity', false),

		/** Updated maximum weight */
		maxWeight: FieldsSchema.number('suitcase', 'weight', false),

		/** Updated material */
		material: FieldsSchema.enum<typeof Material>(Material, false),

		/** Updated feature list */
		features: FieldsSchema.array(
			FieldsSchema.enum<typeof SuitcaseFeature>(SuitcaseFeature, false),
			false
		),

		/** Updated wheel configuration */
		wheels: FieldsSchema.enum<typeof WheelType>(WheelType, false),
	}),
};
