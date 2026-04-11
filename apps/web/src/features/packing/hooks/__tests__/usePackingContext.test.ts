import { describe, it, expect } from 'vitest';
import { waitFor, act } from '@testing-library/react';

import { renderHookWithStore } from '@tests';
import { ContainerType } from '@beggy/shared/constants';
import usePackingContext from '../usePackingContext';
import {
	setPackingContext,
	type PackingContext,
} from '@features/packing/store';

describe('usePackingContext', () => {
	it('returns null when packing context is not set in the store', () => {
		const { result } = renderHookWithStore(() => usePackingContext(), {
			preloadedState: {
				packing: {
					context: null,
				},
			} as any,
		});

		expect(result.current).toBeNull();
	});

	it('returns packing context from the store when it exists', () => {
		const mockContext: PackingContext = {
			containerId: 'container-1',
			containerName: 'My Backpack',
			containerType: ContainerType.BAG,
			sourceId: 'bag-1',
			maxWeight: 10,
			maxCapacity: 20,
			weightUnit: 'kg',
			capacityUnit: 'L',
		};

		const { result } = renderHookWithStore(() => usePackingContext(), {
			preloadedState: {
				packing: {
					context: mockContext,
				},
			} as any,
		});

		expect(result.current).toEqual(mockContext);
	});

	it('returns updated packing context when the store changes', async () => {
		const initialContext: PackingContext = {
			containerId: 'container-1',
			containerName: 'Old Name',
			containerType: ContainerType.BAG,
			sourceId: 'bag-1',
			maxWeight: 10,
			maxCapacity: 20,
			weightUnit: 'kg',
			capacityUnit: 'L',
		};

		const updatedContext: PackingContext = {
			...initialContext,
			containerName: 'Updated Name',
		};

		const { result, store } = renderHookWithStore(
			() => usePackingContext(),
			{
				preloadedState: {
					packing: {
						context: initialContext,
					},
				} as any,
			}
		);

		expect(result.current).toEqual(initialContext);

		act(() => {
			store.dispatch(setPackingContext(updatedContext));
		});

		await waitFor(() => {
			expect(result.current).toEqual(updatedContext);
		});
	});
});
