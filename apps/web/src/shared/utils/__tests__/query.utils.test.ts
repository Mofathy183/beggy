import { describe, it, expect } from 'vitest';
import type { FetchArgs } from '@reduxjs/toolkit/query';
import { serializeParams } from '../query.utils';

describe('[unit] serializeParams', () => {
	describe('given args is a string', () => {
		it('should return the same string unchanged', () => {
			const result = serializeParams('/bags');

			expect(result).toBe('/bags');
		});
	});

	describe('given args is FetchArgs without params', () => {
		it('should return the args object unchanged', () => {
			const args: FetchArgs = {
				url: '/bags',
			};

			const result = serializeParams(args);

			expect(result).toEqual(args);
		});
	});

	describe('given params contains filters', () => {
		it('should flatten filters into the root params object', () => {
			const args: FetchArgs = {
				url: '/bags',
				params: {
					filters: {
						category: 'travel',
						active: true,
					},
				},
			};

			const result = serializeParams(args) as FetchArgs;

			expect(result.params).toEqual({
				category: 'travel',
				active: true,
			});
		});
	});

	describe('given params contains orderBy', () => {
		it('should flatten orderBy into orderBy and direction fields', () => {
			const args: FetchArgs = {
				url: '/bags',
				params: {
					orderBy: {
						orderBy: 'createdAt',
						direction: 'desc',
					},
				},
			};

			const result = serializeParams(args) as FetchArgs;

			expect(result.params).toEqual({
				orderBy: 'createdAt',
				direction: 'desc',
			});
		});
	});

	describe('given params contains pagination', () => {
		it('should flatten pagination into page and limit fields', () => {
			const args: FetchArgs = {
				url: '/bags',
				params: {
					pagination: {
						page: 2,
						limit: 20,
					},
				},
			};

			const result = serializeParams(args) as FetchArgs;

			expect(result.params).toEqual({
				page: 2,
				limit: 20,
			});
		});
	});

	describe('given params contains filters, orderBy and pagination', () => {
		it('should flatten all supported nested fields into the root params object', () => {
			const args: FetchArgs = {
				url: '/bags',
				params: {
					search: 'leather',
					filters: { category: 'travel' },
					orderBy: {
						orderBy: 'createdAt',
						direction: 'asc',
					},
					pagination: {
						page: 1,
						limit: 10,
					},
				},
			};

			const result = serializeParams(args) as FetchArgs;

			expect(result.params).toEqual({
				search: 'leather',
				category: 'travel',
				orderBy: 'createdAt',
				direction: 'asc',
				page: 1,
				limit: 10,
			});
		});
	});

	describe('given a FetchArgs object', () => {
		it('should not mutate the original args object', () => {
			const args: FetchArgs = {
				url: '/bags',
				params: {
					filters: { category: 'travel' },
				},
			};

			const clone = structuredClone(args);

			serializeParams(args);

			expect(args).toEqual(clone);
		});
	});
});
