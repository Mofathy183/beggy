import type { FetchArgs } from '@reduxjs/toolkit/query/react';
import type { PaginationParams } from '@beggy/shared/types';

type Primitive = string | number | boolean;
type FlatParams = Record<string, Primitive>;
type NestedValue = Primitive | NestedObject | NestedValue[];
type NestedObject = { [key: string]: NestedValue };

/**
 * Flattens nested objects using dot notation.
 * { volume: { min: 1, max: 5 } } → { 'volume.min': 1, 'volume.max': 5 }
 */
const flattenWithDots = (obj: NestedObject, prefix = ''): FlatParams => {
	return Object.entries(obj).reduce<FlatParams>((acc, [key, value]) => {
		const fullKey = prefix ? `${prefix}.${key}` : key;

		if (value === null || value === undefined) return acc;

		// Serialize Date objects to ISO strings at the network boundary
		if (value instanceof Date) {
			acc[fullKey] = value.toISOString();
			return acc;
		}

		if (typeof value === 'object' && !Array.isArray(value)) {
			Object.assign(acc, flattenWithDots(value as NestedObject, fullKey));
		} else if (!Array.isArray(value)) {
			acc[fullKey] = value as Primitive;
		}

		return acc;
	}, {});
};

type FilterInput = Record<string, NestedValue>;

type ListParamsInput<F, O> = {
	filters?: F;
	orderBy?: O;
	pagination: PaginationParams;
};

export const normalizeFilters = <F extends FilterInput>(
	filters?: F
): F | undefined => {
	if (!filters) return undefined;

	const cleaned = Object.entries(filters).reduce<FilterInput>(
		(acc, [key, value]) => {
			if (value === undefined || value === null) return acc;

			// Date at the top level — convert to ISO string
			if (value instanceof Date) {
				acc[key] = value.toISOString();
				return acc;
			}

			if (typeof value === 'string') {
				const trimmed = value.trim();
				if (!trimmed) return acc;
				acc[key] = trimmed;
				return acc;
			}

			if (Array.isArray(value)) {
				if (value.length === 0) return acc;
				acc[key] = value;
				return acc;
			}

			if (typeof value === 'object') {
				if (Object.keys(value).length === 0) return acc;
				acc[key] = value;
				return acc;
			}

			acc[key] = value;
			return acc;
		},
		{}
	);

	return Object.keys(cleaned).length ? (cleaned as F) : undefined;
};

export const buildListParams = <F, O>({
	filters,
	orderBy,
	pagination,
}: ListParamsInput<F, O>) => {
	const normalizedFilters = normalizeFilters(filters as FilterInput);

	return {
		...(normalizedFilters && { filters: normalizedFilters }),
		...(orderBy && { orderBy }),

		// ✅ CRITICAL: flatten pagination
		page: pagination.page,
		limit: pagination.limit,
	};
};

export const serializeParams = (
	args: string | FetchArgs
): string | FetchArgs => {
	if (typeof args === 'string') return args;
	if (!args.params) return args;

	const { filters, orderBy, pagination, ...rest } = args.params as {
		filters?: FilterInput;
		orderBy?: { orderBy: string; direction: string };
		pagination?: PaginationParams;
		[key: string]: unknown;
	};

	const normalizedFilters = normalizeFilters(filters);

	const rawParams: FlatParams = {
		...(rest as FlatParams),
		...(normalizedFilters ? flattenWithDots(normalizedFilters) : {}),
		...(orderBy && {
			orderBy: orderBy.orderBy,
			direction: orderBy.direction,
		}),
		...(pagination && {
			page: pagination.page != null && pagination.page,
			limit: pagination.limit != null && pagination.limit,
		}),
	};

	return { ...args, params: rawParams };
};
