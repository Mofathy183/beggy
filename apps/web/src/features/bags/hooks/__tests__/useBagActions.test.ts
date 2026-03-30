import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

import useBagActions from '../useBagActions';
import useBagMutations from '../useBagMutations';

import { SuccessMessages } from '@beggy/shared/constants';

// Mock mutation hook (API boundary)
vi.mock('../useBagMutations');

const createBagMock = vi.fn();
const updateBagMock = vi.fn();
const deleteBagMock = vi.fn();

const mockedUseBagMutations = vi.mocked(useBagMutations);

describe('useBagActions', () => {
	beforeEach(() => {
		vi.clearAllMocks();

		mockedUseBagMutations.mockReturnValue({
			createBag: createBagMock,
			updateBag: updateBagMock,
			deleteBag: deleteBagMock,
			isAnyLoading: false,
			states: {
				create: { isLoading: false },
				update: { isLoading: false },
				delete: { isLoading: false },
			},
		} as any);
	});

	// =========================
	// CREATE
	// =========================

	it('creates a bag and calls onSuccess with the success message', async () => {
		const message = 'Bag created successfully';
		const onSuccess = vi.fn();

		createBagMock.mockReturnValue({
			unwrap: () => Promise.resolve({ message }),
		});

		const { result } = renderHook(() => useBagActions());

		await result.current.create({ name: 'Test Bag' } as any, { onSuccess });

		expect(createBagMock).toHaveBeenCalledWith({ name: 'Test Bag' });
		expect(onSuccess).toHaveBeenCalledWith(message);
	});

	it('calls onError when creation fails', async () => {
		const error = new Error('Create failed');
		const onError = vi.fn();

		createBagMock.mockReturnValue({
			unwrap: () => Promise.reject(error),
		});

		const { result } = renderHook(() => useBagActions());

		await result.current.create({ name: 'Test Bag' } as any, { onError });

		expect(onError).toHaveBeenCalledWith(error);
	});

	// =========================
	// EDIT
	// =========================

	it('updates a bag and calls onSuccess with the success message', async () => {
		const message = 'Bag updated successfully';
		const onSuccess = vi.fn();

		updateBagMock.mockReturnValue({
			unwrap: () => Promise.resolve({ message }),
		});

		const { result } = renderHook(() => useBagActions());

		await result.current.edit('bag-id', { name: 'Updated Bag' } as any, {
			onSuccess,
		});

		expect(updateBagMock).toHaveBeenCalledWith('bag-id', {
			name: 'Updated Bag',
		});
		expect(onSuccess).toHaveBeenCalledWith(message);
	});

	it('calls onError when update fails', async () => {
		const error = new Error('Update failed');
		const onError = vi.fn();

		updateBagMock.mockReturnValue({
			unwrap: () => Promise.reject(error),
		});

		const { result } = renderHook(() => useBagActions());

		await result.current.edit('bag-id', { name: 'Updated Bag' } as any, {
			onError,
		});

		expect(onError).toHaveBeenCalledWith(error);
	});

	// =========================
	// DELETE
	// =========================

	it('deletes a bag and calls onSuccess with the success message', async () => {
		const onSuccess = vi.fn();

		deleteBagMock.mockReturnValue({
			unwrap: () => Promise.resolve({}),
		});

		const { result } = renderHook(() => useBagActions());

		await result.current.remove('bag-id', { onSuccess });

		expect(deleteBagMock).toHaveBeenCalledWith('bag-id');
		expect(onSuccess).toHaveBeenCalledWith(SuccessMessages.BAG_DELETED);
	});

	it('calls onError when deletion fails', async () => {
		const error = new Error('Delete failed');
		const onError = vi.fn();

		deleteBagMock.mockReturnValue({
			unwrap: () => Promise.reject(error),
		});

		const { result } = renderHook(() => useBagActions());

		await result.current.remove('bag-id', { onError });

		expect(onError).toHaveBeenCalledWith(error);
	});

	// =========================
	// STATE MAPPING
	// =========================

	it('returns loading states mapped from the mutation hook', () => {
		mockedUseBagMutations.mockReturnValue({
			createBag: createBagMock,
			updateBag: updateBagMock,
			deleteBag: deleteBagMock,
			isAnyLoading: true,
			states: {
				create: { isLoading: true },
				update: { isLoading: false },
				delete: { isLoading: true },
			},
		} as any);

		const { result } = renderHook(() => useBagActions());

		expect(result.current.isCreating).toBe(true);
		expect(result.current.isUpdating).toBe(false);
		expect(result.current.isDeleting).toBe(true);
		expect(result.current.isAnyLoading).toBe(true);
	});
});
