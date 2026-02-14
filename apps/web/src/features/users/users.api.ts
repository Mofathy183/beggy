import { apiSlice } from '@/shared/api';
import type {
	SuccessResponse,
	UserDTO,
	ProfileDTO,
	UserFilterInput,
	CreateUserInput,
	ChangeRoleInput,
	UpdateStatusInput,
	EditProfileInput,
} from '@beggy/shared/types';

/**
 * userApi
 *
 * RTK Query slice responsible for all **Users domain** HTTP interactions.
 *
 * @remarks
 * - Represents **administrative/system-level** user management
 * - NOT authentication-related (handled by authApi)
 * - Talks directly to `/users` backend endpoints
 *
 * Design principles:
 * - Thin transport layer (no business logic)
 * - Typed request & response contracts (shared DTOs)
 * - Cache invalidation via tags (User)
 *
 * All endpoints here assume:
 * - Authentication is handled via cookies
 * - Authorization is enforced server-side
 */
export const userApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		/**
		 * Fetch a paginated and/or filtered list of users.
		 *
		 * @route GET /users
		 *
		 * @param params - Filtering, pagination, and ordering parameters
		 *
		 * @remarks
		 * - Intended for admin dashboards and moderation tools
		 * - Backend returns pagination metadata via SuccessResponse.meta
		 * - Cache is tagged as `User` to support broad invalidation
		 */
		getUsers: builder.query<SuccessResponse<UserDTO[]>, UserFilterInput>({
			query: (params) => ({
				url: `/users/`,
				params,
			}),
			providesTags: (result) =>
				result
					? [
							...result.data.map(({ id }) => ({
								type: 'User' as const,
								id,
							})),
							{ type: 'User' as const, id: 'LIST' },
						]
					: [{ type: 'User' as const, id: 'LIST' }],
		}),

		/**
		 * Fetch a single user by ID.
		 *
		 * @route GET /users/:id
		 *
		 * @param id - User unique identifier
		 *
		 * @remarks
		 * - Used by admin detail views
		 * - Returns private/system-level user data
		 */
		getUserById: builder.query<SuccessResponse<UserDTO>, string>({
			query: (id) => ({
				url: `/users/${id}`,
			}),
			providesTags: ['User'],
		}),

		/**
		 * Create a new user account.
		 *
		 * @route POST /users
		 *
		 * @param body - User creation payload
		 *
		 * @remarks
		 * - Admin-only operation
		 * - Returns the created user DTO
		 * - Invalidates User cache to refresh listings
		 */
		createUser: builder.mutation<SuccessResponse<UserDTO>, CreateUserInput>(
			{
				query: (body) => ({
					url: `/users`,
					method: 'POST',
					body,
				}),
				invalidatesTags: ['User'],
			}
		),

		/**
		 * Update a user's profile information.
		 *
		 * @route PATCH /users/:id/profile
		 *
		 * @param id - Target user ID
		 * @param body - Profile update payload
		 *
		 * @remarks
		 * - Operates strictly on Profile domain data
		 * - Does NOT affect authentication, role, or status
		 * - Returns ProfileDTO, not UserDTO
		 */
		updateUserProfile: builder.mutation<
			SuccessResponse<ProfileDTO>,
			{ id: string; body: EditProfileInput }
		>({
			query: ({ id, body }) => ({
				url: `/users/${id}/profile`,
				method: 'PATCH',
				body,
			}),
			invalidatesTags: ['User'],
		}),

		/**
		 * Update a user's operational or verification status.
		 *
		 * @route PATCH /users/:id/status
		 *
		 * @param id - Target user ID
		 * @param body - Status update payload
		 *
		 * @remarks
		 * - Used for moderation and enforcement workflows
		 * - Does NOT delete the user
		 * - Invalidates User cache to refresh admin views
		 */
		updateUserStatus: builder.mutation<
			SuccessResponse<UserDTO>,
			{ id: string; body: UpdateStatusInput }
		>({
			query: ({ id, body }) => ({
				url: `/users/${id}/status`,
				method: 'PATCH',
				body,
			}),
			invalidatesTags: ['User'],
		}),

		/**
		 * Change the role assigned to a user.
		 *
		 * @route PATCH /users/:id/role
		 *
		 * @param id - Target user ID
		 * @param body - Role change payload
		 *
		 * @remarks
		 * - Highly privileged operation
		 * - Role-based access control enforced server-side
		 */
		changeUserRole: builder.mutation<
			SuccessResponse<UserDTO>,
			{ id: string; body: ChangeRoleInput }
		>({
			query: ({ id, body }) => ({
				url: `/users/${id}/role`,
				method: 'PATCH',
				body,
			}),
			invalidatesTags: ['User'],
		}),

		/**
		 * Delete a single user by ID.
		 *
		 * @route DELETE /users/:id
		 *
		 * @remarks
		 * - Destructive, admin-only operation
		 * - Uses no-content semantics (204)
		 * - Invalidates User cache
		 */
		deleteUserById: builder.mutation<void, string>({
			query: (id) => ({
				url: `/users/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: ['User'],
		}),

		/**
		 * Bulk delete users based on filter criteria.
		 *
		 * @route DELETE /users
		 *
		 * @param params - Filter conditions determining which users are deleted
		 *
		 * @remarks
		 * - Admin-only cleanup/moderation operation
		 * - No response body (204)
		 * - Invalidates User cache
		 */
		deleteUsers: builder.mutation<void, UserFilterInput>({
			query: (params) => ({
				url: `/users/`,
				method: 'DELETE',
				params,
			}),
			invalidatesTags: ['User'],
		}),
	}),
	overrideExisting: false,
});

/**
 * Auto-generated React hooks for the Users API.
 *
 * @remarks
 * - Prefer these hooks over calling endpoints manually
 * - Fully typed (input + output)
 * - Integrated with RTK Query cache lifecycle
 */
export const {
	useGetUsersQuery,
	useGetUserByIdQuery,
	useCreateUserMutation,
	useUpdateUserProfileMutation,
	useUpdateUserStatusMutation,
	useChangeUserRoleMutation,
	useDeleteUserByIdMutation,
	useDeleteUsersMutation,
} = userApi;
