import { describe, it, expect } from 'vitest';
import {
	buildUserQuery,
	buildBagQuery,
	buildItemQuery,
	buildSuitcaseQuery,
	formatValidationError,
	buildMeta,
	reconstructQuery,
	toISO,
} from '@shared/utils';
import {
	BagType,
	Role,
	SuitcaseType,
	WheelType,
} from '@beggy/shared/constants';
import type {
	UserOrderByInput,
	SuitcaseOrderByInput,
	BagOrderByInput,
	ItemOrderByInput,
} from '@beggy/shared/types';

describe('formatValidationError()', () => {
	it('returns undefined when there are no validation errors', () => {
		const tree = {
			errors: [],
			properties: {},
		};

		expect(formatValidationError(tree)).toBeUndefined();
	});

	it('returns field errors for simple leaf nodes', () => {
		const tree = {
			errors: [],
			properties: {
				email: {
					errors: ['Invalid email'],
				},
			},
		};

		expect(formatValidationError(tree)).toEqual({
			email: ['Invalid email'],
		});
	});

	it('returns nested errors for object properties', () => {
		const tree = {
			errors: [],
			properties: {
				profile: {
					errors: [],
					properties: {
						firstName: {
							errors: ['Required'],
						},
					},
				},
			},
		};

		expect(formatValidationError(tree)).toEqual({
			profile: {
				firstName: ['Required'],
			},
		});
	});

	it('returns index-based errors for array items', () => {
		const tree = {
			errors: [],
			items: [{ errors: ['Invalid value'] }, { errors: [] }],
		};

		expect(formatValidationError(tree)).toEqual({
			items: {
				'0': ['Invalid value'],
			},
		});
	});
});

describe('buildMeta()', () => {
	it('returns correct meta when data length equals limit', () => {
		/* Arrange */
		const data = [1, 2, 3];
		const limit = 3;
		const page = 1;

		/* Act */
		const result = buildMeta(data, limit, page);

		/* Assert */
		expect(result).toEqual({
			count: 3,
			page: 1,
			limit: 3,
			hasNextPage: false,
			hasPreviousPage: false,
		});
	});

	it('returns hasNextPage true when data length exceeds limit', () => {
		/* Arrange */
		const data = [1, 2, 3, 4];
		const limit = 3;
		const page = 1;

		/* Act */
		const result = buildMeta(data, limit, page);

		/* Assert */
		expect(result).toEqual({
			count: 3,
			page: 1,
			limit: 3,
			hasNextPage: true,
			hasPreviousPage: false,
		});
	});

	it('returns hasPreviousPage true when page is greater than 1', () => {
		/* Arrange */
		const data = [1, 2, 3];
		const limit = 3;
		const page = 2;

		/* Act */
		const result = buildMeta(data, limit, page);

		/* Assert */
		expect(result).toEqual({
			count: 3,
			page: 2,
			limit: 3,
			hasNextPage: false,
			hasPreviousPage: true,
		});
	});

	it('returns trimmed count when data length exceeds limit', () => {
		/* Arrange */
		const data = [1, 2, 3, 4, 5];
		const limit = 3;
		const page = 1;

		/* Act */
		const result = buildMeta(data, limit, page);

		/* Assert */
		expect(result.count).toBe(3);
	});

	it('does not mutate original data array', () => {
		const data = [1, 2, 3, 4];
		const copy = [...data];

		buildMeta(data, 3, 1);

		expect(data).toEqual(copy);
	});
});

describe('reconstructQuery()', () => {
	it('reconstructs nested objects from dot notation', () => {
		const result = reconstructQuery({
			'price.min': '10',
			'price.max': '20',
		});

		expect(result).toEqual({
			price: {
				min: 10,
				max: 20,
			},
		});
	});

	it('coerces primitive values', () => {
		const result = reconstructQuery({
			isActive: 'true',
			count: '5',
		});

		expect(result).toEqual({
			isActive: true,
			count: 5,
		});
	});

	it('converts ISO date strings to Date', () => {
		const result = reconstructQuery({
			date: '2024-01-01',
		});

		expect(result.date).toBeInstanceOf(Date);
	});

	it('uses first value when array is provided', () => {
		const result = reconstructQuery({
			page: ['2', '3'],
		});

		expect(result.page).toBe(2);
	});
});

