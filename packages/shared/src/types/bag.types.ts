/**
 * API Response Types for Bags
 */

import { Item, User } from '@/types';
import { BagSchema } from '@/schemas';
import * as z from 'zod';

/**
 * Supported bag categories.
 *
 * @remarks
 * - Used for filtering, validation, and UX grouping
 * - Should remain stable once persisted (enum changes are breaking)
 */
export enum BagType {
	BACKPACK = 'BACKPACK',
	DUFFEL = 'DUFFEL',
	TOTE = 'TOTE',
	MESSENGER = 'MESSENGER',
	LAPTOP_BAG = 'LAPTOP_BAG',
	TRAVEL_BAG = 'TRAVEL_BAG',
	HANDBAG = 'HANDBAG',
	CROSSBODY = 'CROSSBODY',
	SHOULDER_BAG = 'SHOULDER_BAG',
}

/**
 * Physical size classification for bags.
 *
 * @remarks
 * - Abstracts away exact dimensions
 * - Useful for UI labels and basic constraints
 */
export enum Size {
	SMALL = 'SMALL',
	MEDIUM = 'MEDIUM',
	LARGE = 'LARGE',
	EXTRA_LARGE = 'EXTRA_LARGE',
}

/**
 * Primary material used in bag construction.
 *
 * @remarks
 * - Used for durability, weight, and care instructions
 * - Nullable to support legacy or unknown materials
 */
export enum Material {
	LEATHER = 'LEATHER',
	SYNTHETIC = 'SYNTHETIC',
	FABRIC = 'FABRIC',
	POLYESTER = 'POLYESTER',
	NYLON = 'NYLON',
	CANVAS = 'CANVAS',
	HARD_SHELL = 'HARD_SHELL',
	METAL = 'METAL',
}

/**
 * Optional functional or structural features of a bag.
 *
 * @remarks
 * - Stored as an array to allow composition
 * - `NONE` should be treated as a UX/default state, not combined with others
 */
export enum BagFeature {
	NONE = 'NONE',
	WATERPROOF = 'WATERPROOF',
	PADDED_LAPTOP_COMPARTMENT = 'PADDED_LAPTOP_COMPARTMENT',
	USB_PORT = 'USB_PORT',
	ANTI_THEFT = 'ANTI_THEFT',
	MULTIPLE_POCKETS = 'MULTIPLE_POCKETS',
	LIGHTWEIGHT = 'LIGHTWEIGHT',
	EXPANDABLE = 'EXPANDABLE',
	REINFORCED_STRAPS = 'REINFORCED_STRAPS',
	TROLLEY_SLEEVE = 'TROLLEY_SLEEVE',
	HIDDEN_POCKET = 'HIDDEN_POCKET',
}

/**
 * Core Bag domain model.
 *
 * @remarks
 * - Represents a container owned by a user
 * - Capacity and weight limits are enforced at business-logic level
 */
export interface Bag {
	id: string;
	name: string;
	type: BagType;
	color?: string | null;
	size: Size;
	/**
	 * Maximum supported volume/capacity
	 *
	 * @remarks
	 * Unit should be consistent across the system (e.g. liters)
	 */
	maxCapacity: number;

	/**
	 * Maximum supported weight
	 *
	 * @remarks
	 * Unit should be consistent (e.g. kilograms)
	 */
	maxWeight: number;

	/**
	 * Empty bag weight
	 *
	 * @remarks
	 * Used to calculate remaining capacity
	 */
	bagWeight: number;
	material?: Material | null;
	features: BagFeature[];
	createdAt: Date;
	updatedAt: Date;
	userId?: string | null;
}

/**
 * Join model linking bags to contained items.
 *
 * @remarks
 * - Enables many-to-many relationships
 * - Useful for inventory tracking and capacity calculations
 */
export interface BagItems {
	bagId: string;
	itemId: string;
	item: Item;
	bag: Bag;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Bag model with resolved relations.
 *
 * @remarks
 * - Intended for read-heavy endpoints
 * - Avoid using for write operations
 */
export interface BagWithRelations extends Bag {
	bagItems: BagItems[];
	user: User;
}

/**
 * Allowed "order by" fields for Bag queries.
 *
 * @remarks
 * - Restricts sorting to safe, indexed, and publicly exposed fields
 * - Used by order-by schema factory to prevent arbitrary column access
 * - Values map directly to API / database field names
 */
export enum BagOrderByField {
	CREATED_AT = 'createdAt',
	UPDATED_AT = 'updatedAt',
	NAME = 'name',
	MAX_WEIGHT = 'maxWeight',
	MAX_CAPACITY = 'maxCapacity',
}

// ─────────────────────────────────────────────
// Schemas with identical input & output
// (No transforms → input === payload)
//
// Frontend uses Input types only
// Services only accept Payload types
// ─────────────────────────────────────────────

// ==================================================
// BAG SCHEMA
// ==================================================
// Zod-inferred input types for bag-related self-service actions.
// These types represent the exact payload shape accepted by the API
// when a user creates or updates their own bags.

export type CreateBagInput = z.infer<typeof BagSchema.create>;
export type UpdateBagInput = z.infer<typeof BagSchema.update>;
