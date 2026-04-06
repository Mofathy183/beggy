import type * as z from 'zod';
import type {
	WeightUnit,
	VolumeUnit,
	ItemCategory,
} from '../constants/item.enums';
import type {
	ContainerStatusReason,
	ContainerStatus,
	ContainerType,
} from '../constants/constraints.enums';
import type { ItemDTO } from '../types/item.types';
import type { ContainerSchema } from '../schemas/container.schema';
import type { Override } from './index';

/**
 * Lookup map for converting any supported weight unit into kilograms.
 *
 * @remarks
 * - Used internally by `convertToKilogram`
 * - Keys must cover **all** `WeightUnit` enum values
 * - Values represent the **already converted** weight in kilograms
 *
 * @example
 * ```ts
 * const map: ConvertToKilogram = {
 *   KILOGRAM: 5,
 *   GRAM: 0.005,
 *   POUND: 2.26796,
 *   OUNCE: 0.141748,
 * };
 * ```
 */
export type ConvertToKilogram = Record<WeightUnit, number>;

/**
 * Lookup map for converting any supported volume unit into liters.
 *
 * @remarks
 * - Used internally by `convertToLiter`
 * - Ensures all `VolumeUnit` values are handled explicitly
 * - Centralizes unit normalization logic
 *
 * @example
 * ```ts
 * const map: ConvertToLiter = {
 *   LITER: 3.5,
 *   ML: 0.0035,
 *   CU_CM: 0.0035,
 *   CU_IN: 0.057,
 * };
 * ```
 */
export type ConvertToLiter = Record<VolumeUnit, number>;

/**
 * Union type representing item collections inside containers.
 *
 * @remarks
 * - Used by shared calculation utilities (weight, capacity, count)
 * - Requires a common shape: `{ item: { weight, volume, quantity, ... } }`
 * - Keeps helper functions container-agnostic
 *
 * @example
 * ```ts
 * calculateCurrentWeight(bag.bagItems);
 * calculateCurrentCapacity(suitcase.suitcaseItems);
 * ```
 */
export interface ContainerItem {
	quantity: number;
	item: Pick<ItemDTO, 'volume' | 'weight' | 'weightUnit' | 'volumeUnit'>;
}

/**
 * Final evaluated container status with explanatory reasons.
 *
 * @remarks
 * Reasons provide traceability for UI messaging and debugging.
 */
export interface ContainerStatusResult {
	status: ContainerStatus;
	reasons: ContainerStatusReason[];
}

/**
 * Input signals used to derive container status.
 *
 * @description
 * Represents the raw outputs of calculation functions.
 * This layer must remain free of business logic.
 *
 * @remarks
 * - Must be computed upstream (e.g., weight/capacity calculators)
 * - Prevents duplicated logic across status evaluators
 */
export interface ContainerStatusParams {
	isOverweight: boolean;
	isOverCapacity: boolean;
	isWeightNearLimit: boolean;
	isCapacityNearLimit: boolean;

	/** Total item quantity across all container items */
	itemCount: number;
}

/**
 * Runtime-derived container metrics.
 *
 * @description
 * Aggregated values computed from items and constraints.
 * Intended for UI consumption only.
 *
 * @remarks
 * - Never persisted
 * - Safe to recompute on every request
 */
export interface ContainerMetrics {
	/**
	 * Computed bag metrics.
	 *
	 * @remarks
	 * - Derived from contained items and bag constraints
	 * - Never persisted directly in the database
	 */
	currentWeight: number;
	currentCapacity: number;
	remainingWeight: number;
	remainingCapacity: number;

	/**
	 * Utilization percentages.
	 *
	 * @remarks
	 * - Values range from 0 to 100
	 * - Used for progress indicators and summaries
	 */
	weightPercentage: number;
	capacityPercentage: number;

	/**
	 * Number of items currently contained in the bag.
	 */
	itemCount: number;
}

/**
 * Constraint evaluation state for a container.
 *
 * @remarks
 * Provides quick flags for UI indicators and complements {@link ContainerMetrics}.
 */
