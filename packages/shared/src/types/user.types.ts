/**
 * API Response Types for User
 * These types represent the data structure returned from the API endpoints.
 * They are derived from Prisma models but tailored for API responses.
 */

import type {
	AuthProvider,
	Role,
	UserToken,
	Bag,
	Suitcase,
	Item,
} from '@/types';

export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    OTHER = 'OTHER'
}

export interface Account {
    id: string
    provider: AuthProvider
    providerId: string
    createdAt: Date
    updatedAt: Date
    userId: string
}

export interface User {
    id: string
    firstName: string
    lastName: string
    password: string
    email: string
    role: Role
    profilePicture?: string | null
    gender?: Gender | null
    birthDate?: Date | null
    country?: string | null
    city?: string | null
    isActive: boolean
    isEmailVerified: boolean
    passwordChangeAt?: Date | null
    createdAt: Date
    updatedAt: Date
}

export interface UserWithRelations extends User {
	userToken: UserToken[];
	bags: Bag[];
	suitcases: Suitcase[];
	items: Item[];
	account: Account[];
}
