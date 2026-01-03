/**
 * API Response Types for Suitcases
 */

import { User, Item, Size, Material } from '@/types';
import { SuitcaseSchema } from '@/schemas';
import * as z from 'zod';

export enum SuitcaseType {
	CARRY_ON = 'CARRY_ON',
	CHECKED_LUGGAGE = 'CHECKED_LUGGAGE',
	HARD_SHELL = 'HARD_SHELL',
	SOFT_SHELL = 'SOFT_SHELL',
	BUSINESS = 'BUSINESS',
	KIDS = 'KIDS',
	EXPANDABLE = 'EXPANDABLE',
}

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

export enum WheelType {
	NONE = 'NONE',
	TWO_WHEEL = 'TWO_WHEEL',
	FOUR_WHEEL = 'FOUR_WHEEL',
	SPINNER = 'SPINNER',
}
export interface Suitcase {
	id: string;
	name: string;
	brand?: string | null;
	type: SuitcaseType;
	color?: string | null;
	size: Size;
	maxCapacity: number;
	maxWeight: number;
	suitcaseWeight: number;
	material?: Material | null;
	features: SuitcaseFeature[];
	wheels?: WheelType | null;
	createdAt: Date;
	updatedAt: Date;
	userId?: string | null;
}

export interface SuitcaseItems {
	suitcaseId: string;
	itemId: string;
	item: Item;
	suitcase: Suitcase;
	createdAt: Date;
	updatedAt: Date;
}

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
