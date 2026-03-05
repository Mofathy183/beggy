import { apiSlice, TagTypes } from '@shared/api';
import { clearPermissions, setPermissions } from '@shared/store/ability';
import { setAuthenticated, setUnauthenticated } from '../store/auth.slice';
import type {
	SuccessResponse,
	SignUpInput,
	LoginInput,
	AuthMeDTO,
} from '@beggy/shared/types';

/**
 * authApi
 *
 * RTK Query slice responsible for **authentication & session lifecycle**.
 *
 * @remarks
 * - Authentication is cookie-based (HTTP-only cookies)
 * - No tokens are stored in Redux or localStorage
 * - CSRF protection is enforced server-side
 *
 * This API handles:
 * - Account creation
 * - Login / logout
 * - Session introspection
 * - Token refresh
 * - CSRF token bootstrapping
 */
export const authApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		/**
		 * Create a new user account.
		 *
		 * @route POST /auth/signup
		 *
		 * @param body - Signup payload (email, password, etc.)
		 *
		 * @remarks
		 * - Does NOT return user data directly
		 * - Successful signup usually implies:
		 *   - Session cookie issued
		 *   - Client should re-fetch `/auth/me`
		 */
		signup: builder.mutation<SuccessResponse<null>, SignUpInput>({
			query: (body) => ({
				url: '/auth/signup',
				method: 'POST',
				body,
			}),
			invalidatesTags: [TagTypes.AUTH],
		}),

		/**
		 * Authenticate an existing user.
		 *
		 * @route POST /auth/login
		 *
		 * @param body - Login credentials
		 *
		 * @remarks
		 * - Issues authentication cookies on success
		 * - Client should rely on `/auth/me` for user state
		 * - Invalidates Auth cache to trigger refetch
		 */
		login: builder.mutation<SuccessResponse<null>, LoginInput>({
			query: (body) => ({
				url: '/auth/login',
				method: 'POST',
				body,
			}),
			invalidatesTags: [TagTypes.AUTH],
		}),

		/**
		 * Fetch the currently authenticated user.
		 *
		 * @route GET /auth/me
		 *
		 * @remarks
		 * Fetches the currently authenticated user.
		 *
		 * Responsibilities:
		 * - Hydrate auth slice
		 * - Hydrate ability slice
		 * - Transition auth status
		 *
		 * This endpoint is called:
		 * - On app bootstrap
		 * - After login/signup
		 * - After refresh token rotation
		 */
		me: builder.query<SuccessResponse<AuthMeDTO>, void>({
			query: () => '/auth/me',
			providesTags: [TagTypes.AUTH],

			/**
			 * onQueryStarted
			 *
			 * This is where we synchronize
			 * RTK Query server state → Redux UI state.
			 *
			 * Why here?
			 * - Centralized
			 * - No duplication
			 * - No manual fetch
			 * - No bootstrap thunk
			 */
			async onQueryStarted(_, { dispatch, queryFulfilled }) {
				try {
					const { data } = await queryFulfilled;
					const payload = data.data;

					// Hydrate identity
					dispatch(setAuthenticated(payload));

					// Hydrate authorization
					dispatch(
						setPermissions({
							permissions: payload.permissions,
						})
					);
				} catch {
					// 401 or network failure
					dispatch(setUnauthenticated());
					dispatch(clearPermissions());
				}
			},
		}),

		/**
		 * Logout the current user.
		 *
		 * @route DELETE /auth/logout
		 *
		 * @remarks
		 * - Clears authentication cookies server-side
		 * - Client should:
		 *   - Reset local state
		 *   - Redirect to public routes
		 */
		logout: builder.mutation<void, void>({
			query: () => ({
				url: '/auth/logout',
				method: 'DELETE',
			}),
			invalidatesTags: [TagTypes.AUTH],
		}),

		/**
		 * Refresh authentication tokens.
		 *
		 * @route POST /auth/refresh-token
		 *
		 * @remarks
		 * - Used internally when access token expires
		 * - Relies on refresh token stored in cookies
		 * - Typically triggered automatically via baseQuery
		 */
		refreshToken: builder.mutation<SuccessResponse<null>, void>({
			query: () => ({
				url: '/auth/refresh-token',
				method: 'POST',
			}),
		}),

		/**
		 * Retrieve a CSRF token for protected requests.
		 *
		 * @route GET /auth/csrf-token
		 *
		 * @remarks
		 * - Used before sensitive mutations
		 * - Token is usually injected into headers or forms
		 * - Complements cookie-based authentication
		 */
		csrfToken: builder.query<SuccessResponse<{ csrfToken: string }>, void>({
			query: () => '/auth/csrf-token',
		}),
	}),
	overrideExisting: false,
});

/**
 * Auto-generated React hooks for Auth API endpoints.
 *
 * @remarks
 * - Prefer `useMeQuery` as the single auth source of truth
 * - Avoid duplicating auth state in Redux slices
 * - These hooks integrate caching, retries, and invalidation
 */
export const {
	useSignupMutation,
	useLoginMutation,
	useLogoutMutation,
	useRefreshTokenMutation,
	useMeQuery,
	useCsrfTokenQuery,
} = authApi;
