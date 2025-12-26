/**
 * API Response Types for Bags
 */

import { Item, User } from '@/types';

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

export interface Bag {
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

export interface BagItems {
	bagId: string;
	itemId: string;
	item: Item;
	bag: Bag;
	createdAt: Date;
	updatedAt: Date;
}

export interface BagWithRelations extends Bag {
	bagItems?: BagItems[];
	user: User;
}
