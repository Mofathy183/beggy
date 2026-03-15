import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import useLogin from '../useLogin';

const dispatchMock = vi.fn();
const loginTriggerMock = vi.fn();
const unwrapMock = vi.fn();

const useLoginMutationMock = vi.fn();

vi.mock('@shared/store', () => ({
	useAppDispatch: () => dispatchMock,
}));

vi.mock('@features/auth/api', () => ({
	useLoginMutation: () => useLoginMutationMock(),
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

describe('useLogin', () => {
	beforeEach(() => {
		vi.clearAllMocks();

		useLoginMutationMock.mockReturnValue([
			loginTriggerMock,
			{
				isLoading: false,
				error: undefined,
				reset: vi.fn(),
			},
		]);
	});

	it('triggers the login request with the provided credentials', async () => {
		unwrapMock.mockResolvedValue({ message: 'Welcome back!' });

		loginTriggerMock.mockReturnValue({
			unwrap: unwrapMock,
		});

		const { result } = renderHook(() => useLogin());

		await act(async () => {
			await result.current.login({
				email: 'test@example.com',
				password: 'Password123!',
				rememberMe: true,
			});
		});

		expect(loginTriggerMock).toHaveBeenCalledWith({
			email: 'test@example.com',
			password: 'Password123!',
			rememberMe: true,
		});
	});

	it('refetches the auth profile after a successful login', async () => {
		unwrapMock.mockResolvedValue({ message: 'Welcome back!' });

		loginTriggerMock.mockReturnValue({
			unwrap: unwrapMock,
		});

		const { result } = renderHook(() => useLogin());

		await act(async () => {
			await result.current.login({
				email: 'test@example.com',
				password: 'Password123!',
				rememberMe: true,
			});
		});

		expect(dispatchMock).toHaveBeenCalled();
	});

	it('calls the success callback when login succeeds', async () => {
		unwrapMock.mockResolvedValue({ message: 'Welcome back!' });

		loginTriggerMock.mockReturnValue({
			unwrap: unwrapMock,
		});

		const onSuccess = vi.fn();

		const { result } = renderHook(() => useLogin());

		await act(async () => {
			await result.current.login(
				{
					email: 'test@example.com',
					password: 'Password123!',
					rememberMe: true,
				},
				{ onSuccess }
			);
		});

		expect(onSuccess).toHaveBeenCalledWith('Welcome back!');
	});

	it('calls the error callback when login fails', async () => {
		const httpError = {
			body: { message: 'Invalid credentials' },
		};

		unwrapMock.mockRejectedValue(httpError);

		loginTriggerMock.mockReturnValue({
			unwrap: unwrapMock,
		});

		const onError = vi.fn();

		const { result } = renderHook(() => useLogin());

		await act(async () => {
			await result.current.login(
				{
					email: 'wrong@example.com',
					password: 'wrong',
					rememberMe: false,
				},
				{ onError }
			);
		});

		expect(onError).toHaveBeenCalledWith(httpError);
	});

	it('does not trigger a login request while the mutation is loading', async () => {
		useLoginMutationMock.mockReturnValue([
			loginTriggerMock,
			{
				isLoading: true,
				error: undefined,
				reset: vi.fn(),
			},
		]);

		const { result } = renderHook(() => useLogin());

		await act(async () => {
			await result.current.login({
				email: 'test@example.com',
				password: 'Password123!',
				rememberMe: true,
			});
		});

		expect(loginTriggerMock).not.toHaveBeenCalled();
	});
});
