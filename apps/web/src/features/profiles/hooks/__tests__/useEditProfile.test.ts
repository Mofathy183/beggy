import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import useEditProfile from '../useEditProfile';
import { useEditProfileMutation } from '@features/profiles/api';

import type { ProfileDTO } from '@beggy/shared/types';
import type { HttpClientError } from '@shared/types';

vi.mock('@features/profiles/api');

const mockEdit = vi.fn();
const mockReset = vi.fn();

const baseProfile: ProfileDTO = {
	id: '1',
	userId: '1',
	firstName: 'John',
	lastName: 'Doe',
	avatarUrl: null,
	gender: null,
	birthDate: null,
	onboardingCompleted: false,
	country: null,
	city: null,
	createdAt: '2024-01-01T00:00:00.000Z',
	updatedAt: '2024-01-01T00:00:00.000Z',
};

beforeEach(() => {
	vi.clearAllMocks();
});

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe('useEditProfile', () => {
	it('exposes the loading state of the mutation', () => {
		(useEditProfileMutation as any).mockReturnValue([
			mockEdit,
			{ isLoading: true, error: undefined, reset: mockReset },
		]);

		const { result } = renderHook(() => useEditProfile());

		expect(result.current.isLoading).toBe(true);
	});

	it('updates the profile and calls onSuccess when the mutation succeeds', async () => {
		const onSuccess = vi.fn();

		mockEdit.mockReturnValue({
			unwrap: vi.fn().mockResolvedValue({
				data: baseProfile,
				message: 'Profile updated',
			}),
		});
		(useEditProfileMutation as any).mockReturnValue([
			mockEdit,
			{ isLoading: false, error: undefined, reset: mockReset },
		]);

		const { result } = renderHook(() => useEditProfile({ onSuccess }));

		await act(async () => {
			await result.current.submit({ firstName: 'Jane' } as any);
		});

		expect(mockEdit).toHaveBeenCalledWith({ firstName: 'Jane' });

		expect(onSuccess).toHaveBeenCalledWith(baseProfile, 'Profile updated');
	});

	it('throws an error when the profile update fails', async () => {
		const apiError: HttpClientError = {
			statusCode: 409,
			body: { message: 'Conflict' },
		} as HttpClientError;

		mockEdit.mockReturnValue({
			unwrap: vi.fn().mockRejectedValue(apiError),
		});
		(useEditProfileMutation as any).mockReturnValue([
			mockEdit,
			{ isLoading: false, error: apiError, reset: mockReset },
		]);

		const { result } = renderHook(() => useEditProfile());

		await expect(
			act(async () => {
				await result.current.submit({ firstName: 'Jane' } as any);
			})
		).rejects.toEqual(apiError);
	});

	it('returns null when the mutation error is undefined', () => {
		(useEditProfileMutation as any).mockReturnValue([
			mockEdit,
			{ isLoading: false, error: undefined, reset: mockReset },
		]);

		const { result } = renderHook(() => useEditProfile());

		expect(result.current.error).toBeNull();
	});

	it('returns the mutation error when the mutation fails', () => {
		const apiError = {
			statusCode: 400,
			body: { message: 'Invalid input' },
		} as HttpClientError;

		(useEditProfileMutation as any).mockReturnValue([
			mockEdit,
			{ isLoading: false, error: apiError, reset: mockReset },
		]);

		const { result } = renderHook(() => useEditProfile());

		expect(result.current.error).toEqual(apiError);
	});

	it('exposes the reset function from the mutation', () => {
		(useEditProfileMutation as any).mockReturnValue([
			mockEdit,
			{ isLoading: false, error: undefined, reset: mockReset },
		]);

		const { result } = renderHook(() => useEditProfile());

		result.current.reset();

		expect(mockReset).toHaveBeenCalled();
	});
});
