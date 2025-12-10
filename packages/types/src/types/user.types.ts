/**
 * API Response Types for User
 * These types represent the data structure returned from the API endpoints.
 * They are derived from Prisma models but tailored for API responses.
 */

export type Role = 'ADMIN' | 'MEMBER' | 'SUBSCRIBER' | 'USER';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type Provider = 'GOOGLE' | 'FACEBOOK';

export type TokenType =
	| 'EMAIL_VERIFICATION'
	| 'PASSWORD_RESET'
	| 'CHANGE_EMAIL';

export interface UserResponse {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	role: Role;
	profilePicture?: string | null;
	gender?: Gender | null;
	birthDate?: string | null; // ISO date string
	country?: string | null;
	city?: string | null;
	isActive: boolean;
	isEmailVerified: boolean;
	passwordChangeAt?: string | null; // ISO date string
	createdAt: string; // ISO date string
	updatedAt: string; // ISO date string
}

export interface UserWithRelationsResponse extends UserResponse {
	account?: AccountResponse[];
	bags?: import('./bag.types').BagResponse[];
	suitcases?: import('./suitcase.types').SuitcaseResponse[];
	items?: import('./item.types').ItemResponse[];
}

export interface AccountResponse {
	id: string;
	provider: Provider;
	providerId: string;
	userId: string;
	createdAt: string;
	updatedAt: string;
}

export interface UserTokenResponse {
	id: string;
	type: TokenType;
	expiresAt: string;
	createdAt: string;
}
