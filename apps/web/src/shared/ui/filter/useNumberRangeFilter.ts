import { useEffect, useMemo, useState } from 'react';
import { NUMBER_CONFIG, WeightUnit, VolumeUnit } from '@beggy/shared/constants';
import {
	NumericEntity,
	NumericMetric,
	NumberFieldConfig,
} from '@beggy/shared/types';

import {
	WEIGHT_UNIT_META,
	VOLUME_UNIT_META,
	UnitMeta,
} from '@shared/ui/mappers';

/**
 * Represents a numeric range filter value.
 *
 * @remarks
 * - Both `min` and `max` are optional.
 * - If both are `undefined`, the filter is considered inactive.
 * - Mirrors backend filter DTO structure to ensure payload consistency.
 */
export type NumberRangeValue = {
	min?: number;
	max?: number;
};

/**
 * Configuration options for {@link useNumberRangeFilter}.
 *
 * @typeParam E - The numeric entity type (bag, suitcase, item, etc.)
 *
 * @remarks
 * This hook is fully controlled:
 * - `value` is treated as the source of truth.
 * - Internal state mirrors `value` for smoother UI interactions.
 */
type UseNumberRangeFilterOptions<E extends NumericEntity> = {
	/** Numeric entity key used for config lookup */
	entity: E;

	/** Metric belonging to the given entity */
	metric: NumericMetric<E>;

	/** Controlled range value */
	value?: NumberRangeValue;

	/**
	 * Triggered whenever the normalized range changes.
	 *
	 * @remarks
	 * - Emits `undefined` when both boundaries are cleared.
	 * - Always emits clamped and precision-normalized values.
	 */
	onChange: (value?: NumberRangeValue) => void;
};

/**
 * Result returned by {@link useNumberRangeFilter}.
 *
 * @remarks
 * Exposes:
 * - Internal state (min, max, unit)
 * - Derived domain properties (step, precision, boundaries)
 * - UI-safe values for slider
 * - Stable event handlers
 */
type UseNumberRangeFilterResult = {
	/** Current minimum boundary (controlled mirror) */
	min?: number;

	/** Current maximum boundary (controlled mirror) */
	max?: number;

	/** Currently selected unit (visual only) */
	unit?: WeightUnit | VolumeUnit;

	/**
	 * Numeric field configuration derived from `NUMBER_CONFIG`.
	 *
	 * @remarks
	 * Provides:
	 * - Domain boundaries (`gte`, `lte`)
	 * - Decimal precision rules
	 *
	 * Exposed so the UI layer can:
	 * - Configure slider limits
	 * - Display correct numeric constraints
	 */
	config: NumberFieldConfig;

	/**
	 * Available unit metadata for the current entity + metric.
	 *
	 * @remarks
	 * - Empty array if units are not supported.
	 * - Readonly to prevent accidental mutation.
	 */
	unitMetaList: readonly UnitMeta<WeightUnit | VolumeUnit>[];

	/** Whether this metric supports unit selection */
	hasUnit: boolean;

	/** Metadata for currently selected unit */
	selectedUnitMeta?: { label: string; symbol: string; value: any };

	/** Indicates if the metric allows only integer values */
	isInteger: boolean;

	/** Step value derived from decimal precision */
	step: number;

	/** Slider-safe minimum value (never undefined) */
	safeMin: number;

	/** Slider-safe maximum value (never undefined) */
	safeMax: number;

	/** Updates selected unit */
	setUnit: (unit: WeightUnit | VolumeUnit) => void;

	/** Handles changes to the minimum input field */
	handleMinOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

	/** Handles changes to the maximum input field */
	handleMaxOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

	/** Handles slider range updates */
	handleSliderOnValueChange: (value: number | readonly number[]) => void;
};

/**
 * useNumberRangeFilter
 *
 * @description
 * A domain-aware state machine for numeric range filtering.
 *
 * @design
 * - Config-driven (backed by `NUMBER_CONFIG`)
 * - Precision-safe (respects decimal rules)
 * - Boundary-safe (clamped to domain limits)
 * - Fully controlled
 * - UI-synchronized (slider + inputs stay in sync)
 *
 * @architecture
 * This hook isolates domain and state logic from the UI layer,
 * keeping `NumberRangeFilter` purely declarative.
 *
 * @typeParam E - Numeric entity type
 */
