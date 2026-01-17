import { it, describe, expect } from 'vitest';
import { BagType, Material, Size } from '../../src/constants/bag.enums';
import { OrderDirection } from '../../src/constants/api.enums';
import {
	buildOrderBySchema,
	dateRangeSchema,
	numberRangeSchema,
	PaginationSchema,
	ParamsSchema,
	QuerySchema,
} from '../../src/schemas/api.schema';

enum TestOrderBy {
	NAME = 'name',
	CREATED_AT = 'createdAt',
}

describe('buildOrderBySchema()', () => {
	const schema = buildOrderBySchema(TestOrderBy);

	it('accepts a valid orderBy field', () => {
		const result = schema.parse({ orderBy: TestOrderBy.NAME });
		expect(result.orderBy).toBe(TestOrderBy.NAME);
	});

	it('defaults direction to ASC', () => {
		const result = schema.parse({ orderBy: TestOrderBy.CREATED_AT });
		expect(result.direction).toBe(OrderDirection.ASC);
	});

	it('accepts explicit direction', () => {
		const result = schema.parse({
			orderBy: TestOrderBy.NAME,
			direction: OrderDirection.DESC,
		});

		expect(result.direction).toBe(OrderDirection.DESC);
	});

	it('rejects invalid orderBy field', () => {
		expect(() => schema.parse({ orderBy: 'invalid' })).toThrow();
	});

	it('rejects extra keys (strict)', () => {
		expect(() =>
			schema.parse({
				orderBy: TestOrderBy.NAME,
				extra: 'nope',
			})
		).toThrow();
	});
});

describe('dateRangeSchema', () => {
	it('accepts only from date', () => {
		expect(() =>
			dateRangeSchema.parse({ from: new Date('2024-01-01') })
		).not.toThrow();
	});

	it('accepts only to date', () => {
		expect(() =>
			dateRangeSchema.parse({ to: new Date('2024-01-10') })
		).not.toThrow();
	});

	it('accepts valid range (from <= to)', () => {
		expect(() =>
			dateRangeSchema.parse({
				from: new Date('2024-01-01'),
				to: new Date('2024-01-10'),
			})
		).not.toThrow();
	});

	it('rejects invalid range (from > to)', () => {
		expect(() =>
			dateRangeSchema.parse({
				from: new Date('2024-01-10'),
				to: new Date('2024-01-01'),
			})
		).toThrow();
	});
});

describe('numberRangeSchema()', () => {
	// weight have decimals: 3 for the items in the NUMBER_CONFIG
	const schema = numberRangeSchema('item', 'weight');

	it('accepts min only', () => {
		const result = schema.parse({ min: 1.234 });
		expect(result.min).toBeDefined();
	});

	it('accepts max only', () => {
		const result = schema.parse({ max: 10 });
		expect(result.max).toBeDefined();
	});

	it('accepts valid min and max', () => {
		expect(() => schema.parse({ min: 1, max: 10 })).not.toThrow();
	});

	it('rejects when both min and max are missing', () => {
		expect(() => schema.parse({})).toThrow();
	});

	it('rejects when min > max', () => {
		expect(() => schema.parse({ min: 10, max: 5 })).toThrow();
	});

	it('applies rounding to configured decimals', () => {
		const result = schema.parse({ min: 1.23456 });
		// that why that round to decimals 3
		expect(result.min).toBe(1.235);
	});
});

describe('QuerySchema', () => {
	it('accepts minimal user filter', () => {
		expect(() => QuerySchema.userFilter.parse({})).not.toThrow();
	});

	it('accepts minimal bag filter', () => {
		expect(() =>
			QuerySchema.bagFilter.parse({
				type: BagType.BACKPACK,
				size: Size.MEDIUM,
				material: Material.METAL,
			})
		).not.toThrow();
	});

	it('rejects unknown keys', () => {
		expect(() => QuerySchema.userFilter.parse({ unknown: true })).toThrow();
	});
});

describe('ParamsSchema.uuid', () => {
	it('accepts valid uuid v4', () => {
		expect(() =>
			ParamsSchema.uuid.parse({
				id: '550e8400-e29b-41d4-a716-446655440000',
			})
		).not.toThrow();
	});

	it('rejects invalid uuid', () => {
		expect(() => ParamsSchema.uuid.parse({ id: 'invalid' })).toThrow();
	});
});

describe('PaginationSchema.pagination', () => {
	it('applies default values', () => {
		const result = PaginationSchema.pagination.parse({});
		expect(result).toEqual({ page: 1, limit: 10 });
	});

	it('accepts valid page and limit', () => {
		const result = PaginationSchema.pagination.parse({
			page: 2,
			limit: 20,
		});

		expect(result.page).toBe(2);
		expect(result.limit).toBe(20);
	});

	it('rejects page < 1', () => {
		expect(() => PaginationSchema.pagination.parse({ page: 0 })).toThrow();
	});

	it('rejects limit > 100', () => {
		expect(() =>
			PaginationSchema.pagination.parse({ limit: 101 })
		).toThrow();
	});
});
