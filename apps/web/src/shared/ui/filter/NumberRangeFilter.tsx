'use client';

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

import { WeightUnit, VolumeUnit } from '@beggy/shared/constants';
import { NumericEntity, NumericMetric } from '@beggy/shared/types';

import useNumberRangeFilter from './useNumberRangeFilter';

/**
 * Represents a numeric range filter value.
 *
 * @remarks
 * - Both `min` and `max` are optional.
 * - If both are `undefined`, the filter is considered inactive.
 * - Designed to mirror backend filter DTO structure.
 */
type NumberRangeValue = {
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
type NumberRangeFilterProps<E extends NumericEntity> = {
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
	const {
		// state
		min,
		max,
		unit,

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
	} = useNumberRangeFilter<E>({
		value,
		entity,
		metric,
		onChange,
	});
	//* UI */
	return (
		<div className={cn('space-y-3', className)}>
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Label className="text-sm font-medium">{label}</Label>

					{/* Visual unit indicator (UX clarity) */}
					{hasUnit && selectedUnitMeta && (
						<Badge
							variant="secondary"
							className="text-sm font-medium"
						>
							{selectedUnitMeta.symbol}
						</Badge>
					)}
				</div>

				{hasUnit && selectedUnitMeta && (
					<DropdownMenu>
						<DropdownMenuTrigger>
							<Button
								variant="outline"
								size="sm"
								className="h-8 px-3 gap-2"
							>
								<span className="text-sm font-medium">
									{selectedUnitMeta.symbol}
								</span>
								<HugeiconsIcon
									icon={ChevronDown}
									className="h-4 w-4 text-muted-foreground"
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
											<span className="text-sm">
												{meta.label}
											</span>
											<span className="text-sm text-muted-foreground">
												{meta.symbol}
											</span>
										</div>

										{isActive && (
											<HugeiconsIcon
												icon={Check}
												className="h-4 w-4 text-foreground"
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
				<p className="text-sm text-muted-foreground">{description}</p>
			)}

			{/* Inputs */}
			<div className="flex gap-3">
				<Input
					type="number"
					step={step}
					inputMode={isInteger ? 'numeric' : 'decimal'}
					value={min ?? ''}
					placeholder="Min"
					className={cn(error && 'border-destructive')}
					onChange={handleMinOnChange}
				/>

				<Input
					type="number"
					step={step}
					inputMode={isInteger ? 'numeric' : 'decimal'}
					value={max ?? ''}
					placeholder="Max"
					className={cn(error && 'border-destructive')}
					onChange={handleMaxOnChange}
				/>
			</div>

			{/* Slider */}
			<Slider
				min={config.gte}
				max={config.lte}
				step={step}
				value={[safeMin, safeMax]}
				onValueChange={handleSliderOnValueChange}
			/>

			{error && (
				<p className="text-sm font-medium text-destructive">{error}</p>
			)}
		</div>
	);
};

export default NumberRangeFilter;
