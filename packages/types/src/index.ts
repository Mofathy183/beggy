/**
 * API Response Types
 *
 * This module exports all API response types that can be used by both
 * the API (for typing responses) and the Web app (for typing API calls).
 *
 * These types are derived from Prisma models but are tailored for API responses,
 * ensuring type safety across the monorepo without exposing Prisma internals.
 */

// User types
export type {
	UserResponse,
	UserWithRelationsResponse,
	AccountResponse,
} from './types/user.types';

// Bag types
export type {
	BagResponse,
	BagWithItemsResponse,
	BagItemResponse,
} from './types/bag.types';

// Item types
export type {
	ItemResponse,
	ItemWithRelationsResponse,
} from './types/item.types';

// Suitcase types
export type {
	SuitcaseResponse,
	SuitcaseWithItemsResponse,
	SuitcaseItemResponse,
} from './types/suitcase.types';

export type {
	//* USER
	Gender,

	//* BAG
	BagType,
	BagFeature,

	//* BAG + SUITCASE
	Size,
	Material,

	//* SUITCASE
	SuitcaseFeature,
	SuitcaseType,
	WheelType,

	//* ITEM
	ItemCategory,

	//* RBAC
	Role,
	Action,
	Scope,
	Subject,
} from './enum';

// /**
//  * Common API response wrapper types
//  */
// export interface ApiResponse<T> {
// 	success: boolean;
// 	data: T;
// 	message?: string;
// }

// export interface ApiErrorResponse {
// 	success: false;
// 	error: {
// 		message: string;
// 		code?: string;
// 		details?: unknown;
// 	};
// }

// export interface PaginatedResponse<T> {
// 	success: boolean;
// 	data: T[];
// 	pagination: {
// 		page: number;
// 		limit: number;
// 		total: number;
// 		totalPages: number;
// 	};
// }
