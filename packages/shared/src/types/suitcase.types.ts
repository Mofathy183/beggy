/**
 * API Response Types for Suitcases
 */

import { type Size, type Material } from '../constants/bag.enums.js';
import { type SuitcaseSchema } from '../schemas/suitcase.schema.js';
import type * as z from 'zod';
import type { Override, ISODateString, ContainerStatusDTO } from './index.js';
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
export interface SuitcaseDTO {
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
	 * Suitcase creation ISODateString.
	 */
	createdAt: ISODateString;

	/**
	 * Suitcase last update ISODateString.
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
