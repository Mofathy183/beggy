import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useSignup from '../useSignup';

const signupTriggerMock = vi.fn();
const unwrapMock = vi.fn();
const useSignupMutationMock = vi.fn();

vi.mock('@features/auth/api', () => ({
	useSignupMutation: () => useSignupMutationMock(),
}));

vi.mock('../useAuthRedirect', () => ({
	default: vi.fn(),
}));

describe('useSignup()', () => {
	beforeEach(() => {
		vi.clearAllMocks();

		useSignupMutationMock.mockReturnValue([
			signupTriggerMock,
			{ isLoading: false },
		]);
	});

	it('submits registration data when signup is called', async () => {
		unwrapMock.mockResolvedValue(undefined);

		signupTriggerMock.mockReturnValue({
			unwrap: unwrapMock,
		});

		const { result } = renderHook(() => useSignup());

		await act(async () => {
			await result.current.signup({
				firstName: 'Mohamed',
				lastName: 'Fathy',
				email: 'test@example.com',
				password: 'Password123!',
				confirmPassword: 'Password123!',
				avatarUrl: null,
				gender: undefined,
				birthDate: undefined,
				country: '',
				city: '',
			});
		});

		expect(signupTriggerMock).toHaveBeenCalledWith(
			expect.objectContaining({
				email: 'test@example.com',
				password: 'Password123!',
			})
		);

		expect(result.current.serverError).toBeNull();
	});

	it('denies signup when already loading', async () => {
		useSignupMutationMock.mockReturnValue([
			signupTriggerMock,
			{ isLoading: true },
		]);

		const { result } = renderHook(() => useSignup());

		await act(async () => {
			await result.current.signup({
				firstName: 'a',
				lastName: 'b',
				email: 'c',
				password: 'd',
				confirmPassword: 'd',
				avatarUrl: null,
				gender: undefined,
				birthDate: undefined,
				country: '',
				city: '',
			});
		});

		expect(signupTriggerMock).not.toHaveBeenCalled();
	});

	it('returns error message when signup fails', async () => {
		unwrapMock.mockRejectedValue({
			body: { message: 'Email already exists' },
		});

		signupTriggerMock.mockReturnValue({
			unwrap: unwrapMock,
		});

		const { result } = renderHook(() => useSignup());

		await act(async () => {
			await result.current.signup({
				firstName: 'x',
				lastName: 'y',
				email: 'z',
				password: 'p',
				confirmPassword: 'p',
				avatarUrl: null,
				gender: undefined,
				birthDate: undefined,
				country: '',
				city: '',
			});
		});

		expect(result.current.serverError).toBe('Email already exists');
	});

	it('returns default error message when error has no message', async () => {
		unwrapMock.mockRejectedValue({});

		signupTriggerMock.mockReturnValue({
			unwrap: unwrapMock,
		});

		const { result } = renderHook(() => useSignup());

		await act(async () => {
			await result.current.signup({
				firstName: 'x',
				lastName: 'y',
				email: 'z',
				password: 'p',
				confirmPassword: 'p',
				avatarUrl: null,
				gender: undefined,
				birthDate: undefined,
				country: '',
				city: '',
			});
		});

		expect(result.current.serverError).toBe('Something went wrong.');
	});

	it('clears previous error before new signup attempt', async () => {
		unwrapMock
			.mockRejectedValueOnce({
				body: { message: 'Email already exists' },
			})
			.mockResolvedValueOnce(undefined);

		signupTriggerMock.mockReturnValue({
			unwrap: unwrapMock,
		});

		const { result } = renderHook(() => useSignup());

		await act(async () => {
			await result.current.signup({
				firstName: 'a',
				lastName: 'b',
				email: 'c',
				password: 'd',
				confirmPassword: 'd',
				avatarUrl: null,
				gender: undefined,
				birthDate: undefined,
				country: '',
				city: '',
			});
		});

		expect(result.current.serverError).toBe('Email already exists');

		await act(async () => {
			await result.current.signup({
				firstName: 'a',
				lastName: 'b',
				email: 'c',
				password: 'd',
				confirmPassword: 'd',
				avatarUrl: null,
				gender: undefined,
				birthDate: undefined,
				country: '',
				city: '',
			});
		});

		expect(result.current.serverError).toBeNull();
	});
});
