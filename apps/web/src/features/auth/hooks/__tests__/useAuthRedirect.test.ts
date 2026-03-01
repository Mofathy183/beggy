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

	it('does not redirect when auth is not initialized', () => {
		useAppSelectorMock.mockReturnValue({
			status: 'authenticated',
			initialized: false,
			profile: null,
		});

		renderHook(() => useAuthRedirect());

		expect(replaceMock).not.toHaveBeenCalled();
	});

	it('does not redirect when user is unauthenticated', () => {
		useAppSelectorMock.mockReturnValue({
			status: 'unauthenticated',
			initialized: true,
			profile: null,
		});

		renderHook(() => useAuthRedirect());

		expect(replaceMock).not.toHaveBeenCalled();
	});

	it('redirects to onboarding when authenticated without profile', () => {
		useAppSelectorMock.mockReturnValue({
			status: 'authenticated',
			initialized: true,
			profile: null,
		});

		renderHook(() => useAuthRedirect());

		expect(replaceMock).toHaveBeenCalledWith('/onboarding');
	});

	it('redirects to dashboard when authenticated with profile', () => {
		useAppSelectorMock.mockReturnValue({
			status: 'authenticated',
			initialized: true,
			profile: { id: '1' },
		});

		renderHook(() => useAuthRedirect());

		expect(replaceMock).toHaveBeenCalledWith('/dashboard');
	});
});