export interface ContainerState {
	/**
	 * Constraint state flags.
	 *
	 * @remarks
	 * - Provide quick insight into constraint violations
	 * - Useful for UI indicators and validation feedback
	 */
	isOverweight: boolean;
	isOverCapacity: boolean;
	isFull: boolean;

	/**
	 * Derived bag status.
	 *
	 * @remarks
	 * Computed from capacity and weight constraints.
	 */
	status: ContainerStatus;
	reasons: ContainerStatusReason[];
}

/**
 * Combined container status payload.
 *
 * @remarks
 * Groups metrics and state for consistent consumption by the UI.
 */
export interface ContainerStatusDTO {
	metrics: ContainerMetrics;
	state: ContainerState;
}

// ── Response DTOs ─────────────────────────────────────────────────

/**
 * Minimal container identity included in packing responses.
 *
 * @description
 * Designed for partial UI updates where full container data
 * is already cached on the client.
 *
 * @remarks
 * Intentionally lightweight — the UI already has the full
 * bag/suitcase object. This gives it just enough to update
 * the right card and re-render status.
 */
export interface ContainerSummaryDTO {
	/**
	 * Container identifier (matches bag.container.id or suitcase.container.id)
	 */
	containerId: string;

	/**
	 * Derived status — the single thing the UI needs to re-render
	 * progress bars, badges, and warnings.
	 */
	status: ContainerStatusDTO;
}

/**
 * Response shape for move operations.
 *
 * @remarks
 * - Returns both containers so the frontend can update
 *   two container cards in a single response.
 * - Both states are post-operation snapshots.
 */
export interface MoveResultDTO {
	/** Source container state after item was removed */
	from: ContainerSummaryDTO;
	/** Destination container state after item was added */
	to: ContainerSummaryDTO;
}

/**
 * A single item entry inside a container state response.
 *
 * @description
 * Combines quantity with display-ready item attributes.
 *
 * @remarks
 * - Combines ContainerItems quantity with Item display data.
 * - Enough for the UI to render item chips, weight breakdown,
 *   and remove/move action triggers.
 */
export interface PackedItemDTO {
	itemId: string;
	name: string;
	quantity: number;
	weight: number;
	weightUnit: WeightUnit;
	volume: number;
	volumeUnit: VolumeUnit;
	category: ItemCategory;
	isFragile: boolean;
	color?: string | null;
}

/**
 * Full container state response.
 *
 * @description
 * Canonical source of truth for rendering a container view.
 *
 * @remarks
 * - Designed as the single source of truth for the container UI.
 * - Includes identity, packed items, and full derived status.
 * - Used when the frontend needs to bootstrap or refresh a container view.
 */
export interface ContainerStateDTO {
	containerId: string;

	/**
	 * Container type — tells the UI whether to render
	 * the BagCard or SuitcaseCard component.
	 */
	type: ContainerType;

	/**
	 * Items currently packed inside this container.
	 * Ordered by insertion time (newest last).
	 *
	 * @remarks
	 * Expected to be ordered by insertion time (ascending).
	 */
	items: PackedItemDTO[];

	/** Full derived status — metrics + state flags */
	status: ContainerStatusDTO;
}

// ─────────────────────────────────────────────
// Schemas with identical input & output
// (No transforms → input === payload)
//
// Frontend uses Input types only
// Services only accept Payload types
// ─────────────────────────────────────────────

// ==================================================
// CONTAINER SCHEMA
// ==================================================
// Zod-inferred input types for Container-related self-service actions.
// These types represent the exact payload shape accepted by the API
// when a user creates or updates their own Containers.

/**
 * Payload for packing an item into a container.
 *
 * @see ContainerSchema.pack
 */
export type PackItemInput = Override<
	z.infer<typeof ContainerSchema.pack>,
	{
		quantity: number;
	}
>;

/**
 * Payload for removing an item from a container.
 *
 * @see ContainerSchema.unpack
 */
export type UnpackItemInput = Override<
	z.infer<typeof ContainerSchema.unpack>,
	{
		quantity: number;
	}
>;

/**
 * Payload for moving an item between containers.
 *
 * @see ContainerSchema.move
 */
export type MoveItemInput = Override<
	z.infer<typeof ContainerSchema.move>,
	{
		quantity: number;
	}
>;
