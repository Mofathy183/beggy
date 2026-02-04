import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

/**
 * Global RTK Query API slice.
 *
 * Responsibilities:
 * - Defines the single RTK Query instance for the entire application
 * - Provides shared configuration (baseQuery, tagTypes, reducerPath)
 * - Acts as the extension point for feature APIs via `injectEndpoints`
 *
 * Important design notes:
 * - This file should NOT define feature endpoints directly
 * - Feature-specific APIs (auth, users, profile, etc.)
 *   must extend this slice using `apiSlice.injectEndpoints`
 * - Keeping this slice minimal avoids circular dependencies
 *   and keeps the data layer scalable
 */
export const apiSlice = createApi({
	/**
	 * Reducer key under which RTK Query state will be stored
	 * in the Redux store.
	 *
	 * Example state shape:
	 * {
	 *   api: {
	 *     queries: {},
	 *     mutations: {},
	 *     provided: {}
	 *   }
	 * }
	 */
	reducerPath: 'api',

	/**
	 * Base query function used by all endpoints.
	 *
	 * This centralizes:
	 * - API base URL
	 * - credentials (cookies)
	 * - headers
	 * - global error handling
	 */
	baseQuery,

	/**
	 * Tag types used for cache invalidation.
	 *
	 * Rules:
	 * - Tags represent backend resources or domains
	 * - Features should reuse these tags instead of redefining them
	 * - Keep this list small and meaningful
	 */
	tagTypes: ['Auth', 'User', 'Profile'],

	/**
	 * No endpoints are defined here on purpose.
	 *
	 * Endpoints are injected per feature using:
	 * `apiSlice.injectEndpoints({ endpoints: ... })`
	 */
	endpoints: () => ({}),
});
