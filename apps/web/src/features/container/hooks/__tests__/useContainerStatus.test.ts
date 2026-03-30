import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

import { WeightUnit, VolumeUnit } from '@beggy/shared/constants';
import useContainerStatus from '../useContainerStatus';

// Mock shared logic (boundary)
const buildMetricsMock = vi.fn();
const buildStateMock = vi.fn();

vi.mock('@beggy/shared/containers', () => ({
	buildContainerMetrics: (...args: any[]) => buildMetricsMock(...args),
	buildContainerState: (...args: any[]) => buildStateMock(...args),
}));

describe('useContainerStatus()', () => {
	const baseParams = {
		items: [],
		maxWeight: 10,
		maxCapacity: 20,
		containerWeight: 1,
		enabled: true,
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns null when disabled', () => {
		const { result } = renderHook(() =>
			useContainerStatus({
				...baseParams,
				enabled: false,
			})
		);

		expect(result.current).toBeNull();
		expect(buildMetricsMock).not.toHaveBeenCalled();
	});

	it('returns null when maxWeight is zero', () => {
		const { result } = renderHook(() =>
			useContainerStatus({
				...baseParams,
				maxWeight: 0,
			})
		);

		expect(result.current).toBeNull();
		expect(buildMetricsMock).not.toHaveBeenCalled();
	});

	it('returns null when maxCapacity is zero', () => {
		const { result } = renderHook(() =>
			useContainerStatus({
				...baseParams,
				maxCapacity: 0,
			})
		);

		expect(result.current).toBeNull();
		expect(buildMetricsMock).not.toHaveBeenCalled();
	});

	it('returns computed metrics and state when inputs are valid', () => {
		const metrics = { totalWeight: 5 };
		const state = { status: 'OK' };

		buildMetricsMock.mockReturnValue(metrics);
		buildStateMock.mockReturnValue(state);

		const { result } = renderHook(() => useContainerStatus(baseParams));

		expect(buildMetricsMock).toHaveBeenCalledWith({
			items: baseParams.items,
			containerWeight: baseParams.containerWeight,
			maxWeight: baseParams.maxWeight,
			maxCapacity: baseParams.maxCapacity,
		});

		expect(buildStateMock).toHaveBeenCalledWith(metrics, {
			maxWeight: baseParams.maxWeight,
			maxCapacity: baseParams.maxCapacity,
		});

		expect(result.current).toEqual({
			metrics,
			state,
		});
	});

	it('uses latest items when reference changes', () => {
		const firstItems: any[] = [
			{
				quantity: 1,
				item: {
					weight: 1,
					weightUnit: 'kg',
					volume: 1,
					volumeUnit: 'l',
				},
			},
		];
		const secondItems = [...firstItems]; // new reference, same content

		const metrics = { totalWeight: 5 };
		const state = { status: 'OK' };

		buildMetricsMock.mockReturnValue(metrics);
		buildStateMock.mockReturnValue(state);

		const { rerender } = renderHook(
			({ items }) =>
				useContainerStatus({
					...baseParams,
					items,
				}),
			{
				initialProps: { items: firstItems },
			}
		);

		rerender({ items: secondItems });

		expect(buildMetricsMock).toHaveBeenLastCalledWith(
			expect.objectContaining({
				items: secondItems,
			})
		);
	});

	it('recomputes when primitive inputs change', () => {
		const metrics = { totalWeight: 5 };
		const state = { status: 'OK' };

		buildMetricsMock.mockReturnValue(metrics);
		buildStateMock.mockReturnValue(state);

		const { rerender } = renderHook(
			({ maxWeight }) =>
				useContainerStatus({
					...baseParams,
					maxWeight,
				}),
			{
				initialProps: { maxWeight: 10 },
			}
		);

		rerender({ maxWeight: 15 });

		expect(buildMetricsMock).toHaveBeenCalledTimes(2);
	});

	it('does not recompute when items content is identical', () => {
		const items = [
			{
				quantity: 1,
				item: {
					weight: 1,
					weightUnit: WeightUnit.KILOGRAM,
					volume: 1,
					volumeUnit: VolumeUnit.LITER,
				},
			},
		];

		const metrics = { totalWeight: 5 };
		const state = { status: 'OK' };

		buildMetricsMock.mockReturnValue(metrics);
		buildStateMock.mockReturnValue(state);

		const { rerender } = renderHook(
			({ items }) =>
				useContainerStatus({
					...baseParams,
					items,
				}),
			{
				initialProps: { items },
			}
		);

		// new reference, same content
		rerender({ items: [...items] });

		// should NOT recompute because fingerprint is same
		expect(buildMetricsMock).toHaveBeenCalledTimes(1);
	});
});
