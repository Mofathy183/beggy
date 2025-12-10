/**
 * API Response Types for Suitcases
 */

export type SuitcaseType =
	| 'CARRY_ON'
	| 'CHECKED_LUGGAGE'
	| 'HARD_SHELL'
	| 'SOFT_SHELL'
	| 'BUSINESS'
	| 'KIDS'
	| 'EXPANDABLE';

export type SuitcaseFeature =
	| 'NONE'
	| 'TSA_LOCK'
	| 'WATERPROOF'
	| 'EXPANDABLE'
	| 'USB_PORT'
	| 'LIGHTWEIGHT'
	| 'ANTI_THEFT'
	| 'SCRATCH_RESISTANT'
	| 'COMPRESSION_STRAPS'
	| 'TELESCOPIC_HANDLE';

export type WheelType = 'NONE' | 'TWO_WHEEL' | 'FOUR_WHEEL' | 'SPINNER';

export type Size = 'SMALL' | 'MEDIUM' | 'LARGE' | 'EXTRA_LARGE';

export type Material =
	| 'LEATHER'
	| 'SYNTHETIC'
	| 'FABRIC'
	| 'POLYESTER'
	| 'NYLON'
	| 'CANVAS'
	| 'HARD_SHELL'
	| 'METAL';

export interface SuitcaseResponse {
	id: string;
	name: string;
	brand?: string | null;
	type: SuitcaseType;
	color?: string | null;
	size: Size;
	capacity: number;
	maxWeight: number;
	weight: number;
	material?: Material | null;
	features: SuitcaseFeature[];
	wheels?: WheelType | null;
	userId?: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface SuitcaseWithItemsResponse extends SuitcaseResponse {
	suitcaseItems?: SuitcaseItemResponse[];
}

export interface SuitcaseItemResponse {
	suitcaseId: string;
	itemId: string;
	item?: import('./item.types').ItemResponse;
	createdAt: string;
	updatedAt: string;
}
