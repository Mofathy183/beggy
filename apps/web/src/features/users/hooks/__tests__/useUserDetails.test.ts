import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

vi.mock('../../api/user.api');

import { useGetUserByIdQuery } from '../../api/user.api';
import useUserDetails from '../useUserDetails';

describe('useUserDetails()', () => {
	const mockRefetch = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('skips the query when id is undefined', () => {
		(useGetUserByIdQuery as any).mockReturnValue({
			data: undefined,
			isLoading: false,
			isFetching: false,
			error: undefined,
			refetch: mockRefetch,
		});

		renderHook(() => useUserDetails(undefined));

		expect(useGetUserByIdQuery).toHaveBeenCalledWith('', {
			skip: true,
		});
	});

	it('calls the query with id when provided', () => {
		(useGetUserByIdQuery as any).mockReturnValue({
			data: undefined,
			isLoading: false,
			isFetching: false,
			error: undefined,
			refetch: mockRefetch,
		});

		renderHook(() => useUserDetails('user-1'));

		expect(useGetUserByIdQuery).toHaveBeenCalledWith('user-1', {
			skip: false,
		});
	});

	it('returns undefined user when data is undefined', () => {
		(useGetUserByIdQuery as any).mockReturnValue({
			data: undefined,
			isLoading: false,
			isFetching: false,
			error: undefined,
			refetch: mockRefetch,
		});

		const { result } = renderHook(() => useUserDetails('user-1'));

		expect(result.current.user).toBeUndefined();
	});

	it('returns user when query data is available', () => {
		const mockUser = { id: 'user-1' };

		(useGetUserByIdQuery as any).mockReturnValue({
			data: { data: mockUser },
			isLoading: false,
			isFetching: false,
			error: undefined,
			refetch: mockRefetch,
		});

		const { result } = renderHook(() => useUserDetails('user-1'));

		expect(result.current.user).toEqual(mockUser);
	});

	it('returns loading and fetching state', () => {
		(useGetUserByIdQuery as any).mockReturnValue({
			data: undefined,
			isLoading: true,
			isFetching: true,
			error: undefined,
			refetch: mockRefetch,
		});

		const { result } = renderHook(() => useUserDetails('user-1'));

		expect(result.current.isLoading).toBe(true);
		expect(result.current.isFetching).toBe(true);
	});

	it('returns error when query fails', () => {
		const mockError = new Error('failed');

		(useGetUserByIdQuery as any).mockReturnValue({
			data: undefined,
			isLoading: false,
			isFetching: false,
			error: mockError,
			refetch: mockRefetch,
		});

		const { result } = renderHook(() => useUserDetails('user-1'));

		expect(result.current.error).toBe(mockError);
	});

	it('returns refetch function', () => {
		(useGetUserByIdQuery as any).mockReturnValue({
			data: undefined,
			isLoading: false,
			isFetching: false,
			error: undefined,
			refetch: mockRefetch,
		});

		const { result } = renderHook(() => useUserDetails('user-1'));

		result.current.refetch();

		expect(mockRefetch).toHaveBeenCalled();
	});
});
