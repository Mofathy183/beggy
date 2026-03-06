import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

import useItemDetails from '../useItemDetails';
import { useGetItemByIdQuery } from '@features/items/api';

import type { ItemDTO } from '@beggy/shared/types';

vi.mock('@features/items/api', () => ({
	useGetItemByIdQuery: vi.fn(),
}));

const mockUseGetItemByIdQuery = vi.mocked(useGetItemByIdQuery);

const mockReturnValue = {
	data: { data: undefined },
	isLoading: false,
	isFetching: false,
	error: undefined,
	refetch: vi.fn(),
};

describe('useItemDetails()', () => {
	it('returns loading state when query is loading', () => {
		mockUseGetItemByIdQuery.mockReturnValue({
			...mockReturnValue,
			isLoading: true,
		} as any);
		const { result } = renderHook(() => useItemDetails('123'));

		expect(result.current.isLoading).toBe(true);
		expect(result.current.item).toBeUndefined();
		expect(result.current.notFound).toBe(false);
	});

	it('returns item when query succeeds', () => {
		const item: ItemDTO = { id: '123' } as ItemDTO;

		mockUseGetItemByIdQuery.mockReturnValue({
			...mockReturnValue,
			data: { data: item },
		} as any);

		const { result } = renderHook(() => useItemDetails('123'));

		expect(result.current.item).toEqual(item);
		expect(result.current.isLoading).toBe(false);
		expect(result.current.notFound).toBe(false);
	});

	it('returns notFound when query succeeds but item is missing', () => {
		mockUseGetItemByIdQuery.mockReturnValue(mockReturnValue as any);

		const { result } = renderHook(() => useItemDetails('123'));

		expect(result.current.item).toBeUndefined();
		expect(result.current.notFound).toBe(true);
	});

	it('returns error when query fails', () => {
		const error = new Error('Request failed');

		mockUseGetItemByIdQuery.mockReturnValue({
			...mockReturnValue,
			error,
		} as any);

		const { result } = renderHook(() => useItemDetails('123'));

		expect(result.current.error).toBe(error);
		expect(result.current.notFound).toBe(false);
	});

	it('skips query when id is undefined', () => {
		mockUseGetItemByIdQuery.mockReturnValue(mockReturnValue as any);

		renderHook(() => useItemDetails(undefined));

		expect(mockUseGetItemByIdQuery).toHaveBeenCalledWith('', {
			skip: true,
		});
	});
});
