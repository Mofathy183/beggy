/**
 * API Response Types for Bags
 */

export type BagType =
	| 'BACKPACK'
	| 'DUFFEL'
	| 'TOTE'
	| 'MESSENGER'
	| 'LAPTOP_BAG'
	| 'TRAVEL_BAG'
	| 'HANDBAG'
	| 'CROSSBODY'
	| 'SHOULDER_BAG';

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

export type BagFeature =
	| 'NONE'
	| 'WATERPROOF'
	| 'PADDED_LAPTOP_COMPARTMENT'
	| 'USB_PORT'
	| 'ANTI_THEFT'
	| 'MULTIPLE_POCKETS'
	| 'LIGHTWEIGHT'
	| 'EXPANDABLE'
	| 'REINFORCED_STRAPS'
	| 'TROLLEY_SLEEVE'
	| 'HIDDEN_POCKET';

export interface BagResponse {
	id: string;
	name: string;
	type: BagType;
	color?: string | null;
	size: Size;
	capacity: number;
	maxWeight: number;
	weight: number;
	material?: Material | null;
	features: BagFeature[];
	userId?: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface BagWithItemsResponse extends BagResponse {
	bagItems?: BagItemResponse[];
}

export interface BagItemResponse {
	bagId: string;
	itemId: string;
	item?: import('./item.types').ItemResponse;
	createdAt: string;
	updatedAt: string;
}
