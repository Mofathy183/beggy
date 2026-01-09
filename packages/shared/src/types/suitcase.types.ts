/**
 * API Response Types for Suitcases
 */

import { User, Item, Size, Material, ContainerStatus } from '@/types';
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
 * - Represents a travel container owned by a user
 * - Subject to airline baggage constraints
 * - Acts as an aggregate root for contained items
 */
export interface Suitcase {
	/**
	 * Primary suitcase identifier.
	 */
	id: string;

	/**
	 * Human-readable suitcase name.
	 */
	name: string;

	/**
	 * Optional suitcase brand.
	 */
	brand?: string | null;

	/**
	 * Suitcase category/type (e.g. carry-on, checked).
	 */
	type: SuitcaseType;

	/**
	 * Optional suitcase color.
	 */
	color?: string | null;

	/**
	 * Physical size classification.
	 */
	size: Size;

	/**
	 * Maximum supported volume/capacity.
	 *
	 * @remarks
	 * - Unit must be consistent across the system (e.g. liters)
	 * - Enforced when adding or updating items
	 */
	maxCapacity: number;

	/**
	 * Maximum supported weight.
	 *
	 * @remarks
	 * - Unit must be consistent (e.g. kilograms)
	 * - Enforced according to airline baggage rules
	 */
	maxWeight: number;

	/**
	 * Empty suitcase weight.
	 *
	 * @remarks
	 * - Represents the suitcase's own weight without contents
	 * - Included when validating airline baggage limits
	 */
	suitcaseWeight: number;

	/**
	 * Computed suitcase metrics.
	 *
	 * @remarks
	 * - Derived from contained items and suitcase constraints
	 * - Read-only values exposed for API responses and UI consumption
	 * - Never persisted directly in the database
	 */
	currentWeight?: number | null;
	currentCapacity?: number | null;
	remainingWeight?: number | null;
	remainingCapacity?: number | null;

	/**
	 * Constraint state flags.
	 *
	 * @remarks
	 * - Provide quick insight into airline and capacity violations
	 * - Useful for UI indicators and validation feedback
	 */
	isOverweight?: boolean | null;
	isOverCapacity?: boolean | null;
	isFull?: boolean | null;

	/**
	 * Utilization percentages.
	 *
	 * @remarks
	 * - Values range from 0 to 100
	 * - Used for progress indicators and summaries
	 */
	weightPercentage?: number | null;
	capacityPercentage?: number | null;

	/**
	 * Number of items currently contained in the suitcase.
	 */
	itemCount?: number | null;

	/**
	 * Derived suitcase status.
	 *
	 * @remarks
	 * Computed from capacity, weight, and airline constraints.
	 */
	status?: ContainerStatus | null;

	/**
	 * Suitcase material.
	 */
	material?: Material | null;

	/**
	 * Supported suitcase features.
	 */
	features: SuitcaseFeature[];

	/**
	 * Wheel configuration.
	 */
	wheels?: WheelType | null;

	/**
	 * Suitcase creation timestamp.
	 */
	createdAt: Date;

	/**
	 * Suitcase last update timestamp.
	 */
	updatedAt: Date;

	/**
	 * Identifier of the owning user.
	 */
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
