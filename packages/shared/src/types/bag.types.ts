/**
 * API Response Types for Bags
 */

import type * as z from 'zod';
import type { ContainerStatusDTO } from './constraints.types.js';
import { type BagSchema } from '../schemas/bag.schema.js';
import type { Override, ISODateString } from './index.js';
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
export interface BagDTO {
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
	 * Bag material.
	 */
	material?: Material | null;

	/**
	 * Supported bag features.
	 */
	features: BagFeature[];

	/**
	 * High-level semantic status of the container.
	 *
	 * @remarks
	 * - Represents the overall usability state of the bag/suitcase.
	 * - Derived from multiple metrics (weight, capacity, thresholds, item count).
	 * - Intended for UI messaging, icons, and visual indicators.
	 * - Not a persistence or business-rule source of truth.
	 */
	status?: ContainerStatusDTO;

	/**
	 * Bag creation ISODateString.
	 */
	createdAt: ISODateString;

	/**
	 * Bag last update ISODateString.
	 */
	updatedAt: ISODateString;

	/**
	 * Identifier of the owning user.
	 */
	userId?: string | null;
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
