import type { IconSvgElement } from '@hugeicons/react';
import Chip from './Chip';
import { cn } from '@shadcn-lib';

// type ChipsMode = 'single' | 'multiple';
type ChipVariant = 'default' | 'primary' | 'accent' | 'destructive';

type ChipOption<T = string> = {
	label: string;
	value: T;
	disabled?: boolean;
	icon?: IconSvgElement;
};

type BaseProps<T> = {
	options: ChipOption<T>[];
	disabled?: boolean;
	variant?: ChipVariant;
	className?: string;
	label?: string;
	description?: string;
	error?: string;
	required?: boolean;
};

type MultipleChipsProps<T> = BaseProps<T> & {
	mode?: 'multiple';
	value: T[];
	maxSelected?: number;
	minSelected?: number;
	onChange: (value: T[]) => void;
};

type SingleChipsProps<T> = BaseProps<T> & {
	mode: 'single';
	value: T | null;
	onChange: (value: T | null) => void;
};

export type ChipsProps<T> = MultipleChipsProps<T> | SingleChipsProps<T>;

const DEFAULT_MAX = 5;

const Chips = <T extends string | number>(props: ChipsProps<T>) => {
	const {
		options,
		disabled,
		variant = 'default',
		className,
		label,
		description,
		error,
		required = false,
	} = props;

	const max =
		props.mode === 'multiple'
			? (props.maxSelected ?? DEFAULT_MAX)
			: undefined;

	const min =
		props.mode === 'multiple' ? (props.minSelected ?? 0) : undefined;

	const isSelected = (optionValue: T) => {
		if (props.mode === 'single') {
			return props.value === optionValue;
		}
		return props.value.includes(optionValue);
	};

	const toggle = (optionValue: T) => {
		if (disabled) return;

		if (props.mode === 'single') {
			const newValue = props.value === optionValue ? null : optionValue;
			props.onChange(newValue);
			return;
		}

		const current = props.value;
		const isAlreadySelected = current.includes(optionValue);

		// Check max constraint
		if (!isAlreadySelected && max !== undefined && current.length >= max) {
			return;
		}

		// Check min constraint
		if (isAlreadySelected && min !== undefined && current.length <= min) {
			return;
		}

		props.onChange(
			isAlreadySelected
				? current.filter((v) => v !== optionValue)
				: [...current, optionValue]
		);
	};

	const selectedCount = props.mode === 'multiple' ? props.value.length : 0;
	const isAtMax =
		props.mode === 'multiple' && max !== undefined && selectedCount >= max;
	const isAtMin =
		props.mode === 'multiple' && min !== undefined && selectedCount <= min;

	return (
		<div className={cn('flex flex-col gap-3', className)}>
			{/* Label */}
			{label && (
				<div className="space-y-1">
					<label className="text-sm font-medium text-foreground">
						{label}
						{required && (
							<span className="ml-1 text-destructive">*</span>
						)}
					</label>
					{description && (
						<p className="text-sm text-muted-foreground">
							{description}
						</p>
					)}
				</div>
			)}

			{/* Chips Container */}
			<div
				className="flex flex-wrap gap-2"
				role={props.mode === 'single' ? 'radiogroup' : 'group'}
				aria-label={label}
				aria-required={required}
				aria-invalid={!!error}
			>
				{options.map((option) => {
					const selected = isSelected(option.value);
					const chipDisabled =
						disabled ||
						option.disabled ||
						(props.mode === 'multiple' && isAtMax && !selected) ||
						(props.mode === 'multiple' && isAtMin && selected);

					return (
						<Chip
							key={option.value}
							label={option.label}
							icon={option.icon}
							selected={selected}
							variant={variant}
							disabled={chipDisabled}
							onClick={() => toggle(option.value)}
						/>
					);
				})}
			</div>

			{/* Helper Text / Error / Counter */}
			<div className="flex items-center justify-between gap-2">
				{error ? (
					<p className="text-sm text-destructive">{error}</p>
				) : (
					<div className="flex-1" />
				)}

				{props.mode === 'multiple' &&
					(max !== undefined || min !== undefined) && (
						<p className="text-xs text-muted-foreground">
							{min !== undefined && max !== undefined
								? `Select ${min}-${max} options`
								: max !== undefined
									? `Select up to ${max}`
									: `Select at least ${min}`}
							{selectedCount > 0 &&
								` (${selectedCount} selected)`}
						</p>
					)}
			</div>
		</div>
	);
};

export default Chips;
