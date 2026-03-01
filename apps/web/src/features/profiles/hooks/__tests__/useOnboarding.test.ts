import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useOnboarding from '../useOnboarding';
import { useEditProfileMutation } from '@features/profiles/api';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@shared/store';
import type { HttpClientError } from '@shared/types';

vi.mock('@features/profiles/api');
vi.mock('next/navigation');
vi.mock('@shared/store');

const mockEdit = vi.fn();
const mockReset = vi.fn();
const mockDispatch = vi.fn();
const mockReplace = vi.fn();

describe('useOnboarding', () => {
	beforeEach(() => {
		vi.clearAllMocks();

		(useEditProfileMutation as any).mockReturnValue([
			mockEdit,
			{ isLoading: false, error: undefined, reset: mockReset },
		]);

		(useAppDispatch as any).mockReturnValue(mockDispatch);

		(useRouter as any).mockReturnValue({
			replace: mockReplace,
		});
	});

	it('redirects to dashboard when update succeeds', async () => {
		mockEdit.mockReturnValue({
			unwrap: vi.fn().mockResolvedValue({}),
		});

		const { result } = renderHook(() => useOnboarding());

		await act(async () => {
			await result.current.submit({ firstName: 'Jane' } as any);
		});

		expect(mockEdit).toHaveBeenCalledWith({ firstName: 'Jane' });

		expect(mockDispatch).toHaveBeenCalledTimes(1);

		const dispatchedArg = (mockDispatch.mock as any).calls[0][0];
		expect(typeof dispatchedArg).toBe('function');

		expect(mockReplace).toHaveBeenCalledWith('/dashboard');
	});

	it('redirects to custom destination when redirectTo is provided', async () => {
		mockEdit.mockReturnValue({
			unwrap: vi.fn().mockResolvedValue({}),
		});

		const { result } = renderHook(() =>
			useOnboarding({ redirectTo: '/dashboard/bags' })
		);

		await act(async () => {
			await result.current.submit({ firstName: 'Jane' } as any);
		});

		expect(mockReplace).toHaveBeenCalledWith('/dashboard/bags');
	});

	it('throws when update fails', async () => {
		const apiError: HttpClientError = {
			statusCode: 400,
			body: { message: 'Invalid input' },
		} as HttpClientError;

		mockEdit.mockReturnValue({
			unwrap: vi.fn().mockRejectedValue(apiError),
		});

		const { result } = renderHook(() => useOnboarding());

		await expect(
			act(async () => {
				await result.current.submit({ firstName: 'Jane' } as any);
			})
		).rejects.toEqual(apiError);

		expect(mockDispatch).not.toHaveBeenCalled();
		expect(mockReplace).not.toHaveBeenCalled();
	});

	it('returns loading state', () => {
		(useEditProfileMutation as any).mockReturnValue([
			mockEdit,
			{ isLoading: true, error: undefined, reset: mockReset },
		]);

		const { result } = renderHook(() => useOnboarding());

		expect(result.current.isLoading).toBe(true);
	});

	it('returns null when error is undefined', () => {
		const { result } = renderHook(() => useOnboarding());

		expect(result.current.error).toBeNull();
	});

	it('returns error when update fails', () => {
		const apiError = {
			statusCode: 409,
			body: { message: 'Conflict' },
		} as HttpClientError;

		(useEditProfileMutation as any).mockReturnValue([
			mockEdit,
			{ isLoading: false, error: apiError, reset: mockReset },
		]);

		const { result } = renderHook(() => useOnboarding());

		expect(result.current.error).toEqual(apiError);
	});

	it('returns reset function', () => {
		const { result } = renderHook(() => useOnboarding());

		result.current.reset();

		expect(mockReset).toHaveBeenCalled();
	});
});
