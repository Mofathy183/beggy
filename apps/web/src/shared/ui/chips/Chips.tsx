import type { IconSvgElement } from '@hugeicons/react';
import Chip from './Chip';
import { cn } from '@shadcn-lib';

/**
 * Visual style variants passed down to individual Chip items.
 *
 * @remarks
 * These affect only selected chip appearance.
 */
type ChipVariant = 'default' | 'primary' | 'accent' | 'destructive';

/**
 * Represents a selectable chip option.
 *
 * @template T - The value type (string | number recommended).
 *
 * @remarks
 * The value must be stable and unique, as it is used for:
 * - Selection comparison
 * - React keys
 */
type ChipOption<T = string> = {
	label: string;
	value: T;
	disabled?: boolean;
	icon?: IconSvgElement;
};

/**
 * Shared props for both single and multiple modes.
 */
type BaseProps<T> = {
	options: ChipOption<T>[];

	/** Disables the entire chips group */
	disabled?: boolean;

	/** Visual variant applied to selected chips */
	variant?: ChipVariant;

	className?: string;

	/** Field label (for forms) */
	label?: string;

	/** Optional helper description text */
	description?: string;

	/** Validation error message */
	error?: string;

	/** Marks field as required (visual + aria) */
	required?: boolean;
};

/**
 * Multiple selection mode.
 *
 * @remarks
 * - Controlled component
 * - Enforces optional min/max constraints
 */
type MultipleChipsProps<T> = BaseProps<T> & {
	mode?: 'multiple';
	value: T[];
	maxSelected?: number;
	minSelected?: number;
	onChange: (value: T[]) => void;
};

/**
 * Single selection mode.
 *
 * @remarks
 * Behaves similarly to a radio group.
 */
type SingleChipsProps<T> = BaseProps<T> & {
	mode: 'single';
	value: T | null;
	onChange: (value: T | null) => void;
};

/**
 * Discriminated union based on `mode`.
 *
 * Enables strict typing:
 * - value type changes depending on mode
 * - onChange signature is enforced
 */
export type ChipsProps<T> = MultipleChipsProps<T> | SingleChipsProps<T>;

/** Default maximum selection for multiple mode */
const DEFAULT_MAX = 5;

/**
 * Chips Component
 *
 * @description
 * A controlled, accessible selection group built on top of Chip.
 *
 * Supports:
 * - Single selection (radio-like behavior)
 * - Multiple selection with constraints
 * - Form labeling & validation states
 *
 * @designPrinciples
 * - Controlled state only (no internal selection state)
 * - Clear separation of constraint logic
 * - Accessibility-first structure
 * - UX guardrails for min/max selection
 */
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

	/**
	 * Resolve max constraint only in multiple mode.
	 * Falls back to DEFAULT_MAX if not specified.
	 */
	const max =
		props.mode === 'multiple'
			? (props.maxSelected ?? DEFAULT_MAX)
			: undefined;

	/**
	 * Resolve min constraint only in multiple mode.
	 * Defaults to 0 (no minimum).
	 */
	const min =
		props.mode === 'multiple' ? (props.minSelected ?? 0) : undefined;

	/**
	 * Determines whether a given option is currently selected.
	 *
	 * Abstracted to avoid repeating mode checks.
	 */
	const isSelected = (optionValue: T) => {
		if (props.mode === 'single') {
			return props.value === optionValue;
		}
		return props.value.includes(optionValue);
	};

	/**
	 * Handles selection toggle logic.
	 *
	 * @remarks
	 * Enforces:
	 * - Disabled state
	 * - Max selection constraint
	 * - Min selection constraint
	 *
	 * UX Principle:
	 * Invalid actions are prevented silently instead of throwing errors.
	 */
	const toggle = (optionValue: T) => {
		if (disabled) return;

		// SINGLE MODE
		if (props.mode === 'single') {
			const newValue = props.value === optionValue ? null : optionValue;

			props.onChange(newValue);
			return;
		}

		// MULTIPLE MODE
		const current = props.value;
		const isAlreadySelected = current.includes(optionValue);

		// 🚫 Prevent exceeding max
		if (!isAlreadySelected && max !== undefined && current.length >= max) {
			return;
		}

		// 🚫 Prevent dropping below min
		if (isAlreadySelected && min !== undefined && current.length <= min) {
			return;
		}

		props.onChange(
			isAlreadySelected
				? current.filter((v) => v !== optionValue)
				: [...current, optionValue]
		);
	};

	/**
	 * Derived state for UX hints.
	 */
	const selectedCount = props.mode === 'multiple' ? props.value.length : 0;

	const isAtMax =
		props.mode === 'multiple' && max !== undefined && selectedCount >= max;

	const isAtMin =
		props.mode === 'multiple' && min !== undefined && selectedCount <= min;

	return (
		<div className={cn('flex flex-col gap-3', className)}>
			{/* =========================
                Label & Description Block
			   ========================= */}
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

			{/* =========================
                Chips Container
                =========================
                Accessibility:
                - radiogroup for single mode
                - group for multiple mode
			*/}
			<div
				className="flex flex-wrap gap-2"
				role={props.mode === 'single' ? 'radiogroup' : 'group'}
				aria-label={label}
				aria-required={required}
				aria-invalid={!!error}
			>
				{options.map((option) => {
					const selected = isSelected(option.value);

					/**
					 * Disable logic per chip:
					 * - Global disabled
					 * - Option-level disabled
					 * - Max constraint reached
					 * - Min constraint reached
					 */
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

			{/* =========================
                Error / Helper / Counter
			   ========================= */}
			<div className="flex items-center justify-between gap-2">
				{error ? (
					<p className="text-sm text-destructive">{error}</p>
				) : (
					<div className="flex-1" />
				)}

				{/* Constraint hint text */}
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
