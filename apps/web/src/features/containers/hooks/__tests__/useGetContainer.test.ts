import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

import useGetContainer from '../useGetContainer';

// ─── Mock ─────────────────────────────────────────────────────────────────────

const useGetContainerQueryMock = vi.fn();

vi.mock('@features/containers/api', () => ({
	useGetContainerQuery: (id: string, options: { skip: boolean }) =>
		useGetContainerQueryMock(id, options),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const createQueryState = (overrides?: object) => ({
	data: {
		data: { type: 'BAG', data: { id: 'bag-1', name: 'Trail Pack' } },
	},
	isLoading: false,
	isFetching: false,
	isError: false,
	refetch: vi.fn(),
	...overrides,
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useGetContainer', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns container data from API response', () => {
		useGetContainerQueryMock.mockReturnValue(createQueryState());

		const { result } = renderHook(() => useGetContainer('cnt-1', false));

		expect(result.current.container).toEqual({
			type: 'BAG',
			data: { id: 'bag-1', name: 'Trail Pack' },
		});
	});

	it('returns null when API data is not available', () => {
		useGetContainerQueryMock.mockReturnValue(
			createQueryState({ data: undefined })
		);

		const { result } = renderHook(() => useGetContainer('cnt-1', false));

		expect(result.current.container).toBeNull();
	});

	it('returns loading state from the API hook', () => {
		useGetContainerQueryMock.mockReturnValue(
			createQueryState({ isLoading: true })
		);

		const { result } = renderHook(() => useGetContainer('cnt-1', false));

		expect(result.current.isLoading).toBe(true);
	});

	it('returns fetching state from the API hook', () => {
		useGetContainerQueryMock.mockReturnValue(
			createQueryState({ isFetching: true })
		);

		const { result } = renderHook(() => useGetContainer('cnt-1', false));

		expect(result.current.isFetching).toBe(true);
	});

	it('returns error state from the API hook', () => {
		useGetContainerQueryMock.mockReturnValue(
			createQueryState({ isError: true })
		);

		const { result } = renderHook(() => useGetContainer('cnt-1', false));

		expect(result.current.isError).toBe(true);
	});

	it('returns refetch function from the API hook', () => {
		const refetchMock = vi.fn();

		useGetContainerQueryMock.mockReturnValue(
			createQueryState({ refetch: refetchMock })
		);

		const { result } = renderHook(() => useGetContainer('cnt-1', false));

		expect(result.current.refetch).toBe(refetchMock);
	});

	it('calls API hook with the provided containerId', () => {
		useGetContainerQueryMock.mockReturnValue(createQueryState());

		renderHook(() => useGetContainer('cnt-abc', false));

		expect(useGetContainerQueryMock).toHaveBeenCalledWith(
			'cnt-abc',
			expect.objectContaining({ skip: false })
		);
	});

	it('passes skip=true to the API hook when skip is true', () => {
		useGetContainerQueryMock.mockReturnValue(
			createQueryState({ data: undefined, isLoading: false })
		);

		renderHook(() => useGetContainer('cnt-abc', true));

		expect(useGetContainerQueryMock).toHaveBeenCalledWith(
			'cnt-abc',
			expect.objectContaining({ skip: true })
		);
	});
});