const useNumberRangeFilter = <E extends NumericEntity>({
	value,
	entity,
	metric,
	onChange,
}: UseNumberRangeFilterOptions<E>): UseNumberRangeFilterResult => {
	/**
	 * Retrieve numeric configuration from the single source of truth.
	 *
	 * This ensures:
	 * - UI boundaries always match backend validation
	 * - Decimals are consistent across app
	 */
	const config = NUMBER_CONFIG[entity][metric];

	//* Units */
	/**
	 * Units are only supported for:
	 * - item.weight
	 * - item.volume
	 *
	 * Domain-driven decision:
	 * Bag and suitcase values are assumed fixed base units.
	 */
	const isItem = entity === 'item';
	const isWeight = isItem && metric === 'weight';
	const isVolume = isItem && metric === 'volume';
	const hasUnit = isWeight || isVolume;

	/**
	 * Derive available unit metadata.
	 *
	 * Memoized for performance stability.
	 */
	const unitMetaList = useMemo(() => {
		if (isWeight) return WEIGHT_UNIT_META;
		if (isVolume) return VOLUME_UNIT_META;
		return [];
	}, [isWeight, isVolume]);

	/**
	 * Default unit selection.
	 *
	 * Note:
	 * Currently visual only (no conversion logic).
	 */
	const defaultUnit = unitMetaList[0]?.value;

	const [unit, setUnit] = useState<WeightUnit | VolumeUnit | undefined>(
		defaultUnit
	);

	const selectedUnitMeta = useMemo(
		() => unitMetaList.find((u) => u.value === unit),
		[unitMetaList, unit]
	);

	//* Range State */
	/**
	 * Internal state mirrors controlled value.
	 *
	 * Why?
	 * - Allows smooth slider + input typing
	 * - Prevents jitter during parent updates
	 */
	const [min, setMin] = useState<number | undefined>(value?.min);
	const [max, setMax] = useState<number | undefined>(value?.max);

	/**
	 * Sync internal state when parent value changes.
	 */
	useEffect(() => {
		setMin(value?.min);
		setMax(value?.max);
	}, [value]);

	//* Precision Logic */

	/**
	 * Determine if this metric is integer-only.
	 *
	 * Used to:
	 * - Control inputMode (better mobile UX)
	 * - Ensure step is 1
	 */
	const isInteger = config.decimals === 0;

	/**
	 * Slider/Input step derived from config decimals.
	 *
	 * decimals = 0 → 1
	 * decimals = 2 → 0.01
	 */
	const step = useMemo(() => {
		if (config.decimals === 0) return 1;
		return 1 / 10 ** config.decimals;
	}, [config.decimals]);

	/**
	 * Clamp value within allowed domain boundaries.
	 *
	 * Prevents UI from drifting outside backend validation.
	 */
	const clamp = (val?: number) => {
		if (val == null) return undefined;
		return Math.min(Math.max(val, config.gte), config.lte);
	};

	/**
	 * Normalize value to allowed decimal precision.
	 *
	 * Ensures:
	 * - Clean values
	 * - No floating point drift
	 * - Predictable filter payload
	 */
	const normalize = (val?: number) => {
		if (val == null) return undefined;
		const factor = 10 ** config.decimals;
		return Math.round(val * factor) / factor;
	};

	/**
	 * Emit sanitized value to parent.
	 *
	 * Processing order:
	 * 1. Clamp
	 * 2. Normalize
	 * 3. Emit undefined if empty
	 */
	const emit = (nextMin?: number, nextMax?: number) => {
		const clampedMin = clamp(nextMin);
		const clampedMax = clamp(nextMax);

		const normalizedMin = normalize(clampedMin);
		const normalizedMax = normalize(clampedMax);

		// Prevent emitting invalid range
		if (
			normalizedMin != null &&
			normalizedMax != null &&
			normalizedMin > normalizedMax
		) {
			return;
		}

		if (normalizedMin == null && normalizedMax == null) {
			onChange(undefined);
			return;
		}

		onChange({
			min: normalizedMin,
			max: normalizedMax,
		});
	};

	/**
	 * Safe slider fallback values.
	 *
	 * Slider must always be controlled.
	 */
	const safeMin = min ?? config.gte;
	const safeMax = max ?? config.lte;

	/**
	 * Handles manual changes to the minimum input field.
	 *
	 * @remarks
	 * - Converts empty string to `undefined` to represent an unset boundary.
	 * - Prevents invalid state where `min > max`.
	 * - Emits the updated range immediately to keep parent state in sync.
	 *
	 * @param e - The change event from the minimum input field.
	 */
	const handleMinOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		// Convert input value:
		// - "" → undefined (represents no boundary)
		// - string number → numeric value
		const val = e.target.value === '' ? undefined : Number(e.target.value);

		// 🚫 Guard against invalid range:
		// Prevent setting min greater than current max
		if (val != null && max != null && val > max) {
			return;
		}

		setMin(val);
		emit(val, max);
	};
	/**
	 * Handles manual changes to the maximum input field.
	 *
	 * @remarks
	 * - Converts empty string to `undefined` to represent an unset boundary.
	 * - Prevents invalid state where `min > max`.
	 * - Emits the updated range immediately to keep parent state in sync.
	 *
	 * @param e - The change event from the maximum input field.
	 */
	const handleMaxOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		// Convert input value:
		// - "" → undefined (represents no boundary)
		// - string number → numeric value
		const val = e.target.value === '' ? undefined : Number(e.target.value);

		// 🚫 Guard against invalid range:
		// Prevent setting max smaller than current min
		if (min != null && val != null && min > val) {
			return;
		}

		setMax(val);
		emit(min, val);
	};

	/**
	 * Handles slider range updates.
	 *
	 * @remarks
	 * - Accepts both single-value and range modes (Slider API contract).
	 * - Safely narrows to range mode (`[min, max]`).
	 * - Prevents invalid state where `min > max`.
	 * - Synchronizes local state and emits normalized values.
	 *
	 * @param value - The value emitted by the Slider component.
	 * May be a single number or a readonly number tuple.
	 */
	const handleSliderOnValueChange = (value: number | readonly number[]) => {
		// Ensure slider is operating in range mode
		if (!Array.isArray(value) || value.length !== 2) return;

		const [nextMin, nextMax] = value;

		// 🚫 Guard against impossible slider state
		if (nextMin > nextMax) return;

		setMin(nextMin);
		setMax(nextMax);
		emit(nextMin, nextMax);
	};

	return {
		// state
		min,
		max,
		unit,

		// configuration
		config,
		unitMetaList,

		// derived
		hasUnit,
		selectedUnitMeta,
		isInteger,
		step,
		safeMin,
		safeMax,

		// actions
		setUnit,
		handleMinOnChange,
		handleMaxOnChange,
		handleSliderOnValueChange,
	};
};

export default useNumberRangeFilter;
