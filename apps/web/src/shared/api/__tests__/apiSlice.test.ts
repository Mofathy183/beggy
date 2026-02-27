import { describe, it, expect } from 'vitest';
import { apiSlice } from '@shared/api';

vi.mock('@/env', () => ({
	env: {
		API_URL: 'https://api.example.com',
	},
}));

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
