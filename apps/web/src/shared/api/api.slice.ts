import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

/**
 * Canonical cache tag identifiers used by RTK Query.
 *
 * @remarks
 * Tags represent backend resource domains and are used for
 * cache invalidation across feature APIs.
 *
 * Features should reuse these tags instead of defining new ones
 * to ensure consistent cache behavior.
 */
export const TagTypes = {
	AUTH: 'Auth',
	USER: 'User',
	PROFILE: 'Profile',
	ITEM: 'Item',
} as const;

/**
 * Union type representing all valid RTK Query tag identifiers.
 */
export type TagType = (typeof TagTypes)[keyof typeof TagTypes];

/**
 * Runtime list of tag types passed to RTK Query configuration.
 */
const tagTypes = Object.values(TagTypes);

/**
 * Global RTK Query API slice.
 *
 * @description
 * Defines the single RTK Query instance used across the application.
 * Feature modules extend this slice using `injectEndpoints`.
 *
 * @remarks
 * Design constraints:
 * - This file must remain minimal and stable
 * - Feature endpoints should NOT be defined here
 * - Feature APIs (auth, users, profile, items, etc.) extend this slice
 *   via `apiSlice.injectEndpoints`
 *
 * Keeping this slice small prevents circular dependencies and keeps
 * the data layer scalable as the application grows.
 */
export const apiSlice = createApi({
	/**
	 * Redux reducer key where RTK Query state is stored.
	 *
	 * Example store shape:
	 * ```ts
	 * {
	 *   api: {
	 *     queries: {},
	 *     mutations: {},
	 *     provided: {}
	 *   }
	 * }
	 * ```
	 */
	reducerPath: 'api',

	/**
	 * Shared base query used by all endpoints.
	 *
	 * @remarks
	 * Centralizes network concerns such as:
	 * - API base URL
	 * - credentials handling (cookies)
	 * - headers
	 * - global error handling
	 */
	baseQuery,

	/**
	 * List of tag types available for cache invalidation.
	 *
	 * @remarks
	 * Tags represent backend resources. Mutations should invalidate
	 * relevant tags so queries depending on those resources are refreshed.
	 */
	tagTypes,

	/**
	 * No endpoints are defined here intentionally.
	 *
	 * Feature modules register endpoints through:
	 * `apiSlice.injectEndpoints({ endpoints })`
	 */
	endpoints: () => ({}),
});
