import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import useOnboarding from '../useOnboarding';

import { useCompleteOnboardingMutation } from '@features/profiles/api';
import { authApi } from '@features/auth/api/auth.api';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@shared/store';

import type { HttpClientError } from '@shared/types';

vi.mock('@features/profiles/api', () => ({
	useCompleteOnboardingMutation: vi.fn(),
}));

vi.mock('@features/auth/api/auth.api', () => ({
	authApi: {
		endpoints: {
			me: {
				initiate: vi.fn(() => ({ type: 'auth/me' })),
			},
		},
	},
}));

vi.mock('next/navigation', () => ({
	useRouter: vi.fn(),
}));

vi.mock('@shared/store', () => ({
	useAppDispatch: vi.fn(),
}));

const mockComplete = vi.fn();
const mockReset = vi.fn();
const mockDispatch = vi.fn();
const mockReplace = vi.fn();

describe('useOnboarding', () => {
	beforeEach(() => {
		vi.clearAllMocks();

		(useCompleteOnboardingMutation as any).mockReturnValue([
			mockComplete,
			{ isLoading: false, error: undefined, reset: mockReset },
		]);

		(useAppDispatch as any).mockReturnValue(mockDispatch);

		(useRouter as any).mockReturnValue({
			replace: mockReplace,
		});
	});

	it('submits onboarding and redirects to the dashboard', async () => {
		mockComplete.mockReturnValue({
			unwrap: vi.fn().mockResolvedValue({
				message: 'Onboarding completed',
			}),
		});

		const { result } = renderHook(() => useOnboarding());

		await act(async () => {
			await result.current.submit({ firstName: 'Jane' } as any);
		});

		expect(mockComplete).toHaveBeenCalledWith({ firstName: 'Jane' });

		expect(mockDispatch).toHaveBeenCalledTimes(1);

		expect(authApi.endpoints.me.initiate).toHaveBeenCalledWith(undefined, {
			forceRefetch: true,
		});

		expect(mockReplace).toHaveBeenCalledWith('/dashboard');
	});

	it('redirects to a custom destination when redirectTo is provided', async () => {
		mockComplete.mockReturnValue({
			unwrap: vi.fn().mockResolvedValue({
				message: 'Onboarding completed',
			}),
		});

		const { result } = renderHook(() =>
			useOnboarding({ redirectTo: '/dashboard/bags' })
		);

		await act(async () => {
			await result.current.submit({ firstName: 'Jane' } as any);
		});

		expect(mockReplace).toHaveBeenCalledWith('/dashboard/bags');
	});

	it('calls the success callback after onboarding submission', async () => {
		const onSuccess = vi.fn();

		mockComplete.mockReturnValue({
			unwrap: vi.fn().mockResolvedValue({
				message: 'Onboarding completed',
			}),
		});

		const { result } = renderHook(() => useOnboarding());

		await act(async () => {
			await result.current.submit({ firstName: 'Jane' } as any, {
				onSuccess,
			});
		});

		expect(onSuccess).toHaveBeenCalledWith('Onboarding completed');
	});

	it('throws an error when onboarding submission fails', async () => {
		const apiError: HttpClientError = {
			statusCode: 400,
			body: { message: 'Invalid input' },
		} as HttpClientError;

		mockComplete.mockReturnValue({
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

	it('skips onboarding and redirects to the dashboard', async () => {
		mockComplete.mockReturnValue({
			unwrap: vi.fn().mockResolvedValue({
				message: 'Skipped',
			}),
		});

		const { result } = renderHook(() => useOnboarding());

		await act(async () => {
			await result.current.skip();
		});

		expect(mockComplete).toHaveBeenCalledWith({});

		expect(mockDispatch).toHaveBeenCalledTimes(1);

		expect(mockReplace).toHaveBeenCalledWith('/dashboard');
	});

	it('calls the error callback when skipping onboarding fails', async () => {
		const apiError = new Error('Network error');
		const onError = vi.fn();

		mockComplete.mockReturnValue({
			unwrap: vi.fn().mockRejectedValue(apiError),
		});

		const { result } = renderHook(() => useOnboarding());

		await act(async () => {
			await result.current.skip({ onError });
		});

		expect(onError).toHaveBeenCalledWith(apiError);
	});

	it('exposes the loading state of the onboarding mutation', () => {
		(useCompleteOnboardingMutation as any).mockReturnValue([
			mockComplete,
			{ isLoading: true, error: undefined, reset: mockReset },
		]);

		const { result } = renderHook(() => useOnboarding());

		expect(result.current.isLoading).toBe(true);
		expect(result.current.isSkipping).toBe(true);
	});

	it('returns null when the mutation error is undefined', () => {
		const { result } = renderHook(() => useOnboarding());

		expect(result.current.error).toBeNull();
	});

	it('returns the mutation error when onboarding fails', () => {
		const apiError = {
			statusCode: 409,
			body: { message: 'Conflict' },
		} as HttpClientError;

		(useCompleteOnboardingMutation as any).mockReturnValue([
			mockComplete,
			{ isLoading: false, error: apiError, reset: mockReset },
		]);

		const { result } = renderHook(() => useOnboarding());

		expect(result.current.error).toEqual(apiError);
	});

	it('exposes the reset function from the mutation', () => {
		const { result } = renderHook(() => useOnboarding());

		result.current.reset();

		expect(mockReset).toHaveBeenCalled();
	});
});
