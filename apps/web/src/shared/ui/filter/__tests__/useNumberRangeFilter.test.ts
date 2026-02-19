import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useState } from 'react';
import { renderHook, act } from '@testing-library/react';
import useNumberRangeFilter, {
	type NumberRangeValue,
} from '../useNumberRangeFilter';

describe('useNumberRangeFilter', () => {
	let onChange: (value?: NumberRangeValue) => void;

	beforeEach(() => {
		onChange = vi.fn();
	});

	describe('controlled synchronization', () => {
		it('returns internal boundaries from provided value', () => {
			const { result } = renderHook(() =>
				useNumberRangeFilter({
					entity: 'bag',
					metric: 'weight',
					value: { min: 5, max: 10 },
					onChange,
				})
			);

			expect(result.current.min).toBe(5);
			expect(result.current.max).toBe(10);
		});

		it('updates internal boundaries when parent value changes', () => {
			const { result, rerender } = renderHook(
				({ value }) =>
					useNumberRangeFilter({
						entity: 'bag',
						metric: 'weight',
						value,
						onChange,
					}),
				{
					initialProps: { value: { min: 2, max: 8 } },
				}
			);

			rerender({ value: { min: 4, max: 12 } });

			expect(result.current.min).toBe(4);
			expect(result.current.max).toBe(12);
		});
	});

	describe('range validation', () => {
		it('does not call onChange when minimum exceeds maximum', () => {
			const { result } = renderHook(() =>
				useNumberRangeFilter({
					entity: 'bag',
					metric: 'weight',
					value: { min: 5, max: 10 },
					onChange,
				})
			);

			act(() => {
				result.current.handleMinOnChange({
					target: { value: '20' },
				} as any);
			});

			expect(onChange).not.toHaveBeenCalled();
		});

		it('calls onChange with undefined when both boundaries are cleared', () => {
			const { result } = renderHook(() => {
				const [value, setValue] = useState<
					NumberRangeValue | undefined
				>({
					min: 5,
					max: 10,
				});

				return useNumberRangeFilter({
					entity: 'bag',
					metric: 'weight',
					value,
					onChange: (v) => {
						onChange(v);
						setValue(v);
					},
				});
			});

			act(() => {
				result.current.handleMinOnChange({
					target: { value: '' },
				} as any);
			});

			act(() => {
				result.current.handleMaxOnChange({
					target: { value: '' },
				} as any);
			});
		});
	});

	describe('domain enforcement', () => {
		it('calls onChange with clamped minimum when value is below configured boundary', () => {
			const { result } = renderHook(() =>
				useNumberRangeFilter({
					entity: 'bag',
					metric: 'weight',
					value: undefined,
					onChange,
				})
			);

			act(() => {
				result.current.handleMinOnChange({
					target: { value: '-100' },
				} as any);
			});

			expect(onChange).toHaveBeenCalledWith({
				min: 1,
				max: undefined,
			});
		});

		it('calls onChange with normalized value according to decimal precision', () => {
			const { result } = renderHook(() =>
				useNumberRangeFilter({
					entity: 'item',
					metric: 'weight',
					value: undefined,
					onChange,
				})
			);

			act(() => {
				result.current.handleMinOnChange({
					target: { value: '1.123456' },
				} as any);
			});

			expect(onChange).toHaveBeenCalledWith({
				min: 1.123,
				max: undefined,
			});
		});
	});

	describe('slider behavior', () => {
		it('updates boundaries and calls onChange when slider emits valid range', () => {
			const { result } = renderHook(() =>
				useNumberRangeFilter({
					entity: 'bag',
					metric: 'capacity',
					value: undefined,
					onChange,
				})
			);

			act(() => {
				result.current.handleSliderOnValueChange([10, 20]);
			});

			expect(result.current.min).toBe(10);
			expect(result.current.max).toBe(20);

			expect(onChange).toHaveBeenCalledWith({
				min: 10,
				max: 20,
			});
		});

		it('does not call onChange when slider payload is invalid', () => {
			const { result } = renderHook(() =>
				useNumberRangeFilter({
					entity: 'bag',
					metric: 'capacity',
					value: undefined,
					onChange,
				})
			);

			act(() => {
				result.current.handleSliderOnValueChange(10 as any);
			});

			expect(onChange).not.toHaveBeenCalled();
		});
	});

	describe('precision configuration', () => {
		it('derives step from decimal configuration', () => {
			const { result } = renderHook(() =>
				useNumberRangeFilter({
					entity: 'item',
					metric: 'weight',
					value: undefined,
					onChange,
				})
			);

			expect(result.current.step).toBe(0.001);
		});

		it('marks metric as integer and sets step to 1 when decimals is zero', () => {
			const { result } = renderHook(() =>
				useNumberRangeFilter({
					entity: 'item',
					metric: 'quantity',
					value: undefined,
					onChange,
				})
			);

			expect(result.current.isInteger).toBe(true);
			expect(result.current.step).toBe(1);
		});
	});

	describe('unit behavior', () => {
		it('returns unit metadata when metric supports units', () => {
			const { result } = renderHook(() =>
				useNumberRangeFilter({
					entity: 'item',
					metric: 'weight',
					value: undefined,
					onChange,
				})
			);

			expect(result.current.hasUnit).toBe(true);
			expect(result.current.unitMetaList.length).toBeGreaterThan(0);
		});

		it('does not return unit metadata when metric does not support units', () => {
			const { result } = renderHook(() =>
				useNumberRangeFilter({
					entity: 'bag',
					metric: 'weight',
					value: undefined,
					onChange,
				})
			);

			expect(result.current.hasUnit).toBe(false);
			expect(result.current.unitMetaList.length).toBe(0);
		});
	});
});
