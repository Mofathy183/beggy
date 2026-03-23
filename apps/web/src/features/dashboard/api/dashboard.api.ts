import type {
	DashboardOverviewDto,
	SuccessResponse,
} from '@beggy/shared/types';
import { apiSlice, TagTypes } from '@shared/api';

/**
 * @description
 * RTK Query endpoints for dashboard-related data.
 *
 * @remarks
 * Centralizes dashboard data fetching and cache management.
 * Uses tag-based invalidation to keep overview data in sync with mutations.
 */
export const dashboardApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		/**
		 * @description
		 * Fetches the aggregated dashboard overview data required to render the main dashboard.
		 *
		 * @returns A wrapped success response containing dashboard metrics and summary data.
		 *
		 * @remarks
		 * - Cached under the `DASHBOARD` tag.
		 * - Should be invalidated by any mutation that affects dashboard aggregates.
		 */
		getDashboardOverview: builder.query<
			SuccessResponse<DashboardOverviewDto>,
			void
		>({
			query: () => '/dashboard',
			providesTags: [TagTypes.DASHBOARD],
		}),
	}),
});

/**
 * @description
 * React hook to access dashboard overview data.
 *
 * @remarks
 * - Automatically triggers fetch on mount.
 * - Leverages RTK Query caching and revalidation.
 * - Exposes loading, error, and data states for UI consumption.
 */
export const { useGetDashboardOverviewQuery } = dashboardApi;
