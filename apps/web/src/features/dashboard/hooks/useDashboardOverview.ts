// src/features/dashboard/hooks/useDashboardOverview.ts
import { useGetDashboardOverviewQuery } from '@features/dashboard/api';
import type { DashboardOverviewDto } from '@beggy/shared/types';

export interface UseDashboardOverviewResult {
	/**
	 * Unwrapped dashboard payload.
	 *
	 * @remarks
	 * - `undefined` while loading or if the request fails.
	 * - Consumers should rely on `isReady` for safe rendering.
	 */
	data: DashboardOverviewDto | undefined;

	isLoading: boolean;
	isFetching: boolean;
	isError: boolean;

	/**
	 * Indicates that data is successfully loaded and safe to consume.
	 *
	 * @remarks
	 * Abstracts multiple flags into a single semantic signal for UI logic.
	 */
	isReady: boolean;

	/**
	 * Triggers a manual refetch of the dashboard data.
	 *
	 * @remarks
	 * Typically passed to retry actions (e.g. error states).
	 */
	refetch: () => void;
}

/**
 * @description
 * Provides dashboard overview data with a simplified, UI-friendly contract.
 *
 * @remarks
 * - Hides the API response envelope (`SuccessResponse`) from consumers.
 * - Centralizes derived state (`isReady`) to avoid repeated logic in components.
 * - Acts as a stable boundary between API layer and UI.
 */
const useDashboardOverview = (): UseDashboardOverviewResult => {
	const {
		data: response,
		isLoading,
		isFetching,
		isError,
		refetch,
	} = useGetDashboardOverviewQuery();

	/**
	 * Extracts the actual payload from the API response.
	 * Returns `undefined` if the response has not been resolved yet.
	 */
	const data = response?.data;

	return {
		data,
		isLoading,
		isFetching,
		isError,
		isReady: !isLoading && !isError && data !== undefined,
		refetch,
	};
};

export default useDashboardOverview;
