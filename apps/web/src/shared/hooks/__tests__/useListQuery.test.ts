import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import useListQuery from '../useListQuery';

vi.mock('@shared/utils/listQuery.utils', () => ({
	buildListParams: vi.fn((params) => params),
}));

type Item = { id: number };
type Filters = { q?: string };
type OrderBy = { field: string; direction: 'asc' | 'desc' };

const createMockUseQuery = (overrides = {}) =>
	vi.fn(() => ({
		data: { data: [], meta: null },
		isLoading: false,
		isFetching: false,
		refetch: vi.fn(),
		...overrides,
	}));

describe('useListQuery()', () => {
	let useQuery: any;
	beforeEach(() => {
		vi.clearAllMocks();
		useQuery = createMockUseQuery();
	});

	it('initializes pagination, filters, and orderBy with default values', () => {
		const { result } = renderHook(() =>
			useListQuery<Item, Filters, OrderBy>({ useQuery })
		);

		expect(result.current.pagination).toEqual({ page: 1, limit: 10 });
		expect(result.current.filters).toEqual({});
		expect(result.current.orderBy).toBeNull();
		expect(useQuery).toHaveBeenCalledTimes(1);
	});

	it('resets page to 1 when the page size changes', () => {
		const { result } = renderHook(() =>
			useListQuery<Item, Filters, OrderBy>({ useQuery })
		);

		act(() => {
			result.current.setPagination({ page: 3 });
		});

		act(() => {
			result.current.setPagination({ limit: 50 });
		});

		expect(result.current.pagination).toEqual({
			page: 1,
			limit: 50,
		});
	});

	it('resets pagination when filters change', () => {
		const { result } = renderHook(() =>
			useListQuery<Item, Filters, OrderBy>({ useQuery })
		);

		act(() => {
			result.current.setPagination({ page: 5 });
		});

		act(() => {
			result.current.setFilters({ q: 'hello' });
		});

		expect(result.current.pagination).toEqual({ page: 1, limit: 10 });
		expect(result.current.filters).toEqual({ q: 'hello' });
	});

	it('resets pagination when sorting changes', () => {
		const { result } = renderHook(() =>
			useListQuery<Item, Filters, OrderBy>({ useQuery })
		);

		act(() => {
			result.current.setPagination({ page: 4 });
		});

		act(() => {
			result.current.setOrderBy({ field: 'name', direction: 'asc' });
		});

		expect(result.current.pagination).toEqual({ page: 1, limit: 10 });
		expect(result.current.orderBy).toEqual({
			field: 'name',
			direction: 'asc',
		});
	});

	it('derives hasData and isEmpty from the query result', () => {
		useQuery = createMockUseQuery({
			data: { data: [{ id: '1' }], meta: null },
		});
		const { result } = renderHook(() =>
			useListQuery<Item, Filters, OrderBy>({ useQuery })
		);

		expect(result.current.hasData).toBe(true);
		expect(result.current.isEmpty).toBe(false);
	});

	it('restores initial filters and pagination when reset is called', () => {
		const { result } = renderHook(() =>
			useListQuery<Item, Filters, OrderBy>({
				useQuery,
				initialFilters: { q: 'init' },
				initialPagination: { page: 2, limit: 20 },
			})
		);

		act(() => {
			result.current.setFilters({ q: 'changed' });
		});

		act(() => {
			result.current.reset();
		});

		expect(result.current.filters).toEqual({ q: 'init' });
		expect(result.current.pagination).toEqual({ page: 2, limit: 20 });
	});
});
