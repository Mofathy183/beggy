import { describe, it, expect } from 'vitest';
import {
	buildUserQuery,
	buildProfileQuery,
	buildBagQuery,
	buildItemQuery,
	buildSuitcaseQuery,
	formatValidationError,
} from '@shared/utils';
import {
	BagType,
	Role,
	SuitcaseType,
	WheelType,
} from '@beggy/shared/constants';
import type {
	UserOrderByInput,
	ProfileOrderByInput,
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

describe('buildUserQuery()', () => {
	it('builds a query with basic scalar filters', () => {
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

	it('applies a createdAt date range when provided', () => {
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

	it('falls back to createdAt ordering when orderBy is undefined', () => {
		const result = buildUserQuery({}, {} as UserOrderByInput);

		expect(result.orderBy).toEqual({
			createdAt: 'asc',
		});
	});
});

describe('buildProfileQuery()', () => {
	it('applies case-insensitive text filters', () => {
		const result = buildProfileQuery(
			{
				city: 'cairo',
				country: 'egypt',
			},
			{} as ProfileOrderByInput
		);

		expect(result.where).toMatchObject({
			city: { contains: 'cairo', mode: 'insensitive' },
			country: { contains: 'egypt', mode: 'insensitive' },
		});
	});

	it('applies a createdAt date range', () => {
		const from = new Date();

		const result = buildProfileQuery(
			{
				createdAt: { from },
			},
			{} as ProfileOrderByInput
		);

		expect(result.where.createdAt).toEqual({
			gte: from,
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

	it('builds independent numeric ranges for weight and volume', () => {
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
});

describe('buildSuitcaseQuery()', () => {
	it('applies suitcase-specific categorical filters', () => {
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
});
