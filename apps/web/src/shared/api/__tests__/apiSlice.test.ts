import { describe, it, expect } from 'vitest';
import { apiSlice } from '@shared/api';

describe('apiSlice', () => {
	it('uses "api" as the reducer path', () => {
		expect(apiSlice.reducerPath).toBe('api');
	});

	it('exposes generated hooks for injected endpoints', () => {
		const extendedApi = apiSlice.injectEndpoints({
			endpoints: (builder) => ({
				testEndpoint: builder.query<string, void>({
					query: () => '/test',
				}),
			}),
		});

		expect(extendedApi).toHaveProperty('useTestEndpointQuery');
	});

	it('allows feature APIs to inject endpoints', () => {
		const extendedApi = apiSlice.injectEndpoints({
			endpoints: (builder) => ({
				testEndpoint: builder.query<string, void>({
					query: () => '/test',
				}),
			}),
		});

		expect(extendedApi.endpoints).toHaveProperty('testEndpoint');
	});
});
