/**
 * API Response Types for Bags
 */

import type * as z from 'zod';
import type { Item } from '../types/item.types.js';
import type { User } from '../types/user.types.js';
import { type ContainerStatus } from '../constants/constraints.enums.js';
import { type BagSchema } from '../schemas/bag.schema.js';
import type { Override } from './index.js';
import type {
	BagType,
	BagFeature,
	Size,
	Material,
} from '../constants/bag.enums.js';

/**
 * Core Bag domain model.
 *
 * @remarks
 * - Represents a physical container owned by a user
 * - Capacity and weight constraints are enforced at the business-logic level
 * - Acts as an aggregate root for contained items
 */
export interface Bag {
	/**
	 * Primary bag identifier.
	 */
	id: string;

	/**
	 * Human-readable bag name.
	 */
	name: string;

	/**
	 * Bag category/type (e.g. backpack, suitcase).
	 */
	type: BagType;

	/**
	 * Optional bag color.
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
	 * - Enforced at runtime via business rules
	 */
	maxWeight: number;

	/**
	 * Empty bag weight.
	 *
	 * @remarks
	 * - Represents the bag's own weight without contents
	 * - Used when calculating total and remaining capacity
	 */
	bagWeight: number;

	/**
	 * Computed bag metrics.
	 *
	 * @remarks
	 * - Derived from contained items and bag constraints
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
	 * - Provide quick insight into constraint violations
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
	 * Number of items currently contained in the bag.
	 */
	itemCount?: number | null;

	/**
	 * Derived bag status.
	 *
	 * @remarks
	 * Computed from capacity and weight constraints.
	 */
	status?: ContainerStatus | null;

	/**
	 * Bag material.
	 */
	material?: Material | null;

	/**
	 * Supported bag features.
	 */
	features: BagFeature[];

	/**
	 * Bag creation timestamp.
	 */
	createdAt: Date;

	/**
	 * Bag last update timestamp.
	 */
	updatedAt: Date;

	/**
	 * Identifier of the owning user.
	 */
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

export type CreateBagInput = Override<
	z.infer<typeof BagSchema.create>,
	{
		name: string;
		type: BagType;
		size: Size;
		maxCapacity: number;
		maxWeight: number;
	}
>;
export type UpdateBagInput = z.infer<typeof BagSchema.update>;
