import { describe, it, expect } from 'vitest';
import { createBaseSortOptions } from '../sort.mapper';
import { OrderDirection } from '@beggy/shared/constants';

describe('createBaseSortOptions()', () => {
	it('returns newest and oldest options when createdAt is provided', () => {
		const result = createBaseSortOptions({
			createdAt: 'createdAt',
		});

		expect(result).toHaveLength(2);

		expect(result[0]).toMatchObject({
			label: 'Newest',
			value: {
				orderBy: 'createdAt',
				direction: OrderDirection.DESC,
			},
		});

		expect(result[1]).toMatchObject({
			label: 'Oldest',
			value: {
				orderBy: 'createdAt',
				direction: OrderDirection.ASC,
			},
		});
	});

	it('returns recently updated option when updatedAt is provided', () => {
		const result = createBaseSortOptions({
			updatedAt: 'updatedAt',
		});

		expect(result).toHaveLength(1);

		expect(result[0]).toMatchObject({
			label: 'Recently updated',
			value: {
				orderBy: 'updatedAt',
				direction: OrderDirection.DESC,
			},
		});
	});

	it('returns all relevant options when both fields are provided', () => {
		const result = createBaseSortOptions({
			createdAt: 'createdAt',
			updatedAt: 'updatedAt',
		});

		expect(result).toHaveLength(3);
	});

	it('returns empty array when no fields are provided', () => {
		const result = createBaseSortOptions({});

		expect(result).toHaveLength(0);
	});
});
