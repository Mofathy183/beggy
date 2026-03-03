import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ItemMapper } from '../item.mapper';

import { buildItem, buildItems } from './factories/item.factory';

import { toISO } from '@shared/utils';

vi.mock('@shared/utils', async () => ({
	toISO: vi.fn(),
}));

const userId = 'user-1';

describe('ItemMapper', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('toDTO()', () => {
		it('returns mapped item dto', () => {
			/* Arrange */
			const item = buildItem(userId);

			(toISO as any)
				.mockReturnValueOnce('created-iso')
				.mockReturnValueOnce('updated-iso');

			/* Act */
			const result = ItemMapper.toDTO(item);

			/* Assert */
			expect(toISO).toHaveBeenCalledTimes(2);
			expect(toISO).toHaveBeenNthCalledWith(1, item.createdAt);
			expect(toISO).toHaveBeenNthCalledWith(2, item.updatedAt);

			expect(result).toEqual({
				id: item.id,
				name: item.name,
				category: item.category,
				weight: item.weight,
				weightUnit: item.weightUnit,
				volume: item.volume,
				volumeUnit: item.volumeUnit,
				color: item.color,
				isFragile: item.isFragile,
				createdAt: 'created-iso',
				updatedAt: 'updated-iso',
				userId: item.userId,
			});
		});
	});

	describe('toDTOList()', () => {
		it('returns mapped item dto list', () => {
			/* Arrange */
			const items = buildItems(3, userId);

			(toISO as any).mockImplementation(
				(date: Date) => `iso-${date.getTime()}`
			);

			/* Act */
			const result = ItemMapper.toDTOList(items);

			/* Assert */
			expect(result).toHaveLength(3);

			items.forEach((item, index) => {
				expect(result[index]).toMatchObject({
					id: item.id,
					name: item.name,
					userId: item.userId,
				});
			});

			expect(toISO).toHaveBeenCalledTimes(6); // 2 per item
		});

		it('returns empty array when items array is empty', () => {
			/* Arrange */
			const items: any[] = [];

			/* Act */
			const result = ItemMapper.toDTOList(items);

			/* Assert */
			expect(result).toEqual([]);
			expect(toISO).not.toHaveBeenCalled();
		});
	});
});
