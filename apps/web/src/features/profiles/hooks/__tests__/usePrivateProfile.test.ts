import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import usePrivateProfile from '../usePrivateProfile';
import { useGetPrivateProfileQuery } from '@features/profiles/api';
import type { ProfileDTO } from '@beggy/shared/types';
import type { HttpClientError } from '@shared/types';

vi.mock('@features/profiles/api');

const mockRefetch = vi.fn();

const baseProfile: ProfileDTO = {
	id: '1',
	userId: '1',
	firstName: 'John',
	lastName: 'Doe',
	avatarUrl: null,
	gender: null,
	birthDate: null,
	country: null,
	city: null,
	createdAt: '2024-01-01T00:00:00.000Z',
	updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('usePrivateProfile', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns profile when data is available', () => {
		(useGetPrivateProfileQuery as any).mockReturnValue({
			data: { data: baseProfile },
			isLoading: false,
			isFetching: false,
			isError: false,
			error: undefined,
			refetch: mockRefetch,
		});

		const { result } = renderHook(() => usePrivateProfile());

		expect(result.current.profile).toEqual(baseProfile);
		expect(result.current.isLoading).toBe(false);
		expect(result.current.isFetching).toBe(false);
		expect(result.current.isError).toBe(false);
	});

	it('returns null when loading with no data', () => {
		(useGetPrivateProfileQuery as any).mockReturnValue({
			data: undefined,
			isLoading: true,
			isFetching: true,
			isError: false,
			error: undefined,
			refetch: mockRefetch,
		});

		const { result } = renderHook(() => usePrivateProfile());

		expect(result.current.profile).toBeNull();
		expect(result.current.isLoading).toBe(true);
		expect(result.current.isFetching).toBe(true);
	});

	it('returns null when request fails', () => {
		const apiError: HttpClientError = {
			statusCode: 500,
			body: { message: 'Server error' },
		} as HttpClientError;

		(useGetPrivateProfileQuery as any).mockReturnValue({
			data: undefined,
			isLoading: false,
			isFetching: false,
			isError: true,
			error: apiError,
			refetch: mockRefetch,
		});

		const { result } = renderHook(() => usePrivateProfile());

		expect(result.current.profile).toBeNull();
		expect(result.current.isError).toBe(true);
		expect(result.current.error).toEqual(apiError);
	});

	it('returns null when error is undefined', () => {
		(useGetPrivateProfileQuery as any).mockReturnValue({
			data: undefined,
			isLoading: false,
			isFetching: false,
			isError: false,
			error: undefined,
			refetch: mockRefetch,
		});

		const { result } = renderHook(() => usePrivateProfile());

		expect(result.current.error).toBeNull();
	});

	it('returns refetch function', () => {
		(useGetPrivateProfileQuery as any).mockReturnValue({
			data: { data: baseProfile },
			isLoading: false,
			isFetching: false,
			isError: false,
			error: undefined,
			refetch: mockRefetch,
		});

		const { result } = renderHook(() => usePrivateProfile());

		result.current.refetch();

		expect(mockRefetch).toHaveBeenCalled();
	});
});
