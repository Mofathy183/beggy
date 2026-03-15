import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useAuthRedirect from '../useAuthRedirect';

const replaceMock = vi.fn();
const useAppSelectorMock = vi.fn();

vi.mock('next/navigation', () => ({
	useRouter: () => ({
		replace: replaceMock,
	}),
}));

vi.mock('@shared/store', () => ({
	useAppSelector: (selector: any) => useAppSelectorMock(selector),
}));

describe('useAuthRedirect', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not redirect when authentication is not initialized', () => {
		useAppSelectorMock.mockReturnValue({
			status: 'authenticated',
			initialized: false,
			profile: null,
		});

		renderHook(() => useAuthRedirect());

		expect(replaceMock).not.toHaveBeenCalled();
	});

	it('does not redirect when the user is unauthenticated', () => {
		useAppSelectorMock.mockReturnValue({
			status: 'unauthenticated',
			initialized: true,
			profile: null,
		});

		renderHook(() => useAuthRedirect());

		expect(replaceMock).not.toHaveBeenCalled();
	});

	it('redirects to onboarding when the user is authenticated without a profile', () => {
		useAppSelectorMock.mockReturnValue({
			status: 'authenticated',
			initialized: true,
			profile: null,
		});

		renderHook(() => useAuthRedirect());

		expect(replaceMock).toHaveBeenCalledWith('/onboarding');
	});

	it('redirects to onboarding when the profile exists but onboarding is incomplete', () => {
		useAppSelectorMock.mockReturnValue({
			status: 'authenticated',
			initialized: true,
			profile: {
				id: '1',
				onboardingCompleted: false,
			},
		});

		renderHook(() => useAuthRedirect());

		expect(replaceMock).toHaveBeenCalledWith('/onboarding');
	});

	it('redirects to the dashboard when onboarding is completed', () => {
		useAppSelectorMock.mockReturnValue({
			status: 'authenticated',
			initialized: true,
			profile: {
				id: '1',
				onboardingCompleted: true,
			},
		});

		renderHook(() => useAuthRedirect());

		expect(replaceMock).toHaveBeenCalledWith('/dashboard');
	});
});
