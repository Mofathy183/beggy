/**
 * API Response Types for Suitcases
 */

import { User, Item, Size, Material } from '@/types';
import { SuitcaseSchema } from '@/schemas';
import * as z from 'zod';

/**
 * High-level suitcase classifications.
 *
 * @remarks
 * - Used for filtering, validation, and airline-related rules
 * - Enum values should remain stable once persisted
 */
export enum SuitcaseType {
	CARRY_ON = 'CARRY_ON',
	CHECKED_LUGGAGE = 'CHECKED_LUGGAGE',
	HARD_SHELL = 'HARD_SHELL',
	SOFT_SHELL = 'SOFT_SHELL',
	BUSINESS = 'BUSINESS',
	KIDS = 'KIDS',
	EXPANDABLE = 'EXPANDABLE',
}

/**
 * Optional functional or structural suitcase features.
 *
 * @remarks
 * - Stored as an array to allow feature composition
 * - `NONE` should be treated as a UX/default state
 */
export enum SuitcaseFeature {
	NONE = 'NONE',
	TSA_LOCK = 'TSA_LOCK',
	WATERPROOF = 'WATERPROOF',
	EXPANDABLE = 'EXPANDABLE',
	USB_PORT = 'USB_PORT',
	LIGHTWEIGHT = 'LIGHTWEIGHT',
	ANTI_THEFT = 'ANTI_THEFT',
	SCRATCH_RESISTANT = 'SCRATCH_RESISTANT',
	COMPRESSION_STRAPS = 'COMPRESSION_STRAPS',
	TELESCOPIC_HANDLE = 'TELESCOPIC_HANDLE',
}

/**
 * Wheel configuration for a suitcase.
 *
 * @remarks
 * - Impacts maneuverability and weight
 * - Nullable to support non-wheeled luggage
 */
export enum WheelType {
	/**
	 * No wheels present
	 */
	NONE = 'NONE',

	/**
	 * Traditional two-wheel design
	 */
	TWO_WHEEL = 'TWO_WHEEL',

	/**
	 * Four-wheel configuration
	 */
	FOUR_WHEEL = 'FOUR_WHEEL',

	/**
	 * 360-degree spinner wheels
	 */
	SPINNER = 'SPINNER',
}

/**
 * Core Suitcase domain model.
 *
 * @remarks
 * - Represents a travel container subject to airline constraints
 * - Weight and capacity limits are enforced at business-logic level
 */
export interface Suitcase {
	id: string;
	name: string;
	brand?: string | null;
	type: SuitcaseType;
	color?: string | null;
	size: Size;
	/**
	 * Maximum supported volume/capacity
	 *
	 * @remarks
	 * Unit must be consistent (e.g. liters)
	 */
	maxCapacity: number;

	/**
	 * Maximum supported weight
	 *
	 * @remarks
	 * Unit must be consistent (e.g. kilograms)
	 */
	maxWeight: number;

	/**
	 * Empty suitcase weight
	 *
	 * @remarks
	 * Included when checking airline baggage limits
	 */
	suitcaseWeight: number;
	material?: Material | null;
	features: SuitcaseFeature[];
	wheels?: WheelType | null;
	createdAt: Date;
	updatedAt: Date;
	userId?: string | null;
}

/**
 * Join model linking suitcases to contained items.
 *
 * @remarks
 * - Enables many-to-many relationships
 * - Used for capacity, weight, and packing validation
 */
export interface SuitcaseItems {
	suitcaseId: string;
	itemId: string;
	item: Item;
	suitcase: Suitcase;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Suitcase model with resolved relations.
 *
 * @remarks
 * - Intended for read-heavy endpoints and UI hydration
 * - Avoid using for write operations
 */
export interface SuitcaseWithRelations extends Suitcase {
	suitcaseItems: SuitcaseItems[];
	user: User;
}

/**
 * Allowed "order by" fields for Suitcase queries.
 *
 * @remarks
 * - Mirrors bag ordering fields where applicable
 * - Keeps sorting rules consistent across container-like entities
 */
export enum SuitcaseOrderByField {
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
// SUITCASE SCHEMA
// ==================================================
// Zod-inferred input types for suitcase-related self-service actions.
// Used by both web forms and API handlers to ensure
// consistent validation and type safety across the stack.

export type CreateSuitcaseInput = z.infer<typeof SuitcaseSchema.create>;
export type UpdateSuitcaseInput = z.infer<typeof SuitcaseSchema.update>;
