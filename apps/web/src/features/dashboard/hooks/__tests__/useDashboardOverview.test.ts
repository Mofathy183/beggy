import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

import useDashboardOverview from '../useDashboardOverview';

// 🔌 Mock API boundary
const useGetDashboardOverviewQueryMock = vi.fn();

vi.mock('@features/dashboard/api', () => ({
	useGetDashboardOverviewQuery: () => useGetDashboardOverviewQueryMock(),
}));

describe('useDashboardOverview', () => {
	const refetchMock = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns loading state', () => {
		useGetDashboardOverviewQueryMock.mockReturnValue({
			data: undefined,
			isLoading: true,
			isFetching: false,
			isError: false,
			refetch: refetchMock,
		});

		const { result } = renderHook(() => useDashboardOverview());

		expect(result.current.data).toBeUndefined();
		expect(result.current.isLoading).toBe(true);
		expect(result.current.isFetching).toBe(false);
		expect(result.current.isError).toBe(false);
		expect(result.current.isReady).toBe(false);
	});

	it('returns unwrapped data', () => {
		const dto = { totalItems: 10 } as any;

		useGetDashboardOverviewQueryMock.mockReturnValue({
			data: { data: dto }, // SuccessResponse envelope
			isLoading: false,
			isFetching: false,
			isError: false,
			refetch: refetchMock,
		});

		const { result } = renderHook(() => useDashboardOverview());

		expect(result.current.data).toEqual(dto);
		expect(result.current.isReady).toBe(true);
		expect(result.current.isError).toBe(false);
	});

	it('returns error state', () => {
		useGetDashboardOverviewQueryMock.mockReturnValue({
			data: undefined,
			isLoading: false,
			isFetching: false,
			isError: true,
			refetch: refetchMock,
		});

		const { result } = renderHook(() => useDashboardOverview());

		expect(result.current.data).toBeUndefined();
		expect(result.current.isError).toBe(true);
		expect(result.current.isReady).toBe(false);
	});

	it('returns fetching state with existing data', () => {
		const dto = { totalItems: 5 } as any;

		useGetDashboardOverviewQueryMock.mockReturnValue({
			data: { data: dto },
			isLoading: false,
			isFetching: true,
			isError: false,
			refetch: refetchMock,
		});

		const { result } = renderHook(() => useDashboardOverview());

		expect(result.current.data).toEqual(dto);
		expect(result.current.isFetching).toBe(true);
		expect(result.current.isReady).toBe(true);
	});

	it('exposes refetch function', () => {
		useGetDashboardOverviewQueryMock.mockReturnValue({
			data: undefined,
			isLoading: false,
			isFetching: false,
			isError: false,
			refetch: refetchMock,
		});

		const { result } = renderHook(() => useDashboardOverview());

		result.current.refetch();

		expect(refetchMock).toHaveBeenCalled();
	});

	it('returns not ready when data is missing', () => {
		useGetDashboardOverviewQueryMock.mockReturnValue({
			data: { data: undefined },
			isLoading: false,
			isFetching: false,
			isError: false,
			refetch: refetchMock,
		});

		const { result } = renderHook(() => useDashboardOverview());

		expect(result.current.isReady).toBe(false);
	});
});
