import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import useItemActions from '../useItemActions';
import useItemMutations from '../useItemMutations';

import { SuccessMessages } from '@beggy/shared/constants';

vi.mock('../useItemMutations');

const createItemMock = vi.fn();
const updateItemMock = vi.fn();
const deleteItemMock = vi.fn();

const statesMock = {
	create: { isLoading: false },
	update: { isLoading: false },
	delete: { isLoading: false },
};

beforeEach(() => {
	vi.clearAllMocks();
	(useItemMutations as any).mockReturnValue({
		createItem: createItemMock,
		updateItem: updateItemMock,
		deleteItem: deleteItemMock,
		isAnyLoading: false,
		states: statesMock,
	});
});

describe('useItemActions', () => {
	describe('create', () => {
		it('creates an item and calls onSuccess with the success message', async () => {
			const onSuccess = vi.fn();

			createItemMock.mockReturnValue({
				unwrap: vi.fn().mockResolvedValue({
					message: 'Item created',
				}),
			});

			const { result } = renderHook(() => useItemActions());

			await act(async () => {
				await result.current.create({ name: 'Backpack' } as any, {
					onSuccess,
				});
			});

			expect(createItemMock).toHaveBeenCalledWith({
				name: 'Backpack',
			});

			expect(onSuccess).toHaveBeenCalledWith('Item created');
		});

		it('calls onError when item creation fails', async () => {
			const onError = vi.fn();

			const error = { message: 'error' };

			createItemMock.mockReturnValue({
				unwrap: vi.fn().mockRejectedValue(error),
			});

			const { result } = renderHook(() => useItemActions());

			await act(async () => {
				await result.current.create({ name: 'Backpack' } as any, {
					onError,
				});
			});

			expect(onError).toHaveBeenCalledWith(error);
		});
	});

	describe('edit', () => {
		it('updates an item and calls onSuccess with the success message', async () => {
			const onSuccess = vi.fn();

			updateItemMock.mockReturnValue({
				unwrap: vi.fn().mockResolvedValue({
					message: 'Item updated',
				}),
			});

			const { result } = renderHook(() => useItemActions());

			await act(async () => {
				await result.current.edit(
					'item-id',
					{ name: 'New name' } as any,
					{ onSuccess }
				);
			});

			expect(updateItemMock).toHaveBeenCalledWith('item-id', {
				name: 'New name',
			});

			expect(onSuccess).toHaveBeenCalledWith('Item updated');
		});
	});

	describe('remove', () => {
		it('deletes an item and calls onSuccess with the delete success message', async () => {
			const onSuccess = vi.fn();

			deleteItemMock.mockReturnValue({
				unwrap: vi.fn().mockResolvedValue({}),
			});

			const { result } = renderHook(() => useItemActions());

			await act(async () => {
				await result.current.remove('item-id', { onSuccess });
			});

			expect(deleteItemMock).toHaveBeenCalledWith('item-id');

			expect(onSuccess).toHaveBeenCalledWith(
				SuccessMessages.ITEM_DELETED
			);
		});
	});

	describe('loading states', () => {
		it('exposes the mutation loading states', () => {
			const { result } = renderHook(() => useItemActions());

			expect(result.current.isCreating).toBe(false);
			expect(result.current.isUpdating).toBe(false);
			expect(result.current.isDeleting).toBe(false);
			expect(result.current.isAnyLoading).toBe(false);
		});
	});
});
