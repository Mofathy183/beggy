import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

import useBagMutations from '../useBagMutations';

import {
	useCreateBagMutation,
	useUpdateBagMutation,
	useDeleteBagByIdMutation,
} from '@features/bags/api';

// Mock RTK mutation hooks (API boundary)
vi.mock('@features/bags/api', () => ({
	useCreateBagMutation: vi.fn(),
	useUpdateBagMutation: vi.fn(),
	useDeleteBagByIdMutation: vi.fn(),
}));

const mockedCreate = vi.mocked(useCreateBagMutation);
const mockedUpdate = vi.mocked(useUpdateBagMutation);
const mockedDelete = vi.mocked(useDeleteBagByIdMutation);

describe('useBagMutations', () => {
	const createFn = vi.fn();
	const updateFn = vi.fn();
	const deleteFn = vi.fn();

	const createState = { isLoading: false };
	const updateState = { isLoading: false };
	const deleteState = { isLoading: false };

	beforeEach(() => {
		vi.clearAllMocks();

		mockedCreate.mockReturnValue([createFn, createState] as any);
		mockedUpdate.mockReturnValue([updateFn, updateState] as any);
		mockedDelete.mockReturnValue([deleteFn, deleteState] as any);
	});

	// =========================
	// CREATE
	// =========================

	it('calls create mutation with the provided payload', () => {
		const { result } = renderHook(() => useBagMutations());

		const body = { name: 'Bag' };

		result.current.createBag(body as any);

		expect(createFn).toHaveBeenCalledWith(body);
	});

	// =========================
	// UPDATE
	// =========================

	it('calls update mutation with id and body mapped correctly', () => {
		const { result } = renderHook(() => useBagMutations());

		const id = 'bag-1';
		const body = { name: 'Updated' };

		result.current.updateBag(id, body as any);

		expect(updateFn).toHaveBeenCalledWith({ id, body });
	});

	// =========================
	// DELETE
	// =========================

	it('calls delete mutation with the provided id', () => {
		const { result } = renderHook(() => useBagMutations());

		result.current.deleteBag('bag-1');

		expect(deleteFn).toHaveBeenCalledWith('bag-1');
	});

	// =========================
	// STATE EXPOSURE
	// =========================

	it('returns mutation states grouped by operation', () => {
		const { result } = renderHook(() => useBagMutations());

		expect(result.current.states.create).toBe(createState);
		expect(result.current.states.update).toBe(updateState);
		expect(result.current.states.delete).toBe(deleteState);
	});

	// =========================
	// LOADING AGGREGATION
	// =========================

	it('returns true when any mutation is loading', () => {
		mockedCreate.mockReturnValue([createFn, { isLoading: true }] as any);

		mockedUpdate.mockReturnValue([updateFn, { isLoading: false }] as any);

		mockedDelete.mockReturnValue([deleteFn, { isLoading: false }] as any);

		const { result } = renderHook(() => useBagMutations());

		expect(result.current.isAnyLoading).toBe(true);
	});

	it('returns false when no mutations are loading', () => {
		const { result } = renderHook(() => useBagMutations());

		expect(result.current.isAnyLoading).toBe(false);
	});
});
