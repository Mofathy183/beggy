import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useLogin from '../useLogin';

const loginTriggerMock = vi.fn();
const unwrapMock = vi.fn();
const useLoginMutationMock = vi.fn();

vi.mock('@features/auth/api', () => ({
	useLoginMutation: () => useLoginMutationMock(),
}));

vi.mock('../useAuthRedirect', () => ({
	default: vi.fn(),
}));

describe('useLogin()', () => {
	beforeEach(() => {
		vi.clearAllMocks();

		useLoginMutationMock.mockReturnValue([
			loginTriggerMock,
			{ isLoading: false },
		]);
	});

	it('submits credentials when login is called', async () => {
		unwrapMock.mockResolvedValue(undefined);

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

		expect(result.current.serverError).toBeNull();
	});

	it('denies login when already loading', async () => {
		useLoginMutationMock.mockReturnValue([
			loginTriggerMock,
			{ isLoading: true },
		]);

		const { result } = renderHook(() => useLogin());

		await act(async () => {
			await result.current.login({
				email: 'a',
				password: 'b',
				rememberMe: false,
			});
		});

		expect(loginTriggerMock).not.toHaveBeenCalled();
	});

	it('returns error message when login fails', async () => {
		unwrapMock.mockRejectedValue({
			body: { message: 'Invalid credentials' },
		});

		loginTriggerMock.mockReturnValue({
			unwrap: unwrapMock,
		});

		const { result } = renderHook(() => useLogin());

		await act(async () => {
			await result.current.login({
				email: 'wrong@example.com',
				password: 'wrong',
				rememberMe: false,
			});
		});

		expect(result.current.serverError).toBe('Invalid credentials');
	});

	it('returns default error message when error has no message', async () => {
		unwrapMock.mockRejectedValue({});

		loginTriggerMock.mockReturnValue({
			unwrap: unwrapMock,
		});

		const { result } = renderHook(() => useLogin());

		await act(async () => {
			await result.current.login({
				email: 'x',
				password: 'y',
				rememberMe: false,
			});
		});

		expect(result.current.serverError).toBe('Something went wrong.');
	});

	it('clears previous error before new login attempt', async () => {
		unwrapMock
			.mockRejectedValueOnce({
				body: { message: 'Invalid credentials' },
			})
			.mockResolvedValueOnce(undefined);

		loginTriggerMock.mockReturnValue({
			unwrap: unwrapMock,
		});

		const { result } = renderHook(() => useLogin());

		await act(async () => {
			await result.current.login({
				email: 'x',
				password: 'y',
				rememberMe: false,
			});
		});

		expect(result.current.serverError).toBe('Invalid credentials');

		await act(async () => {
			await result.current.login({
				email: 'x',
				password: 'y',
				rememberMe: false,
			});
		});

		expect(result.current.serverError).toBeNull();
	});
});
