import * as z from 'zod';
import { FieldsSchema } from '@/schemas';
import { ItemCategory, WeightUnit, VolumeUnit } from '@/types';

/**
 * Item-related validation schemas.
 *
 * @remarks
 * - Items represent individual packed objects
 * - Used by both bags and suitcases
 * - Ensures physical measurements are validated consistently
 */
export const ItemSchema = {
	/**
	 * Create-item schema.
	 *
	 * @remarks
	 * - Used when adding a new item
	 * - Physical measurements are required
	 * - Defaults are applied for non-critical fields
	 */
	create: z.strictObject({
		/** Item display name */
		name: FieldsSchema.name('Item Name', 'product'),

		/** Logical category classification */
		category: FieldsSchema.enum<typeof ItemCategory>(ItemCategory),

		/** Number of identical items */
		quantity: FieldsSchema.number('item', 'quantity'),

		/** Weight of a single item */
		weight: FieldsSchema.number('item', 'weight'),

		/** Unit associated with weight */
		weightUnit: FieldsSchema.enum<typeof WeightUnit>(WeightUnit),

		/** Volume of a single item */
		volume: FieldsSchema.number('item', 'volume'),

		/** Unit associated with volume */
		volumeUnit: FieldsSchema.enum<typeof VolumeUnit>(VolumeUnit),

		/**
		 * Optional color descriptor.
		 *
		 * @remarks
		 * - Defaults to "black"
		 * - Normalized during creation
		 */
		color: z.string().optional().default('black'),

		/**
		 * Indicates whether the item is fragile.
		 *
		 * @remarks
		 * - Defaults to false
		 * - Prevents undefined behavior in packing logic
		 */
		isFragile: z.boolean().optional().default(false),
	}),

	/**
	 * Update-item schema.
	 *
	 * @remarks
	 * - Partial update only
	 * - No defaults applied
	 * - Prevents accidental data loss
	 */
	update: z.strictObject({
		/** Updated item name */
		name: FieldsSchema.name('Item Name', 'product', false),

		/** Updated category */
		category: FieldsSchema.enum<typeof ItemCategory>(ItemCategory, false),

		/** Updated quantity */
		quantity: FieldsSchema.number('item', 'quantity', false),

		/** Updated weight */
		weight: FieldsSchema.number('item', 'weight', false),

		/** Updated weight unit */
		weightUnit: FieldsSchema.enum<typeof WeightUnit>(WeightUnit, false),

		/** Updated volume */
		volume: FieldsSchema.number('item', 'volume', false),

		/** Updated volume unit */
		volumeUnit: FieldsSchema.enum<typeof VolumeUnit>(VolumeUnit, false),

		/** Updated color */
		color: z.string().optional(),

		/** Updated fragile flag */
		isFragile: z.boolean().optional(),
	}),
};
