import { describe, it, expect } from 'vitest';
import { buildBag, buildBags } from './factories/bag.factory';
import { BagMapper } from '../bag.mapper';
import { ContainerStatus } from '@beggy/shared/constants';

describe('BagMapper', () => {
	describe('toDTO()', () => {
		it('returns bag identity fields', () => {
			const bag = buildBag('user-1');
			const dto = BagMapper.toDTO(bag);

			expect(dto.id).toBe(bag.id);
			expect(dto.name).toBe(bag.name);
			expect(dto.type).toBe(bag.type);
			expect(dto.color).toBe(bag.color);
			expect(dto.size).toBe(bag.size);
			expect(dto.userId).toBe(bag.userId);
		});

		it('returns container constraints', () => {
			const bag = buildBag('user-1');

			const dto = BagMapper.toDTO(bag);

			expect(dto.maxCapacity).toBe(bag.container.maxCapacity);
			expect(dto.maxWeight).toBe(bag.container.maxWeight);
			expect(dto.emptyWeight).toBe(bag.container.emptyWeight);
		});

		it('returns empty status when no items exist', () => {
			const bag = buildBag(
				'user-1',
				{},
				{},
				{
					containerItems: [],
				}
			);

			const dto = BagMapper.toDTO(bag);

			expect(dto.status?.state.status).toBe(ContainerStatus.EMPTY);
			expect(dto.status?.metrics.itemCount).toBe(0);
		});

		it('returns current weight including container weight', () => {
			const bag = buildBag(
				'user-1',
				{},
				{},
				{
					containerItems: [],
				}
			);

			const dto = BagMapper.toDTO(bag);

			expect(dto.status?.metrics.currentWeight).toBe(
				bag.container.emptyWeight
			);
		});
	});

	describe('toDTOList()', () => {
		it('returns an empty array when input is empty', () => {
			expect(BagMapper.toDTOList([])).toEqual([]);
		});

		it('returns mapped bags', () => {
			const bags = buildBags(2, 'user-1');

			const dtos = BagMapper.toDTOList(bags);

			expect(dtos).toHaveLength(2);

			dtos.forEach((dto, i) => {
				expect(dto.id).toBe(bags[i]!.id);
			});
		});
	});
});
