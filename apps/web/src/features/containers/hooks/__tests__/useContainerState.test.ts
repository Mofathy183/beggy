import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

import useContainerState from '../useContainerState';

// ─── Mock ─────────────────────────────────────────────────────────────────────

const useGetContainerStateQueryMock = vi.fn();

vi.mock('@features/containers/api', () => ({
	useGetContainerStateQuery: (id: string) =>
		useGetContainerStateQueryMock(id),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const createQueryState = (overrides?: object) => ({
	data: {
		data: { containerId: 'container-1', items: [] },
	},
	isLoading: false,
	isFetching: false,
	isError: false,
	refetch: vi.fn(),
	...overrides,
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useContainerState', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns container state from API data', () => {
		useGetContainerStateQueryMock.mockReturnValue(createQueryState());

		const { result } = renderHook(() => useContainerState('container-1'));

		expect(result.current.containerState).toEqual({
			containerId: 'container-1',
			items: [],
		});
	});

	it('returns null when API data is not available', () => {
		useGetContainerStateQueryMock.mockReturnValue(
			createQueryState({ data: undefined })
		);

		const { result } = renderHook(() => useContainerState('container-1'));

		expect(result.current.containerState).toBeNull();
	});

	it('returns loading state from the API hook', () => {
		useGetContainerStateQueryMock.mockReturnValue(
			createQueryState({ isLoading: true })
		);

		const { result } = renderHook(() => useContainerState('container-1'));

		expect(result.current.isLoading).toBe(true);
	});

	it('returns fetching state from the API hook', () => {
		useGetContainerStateQueryMock.mockReturnValue(
			createQueryState({ isFetching: true })
		);

		const { result } = renderHook(() => useContainerState('container-1'));

		expect(result.current.isFetching).toBe(true);
	});

	it('returns error state from the API hook', () => {
		useGetContainerStateQueryMock.mockReturnValue(
			createQueryState({ isError: true })
		);

		const { result } = renderHook(() => useContainerState('container-1'));

		expect(result.current.isError).toBe(true);
	});

	it('returns refetch function from the API hook', () => {
		const refetchMock = vi.fn();

		useGetContainerStateQueryMock.mockReturnValue(
			createQueryState({ refetch: refetchMock })
		);

		const { result } = renderHook(() => useContainerState('container-1'));

		expect(result.current.refetch).toBe(refetchMock);
	});

	it('calls API hook with the provided containerId', () => {
		useGetContainerStateQueryMock.mockReturnValue(createQueryState());

		renderHook(() => useContainerState('container-123'));

		expect(useGetContainerStateQueryMock).toHaveBeenCalledWith(
			'container-123'
		);
	});
});
