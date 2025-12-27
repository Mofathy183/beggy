/**
 * API Response Types for Bags
 */

import { Item, User } from '@/types';

export enum BagType {
	BACKPACK = 'BACKPACK',
	DUFFEL = 'DUFFEL',
	TOTE = 'TOTE',
	MESSENGER = 'MESSENGER',
	LAPTOP_BAG = 'LAPTOP_BAG',
	TRAVEL_BAG = 'TRAVEL_BAG',
	HANDBAG = 'HANDBAG',
	CROSSBODY = 'CROSSBODY',
	SHOULDER_BAG = 'SHOULDER_BAG',
}

export enum Size {
	SMALL = 'SMALL',
	MEDIUM = 'MEDIUM',
	LARGE = 'LARGE',
	EXTRA_LARGE = 'EXTRA_LARGE',
}

export enum Material {
	LEATHER = 'LEATHER',
	SYNTHETIC = 'SYNTHETIC',
	FABRIC = 'FABRIC',
	POLYESTER = 'POLYESTER',
	NYLON = 'NYLON',
	CANVAS = 'CANVAS',
	HARD_SHELL = 'HARD_SHELL',
	METAL = 'METAL',
}

export enum BagFeature {
	NONE = 'NONE',
	WATERPROOF = 'WATERPROOF',
	PADDED_LAPTOP_COMPARTMENT = 'PADDED_LAPTOP_COMPARTMENT',
	USB_PORT = 'USB_PORT',
	ANTI_THEFT = 'ANTI_THEFT',
	MULTIPLE_POCKETS = 'MULTIPLE_POCKETS',
	LIGHTWEIGHT = 'LIGHTWEIGHT',
	EXPANDABLE = 'EXPANDABLE',
	REINFORCED_STRAPS = 'REINFORCED_STRAPS',
	TROLLEY_SLEEVE = 'TROLLEY_SLEEVE',
	HIDDEN_POCKET = 'HIDDEN_POCKET',
}

export interface Bag {
	id: string;
	name: string;
	type: BagType;
	color?: string | null;
	size: Size;
	maxCapacity: number;
	maxWeight: number;
	bagWeight: number;
	material?: Material | null;
	features: BagFeature[];
	createdAt: Date;
	updatedAt: Date;
	userId?: string | null;
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
	bagItems: BagItems[];
	user: User;
}
