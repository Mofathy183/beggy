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

describe('useAuthRedirect()', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('denies redirect when auth is not initialized', () => {
		useAppSelectorMock.mockReturnValue({
			status: 'authenticated',
			initialized: false,
		});

		renderHook(() => useAuthRedirect());

		expect(replaceMock).not.toHaveBeenCalled();
	});

	it('denies redirect when user is unauthenticated', () => {
		useAppSelectorMock.mockReturnValue({
			status: 'unauthenticated',
			initialized: true,
		});

		renderHook(() => useAuthRedirect());

		expect(replaceMock).not.toHaveBeenCalled();
	});

	it('allows redirect when authenticated and initialized', () => {
		useAppSelectorMock.mockReturnValue({
			status: 'authenticated',
			initialized: true,
		});

		renderHook(() => useAuthRedirect());

		expect(replaceMock).toHaveBeenCalledTimes(1);
		expect(replaceMock).toHaveBeenCalledWith('/dashboard');
	});
});
