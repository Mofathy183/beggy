/**
 * API Response Types for Items
 */

export type ItemCategory =
	| 'ELECTRONICS'
	| 'ACCESSORIES'
	| 'FURNITURE'
	| 'MEDICINE'
	| 'CLOTHING'
	| 'BOOKS'
	| 'FOOD';

export interface ItemResponse {
	id: string;
	name: string;
	category: ItemCategory;
	quantity: number;
	weight: number;
	volume: number;
	color?: string | null;
	isFragile: boolean;
	userId?: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface ItemWithRelationsResponse extends ItemResponse {
	bagItems?: import('./bag.types').BagItemResponse[];
	suitcaseItems?: import('./suitcase.types').SuitcaseItemResponse[];
}
