import { PaginationParams } from '@beggy/shared/types';
import type { FetchArgs } from '@reduxjs/toolkit/query/react';

export const serializeParams = (
	args: string | FetchArgs
): string | FetchArgs => {
	if (typeof args === 'string') return args;
	if (!args.params) return args;

	const { filters, orderBy, pagination, ...rest } = args.params as any;

	return {
		...args,
		params: {
			...rest,

			// ✅ flatten filters
			...(filters ?? {}),

			// ✅ flatten orderBy
			...(orderBy && {
				orderBy: orderBy.orderBy,
				direction: orderBy.direction,
			}),

			// ✅ flatten pagination
			...(pagination && {
				page: pagination.page,
				limit: pagination.limit,
			}),
		},
	};
};

type FilterInput = Record<string, any>;

type ListParamsInput<F, O> = {
	filters?: F;
	orderBy?: O;
	pagination: PaginationParams;
};

export const normalizeFilters = <F extends FilterInput>(
	filters?: F
): F | undefined => {
	if (!filters) return undefined;

	const cleaned = Object.entries(filters).reduce<Record<string, any>>(
		(acc, [key, value]) => {
			if (value === undefined || value === null) return acc;

			// strings
			if (typeof value === 'string') {
				const trimmed = value.trim();
				if (!trimmed) return acc;
				acc[key] = trimmed;
				return acc;
			}

			// arrays
			if (Array.isArray(value)) {
				if (value.length === 0) return acc;
				acc[key] = value;
				return acc;
			}

			// objects (dateRange, numberRange)
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

/**
 * buildListParams
 *
 * Produces API-ready list query params using shared contracts.
 */
export const buildListParams = <F, O>({
	filters,
	orderBy,
	pagination,
}: ListParamsInput<F, O>) => {
	return {
		...(normalizeFilters(filters ?? {}) && {
			filters: normalizeFilters(filters ?? {}),
		}),
		...(orderBy && { orderBy }),
		pagination,
	};
};
