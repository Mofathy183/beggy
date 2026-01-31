import type {
	ProfileDTO,
	PublicProfileDTO,
	SuccessResponse,
	EditProfileInput,
} from '@beggy/shared';
import { apiSlice } from '@shared/api';

/**
 * profileApi
 *
 * RTK Query slice responsible for the **Profile domain**.
 *
 * @remarks
 * - Profiles are distinct from Users:
 *   - User = system/account entity (roles, status, permissions)
 *   - Profile = personal/public-facing information
 *
 * - This API supports:
 *   - Public profile access (read-only)
 *   - Private profile access for the authenticated user
 *   - Self-service profile editing
 *
 * Authentication:
 * - Private endpoints rely on HTTP-only cookies
 * - Authorization is fully enforced server-side
 */
export const profileApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		/**
		 * Fetch a public profile by user ID.
		 *
		 * @route GET /profiles/:userId
		 *
		 * @param userId - Owner user ID of the profile
		 *
		 * @remarks
		 * - Publicly accessible endpoint
		 * - Returns a restricted, public-safe profile DTO
		 * - Intended for:
		 *   - Public user pages
		 *   - Author cards
		 *   - Social/profile previews
		 */
		getPublicProfile: builder.query<
			SuccessResponse<PublicProfileDTO>,
			string
		>({
			query: (userId) => ({
				url: `/profiles/${userId}`,
			}),
			providesTags: ['Profile'],
		}),

		/**
		 * Fetch the authenticated user's private profile.
		 *
		 * @route GET /profiles/me
		 *
		 * @remarks
		 * - Requires authentication
		 * - Returns full private profile data
		 * - Used to bootstrap profile state in:
		 *   - Settings pages
		 *   - Account dashboards
		 */
		getPrivateProfile: builder.query<SuccessResponse<ProfileDTO>, void>({
			query: () => ({
				url: '/profiles/me',
			}),
			providesTags: ['Profile'],
		}),

		/**
		 * Edit the authenticated user's profile.
		 *
		 * @route PATCH /profiles/me
		 *
		 * @param body - Editable profile fields
		 *
		 * @remarks
		 * - Self-service operation only
		 * - Does NOT allow changing:
		 *   - Role
		 *   - Account status
		 *   - Authentication data
		 *
		 * - Invalidates Profile cache to ensure UI consistency
		 */
		editProfile: builder.mutation<
			SuccessResponse<ProfileDTO>,
			EditProfileInput
		>({
			query: (body) => ({
				url: '/profiles/me',
				method: 'PATCH',
				body,
			}),
			invalidatesTags: ['Profile'],
		}),
	}),
	overrideExisting: false,
});

/**
 * Auto-generated React hooks for Profile API endpoints.
 *
 * @remarks
 * - Prefer these hooks over manual dispatching
 * - Fully typed with shared DTOs
 * - Integrated with RTK Query caching & invalidation
 */
export const {
	useEditProfileMutation,
	useGetPrivateProfileQuery,
	useGetPublicProfileQuery,
} = profileApi;