describe('buildUserQuery()', () => {
	it('applies scalar filters to query', () => {
		const result = buildUserQuery(
			{
				email: 'test',
				role: Role.ADMIN,
				isActive: true,
				isEmailVerified: false,
			},
			{} as UserOrderByInput
		);

		expect(result.where).toMatchObject({
			email: { contains: 'test', mode: 'insensitive' },
			role: Role.ADMIN,
			isEmailVerified: false,
			isActive: true,
		});
	});

	it('applies createdAt date range when provided', () => {
		const from = new Date('2024-01-01');
		const to = new Date('2024-12-31');

		const result = buildUserQuery(
			{
				createdAt: { from, to },
			},
			{} as UserOrderByInput
		);

		expect(result.where.createdAt).toEqual({
			gte: from,
			lte: to,
		});
	});

	it('defaults to createdAt ordering when orderBy is undefined', () => {
		const result = buildUserQuery({}, {} as UserOrderByInput);

		expect(result.orderBy).toEqual({
			createdAt: 'asc',
		});
	});
});

describe('buildBagQuery()', () => {
	it('applies categorical and numeric range filters', () => {
		const result = buildBagQuery(
			{
				type: BagType.BACKPACK,
				color: 'black',
				maxCapacity: { min: 20, max: 50 },
				maxWeight: { max: 30 },
			},
			{} as BagOrderByInput
		);

		expect(result.where).toMatchObject({
			type: 'BACKPACK',
			color: { contains: 'black', mode: 'insensitive' },
			container: {
				maxCapacity: { gte: 20, lte: 50 },
				maxWeight: { lte: 30 },
			},
		});
	});

	it('orders by container fields when ordering by maxCapacity', () => {
		const result = buildBagQuery({}, {
			orderBy: 'maxCapacity',
			direction: 'desc',
		} as BagOrderByInput);

		expect(result.orderBy).toEqual({
			container: {
				maxCapacity: 'desc',
			},
		});
	});
});

describe('buildItemQuery()', () => {
	it('applies boolean filters explicitly', () => {
		const result = buildItemQuery(
			{
				isFragile: false,
			},
			{} as ItemOrderByInput
		);

		expect(result.where.isFragile).toBe(false);
	});

	it('applies independent numeric ranges for weight and volume', () => {
		const result = buildItemQuery(
			{
				weight: { min: 1 },
				volume: { max: 10 },
			},
			{} as ItemOrderByInput
		);

		expect(result.where).toMatchObject({
			weight: { gte: 1 },
			volume: { lte: 10 },
		});
	});

	it('defaults to createdAt ordering when orderBy is undefined', () => {
		const result = buildItemQuery({}, {} as ItemOrderByInput);

		expect(result.orderBy).toEqual({
			createdAt: 'asc',
		});
	});
});

describe('buildSuitcaseQuery()', () => {
	it('applies suitcase categorical filters', () => {
		const result = buildSuitcaseQuery(
			{
				type: SuitcaseType.HARD_SHELL,
				wheels: WheelType.FOUR_WHEEL,
				color: 'red',
			},
			{} as SuitcaseOrderByInput
		);

		expect(result.where).toMatchObject({
			type: SuitcaseType.HARD_SHELL,
			wheels: WheelType.FOUR_WHEEL,
			color: { contains: 'red', mode: 'insensitive' },
		});
	});

	it('applies capacity and weight ranges', () => {
		const result = buildSuitcaseQuery(
			{
				maxCapacity: { min: 40 },
				maxWeight: { max: 25 },
			},
			{} as SuitcaseOrderByInput
		);

		expect(result.where).toMatchObject({
			container: {
				maxCapacity: { gte: 40 },
				maxWeight: { lte: 25 },
			},
		});
	});

	it('orders by container fields for suitcases', () => {
		const result = buildSuitcaseQuery({}, {
			orderBy: 'maxWeight',
			direction: 'asc',
		} as SuitcaseOrderByInput);

		expect(result.orderBy).toEqual({
			container: {
				maxWeight: 'asc',
			},
		});
	});
});

describe('toISO()', () => {
	it('returns ISO string from date', () => {
		const date = new Date('2024-01-01T00:00:00.000Z');

		const result = toISO(date);

		expect(result).toBe('2024-01-01T00:00:00.000Z');
	});
});
