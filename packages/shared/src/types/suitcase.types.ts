/**
 * API Response Types for Suitcases
 */

import { type Size, type Material } from '../constants/bag.enums.js';
import type { User } from '../types/user.types.js';
import type { Item } from '../types/item.types.js';
import { type ContainerStatus } from '../constants/constraints.enums.js';
import { type SuitcaseSchema } from '../schemas/suitcase.schema.js';
import type * as z from 'zod';
import type { Override } from './index.js';
import type {
	SuitcaseFeature,
	SuitcaseType,
	WheelType,
} from '../constants/suitcase.enums.js';

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

export type CreateSuitcaseInput = Override<
	z.infer<typeof SuitcaseSchema.create>,
	{
		name: string;
		type: SuitcaseType;
		size: Size;
		maxCapacity: number;
		maxWeight: number;
	}
>;

export type UpdateSuitcaseInput = z.infer<typeof SuitcaseSchema.update>;
