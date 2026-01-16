/**
 * API Response Types for Items
 */
import type { BagItems } from '../types/bag.types.js';
import type { SuitcaseItems } from '../types/suitcase.types.js';
import type { User } from '../types/user.types.js';
import { ItemSchema } from '../schemas/item.schema.js';
import * as z from 'zod';

/**
 * High-level classification for items.
 *
 * @remarks
 * - Used for filtering, grouping, and UX affordance
 * - Categories should remain stable once persisted
 */
export enum ItemCategory {
	ELECTRONICS = 'ELECTRONICS',
	ACCESSORIES = 'ACCESSORIES',
	FURNITURE = 'FURNITURE',
	MEDICINE = 'MEDICINE',
	CLOTHING = 'CLOTHING',
	BOOKS = 'BOOKS',
	FOOD = 'FOOD',
}

/**
 * Supported volume measurement units.
 *
 * @remarks
 * - Enables accurate capacity calculations
 * - Conversions should happen in domain services, not models
 */
export enum VolumeUnit {
	/**
	 * Milliliters
	 */
	ML = 'ML',

	/**
	 * Liters
	 */
	LITER = 'LITER',

	/**
	 * Cubic centimeters
	 */
	CU_CM = 'CU_CM',

	/**
	 * Cubic inches
	 */
	CU_IN = 'CU_IN',
}

/**
 * Supported weight measurement units.
 *
 * @remarks
 * - Used for transport and capacity constraints
 * - Keep units explicit to avoid implicit assumptions
 */
export enum WeightUnit {
	/**
	 * Grams
	 */
	GRAM = 'GRAM',

	/**
	 * Kilograms
	 */
	KILOGRAM = 'KILOGRAM',

	/**
	 * Pounds
	 */
	POUND = 'POUND',

	/**
	 * Ounces
	 */
	OUNCE = 'OUNCE',
}

/**
 * Core Item domain model.
 *
 * @remarks
 * - Represents a physical object that can be placed into containers
 * - Units must always match the provided measurement values
 */
export interface Item {
	id: string;
	name: string;
	category: ItemCategory;
	quantity: number;
	weight: number;
	weightUnit: WeightUnit;
	volume: number;
	volumeUnit: VolumeUnit;
	color?: string | null;
	isFragile: boolean;
	createdAt: Date;
	updatedAt: Date;
	userId?: string | null;
}

/**
 * Item model with resolved relations.
 *
 * @remarks
 * - Intended for read-heavy queries and UI hydration
 * - Avoid using for write operations
 */
export interface ItemWithRelations extends Item {
	bagItems: BagItems[];
	suitcaseItems: SuitcaseItems[];
	user?: User | null;
}

/**
 * Allowed "order by" fields for Item queries.
 *
 * @remarks
 * - Ensures items can only be sorted by explicitly approved fields
 * - Prevents accidental sorting on unindexed or sensitive columns
 */
export enum ItemOrderByField {
	CREATED_AT = 'createdAt',
	UPDATED_AT = 'updatedAt',
	NAME = 'name',
	WEIGHT = 'weight',
	VOLUME = 'volume',
}

// ─────────────────────────────────────────────
// Schemas with identical input & output
// (No transforms → input === payload)
//
// Frontend uses Input types only
// Services only accept Payload types
// ─────────────────────────────────────────────

// ==================================================
// ITEM SCHEMA
// ==================================================
// Zod-inferred input types for item-related self-service actions.
// These inputs follow PATCH semantics for updates and are shared
// between frontend forms, API routes, and service-layer logic.

export type CreateItemInput = z.infer<typeof ItemSchema.create>;
export type UpdateItemInput = z.infer<typeof ItemSchema.update>;
