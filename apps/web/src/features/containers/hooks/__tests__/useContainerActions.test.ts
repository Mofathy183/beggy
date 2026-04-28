import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

import useContainerActions from '../useContainerActions';

// ─── Mocks ────────────────────────────────────────────────────────────

const packItemMock = vi.fn();
const unpackItemMock = vi.fn();
const moveItemMock = vi.fn();

const useContainerMutationsMock = vi.fn();

vi.mock('../useContainerMutations', () => ({
	default: () => useContainerMutationsMock(),
}));

// ─── Helpers ──────────────────────────────────────────────────────────

const createMutationState = (overrides?: Partial<any>) => ({
	packItem: packItemMock,
	unpackItem: unpackItemMock,
	moveItem: moveItemMock,
	isAnyLoading: false,
	states: {
		pack: { isLoading: false },
		unpack: { isLoading: false },
		move: { isLoading: false },
	},
	...overrides,
});

// helper to mock unwrap success
const mockSuccess = (message = 'Success') => ({
	unwrap: vi.fn().mockResolvedValue({ message }),
});

// helper to mock unwrap failure
const mockError = (error = new Error('Failed')) => ({
	unwrap: vi.fn().mockRejectedValue(error),
});

// ─── Tests ────────────────────────────────────────────────────────────

describe('useContainerActions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useContainerMutationsMock.mockReturnValue(createMutationState());
	});

	// ─── pack ──────────────────────────────────────────────────────────

	it('calls packItem and calls onSuccess when pack succeeds', async () => {
		const onSuccess = vi.fn();

		packItemMock.mockReturnValue(mockSuccess('Packed!'));

		const { result } = renderHook(() => useContainerActions());

		await result.current.pack(
			'container-1',
			{ itemId: 'item-1', quantity: 1 },
			{ onSuccess }
		);

		expect(packItemMock).toHaveBeenCalledWith('container-1', {
			itemId: 'item-1',
			quantity: 1,
		});

		expect(onSuccess).toHaveBeenCalledWith('Packed!');
	});

	it('calls onError when pack fails', async () => {
		const onError = vi.fn();
		const error = new Error('Pack failed');

		packItemMock.mockReturnValue(mockError(error));

		const { result } = renderHook(() => useContainerActions());

		await result.current.pack(
			'container-1',
			{ itemId: 'item-1', quantity: 1 },
			{ onError }
		);

		expect(onError).toHaveBeenCalledWith(error);
	});

	// ─── unpack ────────────────────────────────────────────────────────

	it('calls unpackItem and calls onSuccess when unpack succeeds', async () => {
		const onSuccess = vi.fn();

		unpackItemMock.mockReturnValue(mockSuccess('Unpacked!'));

		const { result } = renderHook(() => useContainerActions());

		await result.current.unpack(
			'container-1',
			{ itemId: 'item-1', quantity: 1 },
			{ onSuccess }
		);

		expect(unpackItemMock).toHaveBeenCalledWith('container-1', {
			itemId: 'item-1',
			quantity: 1,
		});

		expect(onSuccess).toHaveBeenCalledWith('Unpacked!');
	});

	it('calls onError when unpack fails', async () => {
		const onError = vi.fn();
		const error = new Error('Unpack failed');

		unpackItemMock.mockReturnValue(mockError(error));

		const { result } = renderHook(() => useContainerActions());

		await result.current.unpack(
			'container-1',
			{ itemId: 'item-1', quantity: 1 },
			{ onError }
		);

		expect(onError).toHaveBeenCalledWith(error);
	});

	// ─── move ──────────────────────────────────────────────────────────

	it('calls moveItem and calls onSuccess when move succeeds', async () => {
		const onSuccess = vi.fn();

		moveItemMock.mockReturnValue(mockSuccess('Moved!'));

		const { result } = renderHook(() => useContainerActions());

		await result.current.move(
			{
				fromContainerId: 'c1',
				toContainerId: 'c2',
				itemId: 'item-1',
				quantity: 1,
			},
			{ onSuccess }
		);

		expect(moveItemMock).toHaveBeenCalledWith({
			fromContainerId: 'c1',
			toContainerId: 'c2',
			itemId: 'item-1',
			quantity: 1,
		});

		expect(onSuccess).toHaveBeenCalledWith('Moved!');
	});

	it('calls onError when move fails', async () => {
		const onError = vi.fn();
		const error = new Error('Move failed');

		moveItemMock.mockReturnValue(mockError(error));

		const { result } = renderHook(() => useContainerActions());

		await result.current.move(
			{
				fromContainerId: 'c1',
				toContainerId: 'c2',
				itemId: 'item-1',
				quantity: 1,
			},
			{ onError }
		);

		expect(onError).toHaveBeenCalledWith(error);
	});

	// ─── state mapping ─────────────────────────────────────────────────

	it('maps loading states correctly', () => {
		useContainerMutationsMock.mockReturnValue(
			createMutationState({
				isAnyLoading: true,
				states: {
					pack: { isLoading: true },
					unpack: { isLoading: false },
					move: { isLoading: true },
				},
			})
		);

		const { result } = renderHook(() => useContainerActions());

		expect(result.current.isPacking).toBe(true);
		expect(result.current.isUnpacking).toBe(false);
		expect(result.current.isMoving).toBe(true);
		expect(result.current.isAnyLoading).toBe(true);
	});

	it('returns states object from the mutation layer', () => {
		const states = {
			pack: { isLoading: false },
			unpack: { isLoading: false },
			move: { isLoading: false },
		};

		useContainerMutationsMock.mockReturnValue(
			createMutationState({ states })
		);

		const { result } = renderHook(() => useContainerActions());

		expect(result.current.states).toBe(states);
	});
});
