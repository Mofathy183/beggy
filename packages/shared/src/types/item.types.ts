/**
 * API Response Types for Items
 */
import type { BagItems } from '../types/bag.types.js';
import type { SuitcaseItems } from '../types/suitcase.types.js';
import type { User } from '../types/user.types.js';
import { type ItemSchema } from '../schemas/item.schema.js';
import type * as z from 'zod';
import type { Override } from './index.js';
import type {
	ItemCategory,
	WeightUnit,
	VolumeUnit,
} from '../constants/item.enums.js';

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

export type CreateItemInput = Override<
	z.infer<typeof ItemSchema.create>,
	{
		name: string;
		category: ItemCategory;
		quantity: number;
		weight: number;
		weightUnit: WeightUnit;
		volume: number;
		volumeUnit: VolumeUnit;
	}
>;

export type UpdateItemInput = z.infer<typeof ItemSchema.update>;
