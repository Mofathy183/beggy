import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import useItemActions from '../useItemActions';
import useItemMutations from '../useItemMutations';

vi.mock('../useItemMutations');

const mockUseItemMutations = vi.mocked(useItemMutations);

describe('useItemActions()', () => {
	let createItem: any;
	let updateItem: any;
	let deleteItem: any;

	beforeEach(() => {
		createItem = vi.fn();
		updateItem = vi.fn();
		deleteItem = vi.fn();

		mockUseItemMutations.mockReturnValue({
			createItem,
			updateItem,
			deleteItem,
			isAnyLoading: false,
			states: {
				create: { isLoading: false },
				update: { isLoading: false },
				delete: { isLoading: false },
			},
		} as any);
	});

	it('calls onSuccess when create succeeds', async () => {
		const unwrap = vi.fn().mockResolvedValue({});
		createItem.mockReturnValue({ unwrap });

		const onSuccess = vi.fn();

		const { result } = renderHook(() => useItemActions());

		await act(async () => {
			await result.current.create({ name: 'Item' } as any, { onSuccess });
		});

		expect(createItem).toHaveBeenCalledWith({ name: 'Item' });
		expect(onSuccess).toHaveBeenCalled();
	});

	it('calls onError when create fails', async () => {
		const error = new Error('create failed');
		const unwrap = vi.fn().mockRejectedValue(error);

		createItem.mockReturnValue({ unwrap });

		const onError = vi.fn();

		const { result } = renderHook(() => useItemActions());

		await act(async () => {
			await result.current.create({ name: 'Item' } as any, { onError });
		});

		expect(onError).toHaveBeenCalledWith(error);
	});

	it('calls update mutation and onSuccess when edit succeeds', async () => {
		const unwrap = vi.fn().mockResolvedValue({});
		updateItem.mockReturnValue({ unwrap });

		const onSuccess = vi.fn();

		const { result } = renderHook(() => useItemActions());

		await act(async () => {
			await result.current.edit('123', { name: 'Updated' } as any, {
				onSuccess,
			});
		});

		expect(updateItem).toHaveBeenCalledWith('123', { name: 'Updated' });
		expect(onSuccess).toHaveBeenCalled();
	});

	it('calls delete mutation and onSuccess when remove succeeds', async () => {
		const unwrap = vi.fn().mockResolvedValue({});
		deleteItem.mockReturnValue({ unwrap });

		const onSuccess = vi.fn();

		const { result } = renderHook(() => useItemActions());

		await act(async () => {
			await result.current.remove('123', { onSuccess });
		});

		expect(deleteItem).toHaveBeenCalledWith('123');
		expect(onSuccess).toHaveBeenCalled();
	});

	it('exposes mutation loading states', () => {
		mockUseItemMutations.mockReturnValue({
			createItem,
			updateItem,
			deleteItem,
			isAnyLoading: true,
			states: {
				create: { isLoading: true },
				update: { isLoading: false },
				delete: { isLoading: false },
			},
		} as any);

		const { result } = renderHook(() => useItemActions());

		expect(result.current.isCreating).toBe(true);
		expect(result.current.isUpdating).toBe(false);
		expect(result.current.isDeleting).toBe(false);
		expect(result.current.isAnyLoading).toBe(true);
	});
});
