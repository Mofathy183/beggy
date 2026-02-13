'use client';

import { useEffect, useMemo, useState } from 'react';
import { Slider } from '@shadcn-ui/slider';
import { Input } from '@shadcn-ui/input';
import { Label } from '@shadcn-ui/label';
import { Badge } from '@shadcn-ui/badge';
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from '@shadcn-ui/dropdown-menu';
import { Button } from '@shadcn-ui/button';
import { ChevronDown, Check } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from '@shadcn-lib';

import { NUMBER_CONFIG, WeightUnit, VolumeUnit } from '@beggy/shared/constants';
import { NumericEntity, NumericMetric } from '@beggy/shared/types';

import { WEIGHT_UNIT_META, VOLUME_UNIT_META } from '@shared/ui/mappers';

/**
 * Represents a numeric range filter value.
 *
 * @remarks
 * - Both `min` and `max` are optional.
 * - If both are `undefined`, the filter is considered inactive.
 * - Designed to mirror backend filter DTO structure.
 */
export type NumberRangeValue = {
	min?: number;
	max?: number;
};

/**
 * Props for {@link NumberRangeFilter}.
 *
 * @typeParam E - The numeric entity (bag, suitcase, item, etc).
 *
 * @remarks
 * - `entity` and `metric` must align with `NUMBER_CONFIG`.
 * - Fully controlled component.
 * - Emits normalized + clamped values only.
 */
export type NumberRangeFilterProps<E extends NumericEntity> = {
	/** Visible label displayed above the filter */
	label: string;

	/** Numeric entity key (source of config lookup) */
	entity: E;

	/** Metric belonging to the given entity */
	metric: NumericMetric<E>;

	/** Controlled range value */
	value?: NumberRangeValue;

	/**
	 * Called whenever the range changes.
	 *
	 * @remarks
	 * Emits `undefined` if both boundaries are cleared.
	 */
	onChange: (value?: NumberRangeValue) => void;

	/** Optional helper text */
	description?: string;

	/** Validation error message */
	error?: string;

	/** Additional wrapper className */
	className?: string;
};

/**
 * Generic numeric range filter component.
 *
 * @description
 * A reusable, config-driven numeric filter component backed by `NUMBER_CONFIG`.
 *
 * This component:
 * - Derives boundaries from domain config
 * - Enforces precision rules
 * - Prevents invalid values
 * - Keeps slider + inputs synchronized
 * - Optionally supports units (item weight / volume only)
 *
 * @design
 * Built as a shared UI primitive intended for filter panels across the app.
 *
 * @typeParam E - Numeric entity type
 */
const NumberRangeFilter = <E extends NumericEntity>({
	label,
	entity,
	metric,
	value,
	onChange,
	description,
	error,
	className,
}: NumberRangeFilterProps<E>) => {
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
	 * Indicates whether the current range is logically invalid.
	 *
	 * True when:
	 * - Both min and max exist
	 * - min > max
	 */
	const isRangeInvalid = min != null && max != null && min > max;

	//* UI */
	return (
		<div className={cn('space-y-3', className)}>
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Label className="text-sm font-medium">{label}</Label>

					{/* Visual unit indicator (UX clarity) */}
					{hasUnit && selectedUnitMeta && (
						<Badge variant="secondary" className="text-xs">
							{selectedUnitMeta.symbol}
						</Badge>
					)}
				</div>

				{hasUnit && selectedUnitMeta && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="outline"
								size="sm"
								className="h-8 px-3 gap-2"
							>
								<span className="text-sm">
									{selectedUnitMeta.symbol}
								</span>
								<HugeiconsIcon
									icon={ChevronDown}
									className="h-4 w-4 opacity-60"
								/>
							</Button>
						</DropdownMenuTrigger>

						<DropdownMenuContent align="end" className="w-[200px]">
							{unitMetaList.map((meta) => {
								const isActive = meta.value === unit;

								return (
									<DropdownMenuItem
										key={meta.value}
										onClick={() =>
											setUnit(
												meta.value as
													| WeightUnit
													| VolumeUnit
											)
										}
										className="flex items-center justify-between"
									>
										<div className="flex flex-col">
											<span>{meta.label}</span>
											<span className="text-xs text-muted-foreground">
												{meta.symbol}
											</span>
										</div>

										{isActive && (
											<HugeiconsIcon
												icon={Check}
												className="h-4 w-4 opacity-70"
											/>
										)}
									</DropdownMenuItem>
								);
							})}
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>

			{description && (
				<p className="text-xs text-muted-foreground">{description}</p>
			)}

			{/* Inputs */}
			<div className="flex gap-3">
				<Input
					type="number"
					step={step}
					inputMode={isInteger ? 'numeric' : 'decimal'}
					value={min ?? ''}
					placeholder="Min"
					className={cn(
						error && 'border-destructive',
						isRangeInvalid && 'border-destructive'
					)}
					onChange={(e) => {
						const val =
							e.target.value === ''
								? undefined
								: Number(e.target.value);

						setMin(val);
						emit(val, max);
					}}
				/>

				<Input
					type="number"
					step={step}
					inputMode={isInteger ? 'numeric' : 'decimal'}
					value={max ?? ''}
					placeholder="Max"
					className={cn(
						error && 'border-destructive',
						isRangeInvalid && 'border-destructive'
					)}
					onChange={(e) => {
						const val =
							e.target.value === ''
								? undefined
								: Number(e.target.value);

						setMax(val);
						emit(min, val);
					}}
				/>
			</div>

			{/* Slider */}
			<Slider
				min={config.gte}
				max={config.lte}
				step={step}
				disabled={isRangeInvalid}
				value={[safeMin, safeMax]}
				onValueChange={(vals) => {
					setMin(vals[0]);
					setMax(vals[1]);
					emit(vals[0], vals[1]);
				}}
			/>

			{error && <p className="text-xs text-destructive">{error}</p>}
		</div>
	);
};

export default NumberRangeFilter;
