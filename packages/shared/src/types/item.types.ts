/**
 * API Response Types for Items
 */
import { User, SuitcaseItems, BagItems } from '@/types';
import { ItemSchema } from '@/schemas';
import * as z from 'zod';

export enum ItemCategory {
	ELECTRONICS = 'ELECTRONICS',
	ACCESSORIES = 'ACCESSORIES',
	FURNITURE = 'FURNITURE',
	MEDICINE = 'MEDICINE',
	CLOTHING = 'CLOTHING',
	BOOKS = 'BOOKS',
	FOOD = 'FOOD',
}

export enum VolumeUnit {
	ML = 'ML',
	LITER = 'LITER',
	CU_CM = 'CU_CM', // cubic centimeters
	CU_IN = 'CU_IN', // cubic inches
}

export enum WeightUnit {
	GRAM = 'GRAM',
	KILOGRAM = 'KILOGRAM',
	POUND = 'POUND',
	OUNCE = 'OUNCE',
}

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

export interface ItemWithRelations extends Item {
	bagItems: BagItems[];
	suitcaseItems: SuitcaseItems[];
	user?: User | null;
}

/**
 * Allowed "order by" fields for Item queries.
 *
 * @remarks
 * - Ensures items can only be sorted by explicitly approved fields
 * - Prevents accidental sorting on unindexed or sensitive columns
 */
export enum ItemOrderByField {
	CREATED_AT = 'createdAt',
	UPDATED_AT = 'updatedAt',
	NAME = 'name',
	WEIGHT = 'weight',
	VOLUME = 'volume',
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

export type CreateItemInput = z.infer<typeof ItemSchema.create>;
export type UpdateItemInput = z.infer<typeof ItemSchema.update>;
