import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import useSignup from '../useSignup';

const dispatchMock = vi.fn();
const signupTriggerMock = vi.fn();
const unwrapMock = vi.fn();

const useSignupMutationMock = vi.fn();

vi.mock('@shared/store', () => ({
	useAppDispatch: () => dispatchMock,
}));

vi.mock('@features/auth/api', () => ({
	useSignupMutation: () => useSignupMutationMock(),
	authApi: {
		endpoints: {
			me: {
				initiate: vi.fn(() => ({ type: 'me/refetch' })),
			},
		},
	},
}));

vi.mock('../useAuthRedirect', () => ({
	default: vi.fn(),
}));

describe('useSignup', () => {
	beforeEach(() => {
		vi.clearAllMocks();

		useSignupMutationMock.mockReturnValue([
			signupTriggerMock,
			{
				isLoading: false,
				error: undefined,
				reset: vi.fn(),
			},
		]);
	});

	it('submits registration data when signup is invoked', async () => {
		unwrapMock.mockResolvedValue({ message: 'Account created' });

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
			});
		});

		expect(signupTriggerMock).toHaveBeenCalledWith(
			expect.objectContaining({
				email: 'test@example.com',
				password: 'Password123!',
			})
		);
	});

	it('dispatches a profile refetch after a successful signup', async () => {
		unwrapMock.mockResolvedValue({ message: 'Account created' });

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
			});
		});

		expect(dispatchMock).toHaveBeenCalled();
	});

	it('calls the success callback when signup succeeds', async () => {
		unwrapMock.mockResolvedValue({ message: 'Account created' });

		signupTriggerMock.mockReturnValue({
			unwrap: unwrapMock,
		});

		const onSuccess = vi.fn();

		const { result } = renderHook(() => useSignup());

		await act(async () => {
			await result.current.signup(
				{
					firstName: 'Mohamed',
					lastName: 'Fathy',
					email: 'test@example.com',
					password: 'Password123!',
					confirmPassword: 'Password123!',
				},
				{ onSuccess }
			);
		});

		expect(onSuccess).toHaveBeenCalledWith('Account created');
	});

	it('calls the error callback when signup fails', async () => {
		const httpError = {
			body: { message: 'Email already exists' },
		};

		unwrapMock.mockRejectedValue(httpError);

		signupTriggerMock.mockReturnValue({
			unwrap: unwrapMock,
		});

		const onError = vi.fn();

		const { result } = renderHook(() => useSignup());

		await act(async () => {
			await result.current.signup(
				{
					firstName: 'a',
					lastName: 'b',
					email: 'c',
					password: 'd',
					confirmPassword: 'd',
				},
				{ onError }
			);
		});

		expect(onError).toHaveBeenCalledWith(httpError);
	});

	it('does not trigger signup while the mutation is loading', async () => {
		useSignupMutationMock.mockReturnValue([
			signupTriggerMock,
			{
				isLoading: true,
				error: undefined,
				reset: vi.fn(),
			},
		]);

		const { result } = renderHook(() => useSignup());

		await act(async () => {
			await result.current.signup({
				firstName: 'a',
				lastName: 'b',
				email: 'c',
				password: 'd',
				confirmPassword: 'd',
			});
		});

		expect(signupTriggerMock).not.toHaveBeenCalled();
	});
});
