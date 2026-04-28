'use client';

import { useState } from 'react';
import {
	Controller,
	type Control,
	type FieldErrors,
	type FieldValues,
	type Path,
} from 'react-hook-form';

import { Input } from '@shadcn-ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@shadcn-ui/select';
import { Field, FieldError, FieldLabel } from '@shadcn-ui/field';
import { cn } from '@shadcn-lib';

// ─── Types ─────────────────────────────────────────────────────────────────────

/**
 * A single option in the optional unit selector.
 *
 * @example
 * { value: 'KG', label: 'Kilogram (kg)', symbol: 'kg' }
 */
export type NumberUnitOption = {
	/** The value stored in the form state (enum string, e.g. "KG") */
	value: string;
	/** Full human-readable label shown inside the dropdown */
	label: string;
	/** Short symbol shown as the trigger display when selected (e.g. "kg") */
	symbol: string;
};

// ─── Shared base props ────────────────────────────────────────────────────────

type NumberFieldBaseProps<TFieldValues extends FieldValues = FieldValues> = {
	/**
	 * RHF control from `useForm<T>()`.
	 * Generic so callers retain full type safety without casting.
	 */
	control: Control<TFieldValues>;

	/** RHF field name for the numeric value (e.g. "maxWeight") */
	valueName: Path<TFieldValues>;

	/** Label rendered above the input group */
	label: string;

	/**
	 * Optional hint shown below the input.
	 * Linked via `aria-describedby` on the input for screen readers.
	 */
	description?: string;

	/** Placeholder for the numeric input. Defaults to "0". */
	placeholder?: string;

	/** Minimum allowed value. Defaults to 0. */
	min?: number;

	/** Maximum allowed value. */
	max?: number;

	/** Step increment. Defaults to "any". */
	step?: number | 'any';

	/**
	 * Appends "(optional)" to the label when true.
	 */
	optional?: boolean;

	/**
	 * RHF `errors` object from `form.formState.errors`.
	 * Used to derive error state and render `<FieldError>` messages.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	errors: FieldErrors<any>;

	/** Stable id for the value `<FieldError>` element (used by aria-describedby). */
	valueErrorId: string;

	/** Extra class names forwarded to the outer `<Field>` wrapper. */
	className?: string;

	/**
	 * Changing this value remounts <NumberInput>, re-seeding its local
	 * display state from the current field value.
	 *
	 * Pass a value that only changes on intentional external resets —
	 * e.g. `form.formState.submitCount` — never a value derived from the
	 * field itself, which would remount on every keystroke and lose focus.
	 *
	 * Defaults to 0 (stable — never remounts unless you change it).
	 */
	resetKey?: string | number;
};

// ─── Variant: plain numeric field (no unit) ───────────────────────────────────

type NumberFieldWithoutUnit<TFieldValues extends FieldValues = FieldValues> =
	NumberFieldBaseProps<TFieldValues> & {
		/**
		 * No unit selector — renders a plain `<Input>` inside the `<Field>` wrapper.
		 * This is the default variant.
		 */
		unit?: never;
		unitName?: never;
		unitOptions?: never;
		unitErrorId?: never;
	};

// ─── Variant: with trailing unit Select ───────────────────────────────────────

type NumberFieldWithUnit<TFieldValues extends FieldValues = FieldValues> =
	NumberFieldBaseProps<TFieldValues> & {
		/**
		 * When `true`, a `<Select>` is attached to the trailing edge of the input.
		 * Both controls share a single group border + focus-within ring.
		 * Requires `unitName`, `unitOptions`, and `unitErrorId`.
		 */
		unit: true;

		/** RHF field name for the unit select (e.g. "weightUnit") */
		unitName: Path<TFieldValues>;

		/** Options rendered inside the unit dropdown */
		unitOptions: NumberUnitOption[];

		/** Stable id for the unit `<FieldError>` element */
		unitErrorId: string;
	};

export type NumberFieldProps<TFieldValues extends FieldValues = FieldValues> =
	| NumberFieldWithoutUnit<TFieldValues>
	| NumberFieldWithUnit<TFieldValues>;

// ─── Type guard ───────────────────────────────────────────────────────────────

const hasUnit = <T extends FieldValues>(
	props: NumberFieldProps<T>
): props is NumberFieldWithUnit<T> => {
	return props.unit === true;
};

// ─── Inner input component ────────────────────────────────────────────────────

/**
 * Controlled input that bridges the gap between HTML inputs (which need a
 * transient empty string while typing) and RHF/Zod (which expects a number
 * or undefined).
 *
 * Strategy:
 * - `displayValue` (local string state) is what the <Input> renders.
 *   Always controlled — Base UI never sees a switch from uncontrolled to
 *   controlled, silencing the "changing defaultValue" warning.
 * - `initialValue` seeds displayValue once on mount. The parent passes a
 *   stable `key` so this component only remounts on a real external reset,
 *   not on every keystroke — preserving focus while the user types.
 * - `onChange` updates displayValue immediately (caret never jumps) and
 *   forwards a parsed number — or undefined — to RHF.
 * - `onBlur` fires Zod validation at the right UX moment rather than
 *   mid-keystroke.
 *
 * useState is legal here because NumberInput is a proper React component,
 * not a render callback. That was the root cause of the earlier hook errors.
 */
type NumberInputProps = {
	initialValue: number | undefined | null;
	onChange: (value: number | undefined) => void;
	onBlur: () => void;
	id: string;
	min?: number;
	max?: number;
	step?: number | 'any';
	placeholder?: string;
	hasValueError: boolean;
	ariaDescribedBy?: string;
	isGrouped: boolean;
};

const NumberInput = ({
	initialValue,
	onChange,
	onBlur,
	id,
	min,
	max,
	step,
	placeholder,
	hasValueError,
	ariaDescribedBy,
	isGrouped,
}: NumberInputProps) => {
	const [displayValue, setDisplayValue] = useState<string>(
		initialValue !== undefined && initialValue !== null
			? String(initialValue)
			: ''
	);

	return (
		<Input
			id={id}
			type="number"
			min={min}
			max={max}
			step={step}
			inputMode="decimal"
			placeholder={placeholder}
			aria-invalid={hasValueError || undefined}
			aria-describedby={ariaDescribedBy}
			value={displayValue}
			onChange={(e) => {
				const raw = e.target.value;
				setDisplayValue(raw);

				if (raw === '' || raw === '-') {
					// Transient mid-edit — hold off Zod validation until blur
					onChange(undefined);
				} else {
					const parsed = Number(raw);
					onChange(isNaN(parsed) ? undefined : parsed);
				}
			}}
			onBlur={() => {
				onBlur();
				if (displayValue === '' || displayValue === '-') {
					onChange(undefined);
				}
			}}
			className={cn(
				'[appearance:textfield]',
				'[&::-webkit-outer-spin-button]:appearance-none',
				'[&::-webkit-inner-spin-button]:appearance-none',
				isGrouped && [
					'flex-1 rounded-none border-0 shadow-none',
					'focus-visible:ring-0 focus-visible:ring-offset-0',
				]
			)}
		/>
	);
};

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * NumberField
 *
 * @description
 * A self-contained numeric form field that owns its `<Field>`, `<FieldLabel>`,
 * and `<FieldError>` wrapper — drop it directly inside a `<FieldGroup>` with
 * no extra scaffolding at the call site.
 *
 * Internally wraps RHF `<Controller>` for both the value input and the optional
 * unit select. Pass `control` + `valueName` (and when needed `unitName`) from
 * the parent `useForm` — no `register()` or manual `Controller` needed.
 *
 * ─── Without `unit` (default) ────────────────────────────────────────────────
 * Renders a plain numeric `<Input>` — no group wrapper, visually identical to
 * every other text input in the app.
 *
 * ```
 * ┌──────────────────────────────────────────────┐
 * │  0.0                                         │
 * └──────────────────────────────────────────────┘
 * ```
 *
 * ─── With `unit={true}` ──────────────────────────────────────────────────────
 * Renders a joined input-group where the numeric input and unit `<Select>`
 * share a single border. Mirrors the `MeasurementField` pattern used in the
 * item forms, now as a reusable self-contained field.
 *
 * ```
 * ┌───────────────────────────────┬──────────────────┐
 * │  0.0                          │  Kilogram (kg) ▾ │
 * └───────────────────────────────┴──────────────────┘
 * ```
 *
 * @remarks
 * - **RTL-safe** — uses logical properties (`border-s`) instead of `border-l`.
 * - **Semantic tokens only** — no raw palette colors (`bg-muted`, `border-input`,
 *   `ring-ring`, `border-destructive`, etc.).
 * - The group container owns the shared border + `focus-within` ring; the inner
 *   `<Input>` and `<SelectTrigger>` each strip their own border and ring.
 * - Browser spin buttons are removed via `[appearance:textfield]` — keyboard
 *   ↑ / ↓ increment still works.
 * - The `SelectTrigger` shows the unit `symbol` (short form) when collapsed and
 *   the full `label` inside the open dropdown.
 *
 * @example
 * ```tsx
 * // ── Plain numeric field ───────────────────────────────────────────────────
 * <NumberField
 *   control={form.control}
 *   valueName="emptyWeight"
 *   label="Bag weight"
 *   description="The empty bag's weight. Included in total carried weight."
 *   optional
 *   placeholder="0.0"
 *   step={0.1}
 *   errors={form.formState.errors}
 *   valueErrorId="bag-emptyWeight-error"
 * />
 *
 * // ── With unit selector ────────────────────────────────────────────────────
 * <NumberField
 *   control={form.control}
 *   valueName="weight"
 *   unitName="weightUnit"
 *   label="Weight"
 *   unit
 *   unitOptions={WEIGHT_UNIT_OPTIONS}
 *   placeholder="0.0"
 *   step={0.01}
 *   errors={form.formState.errors}
 *   valueErrorId="item-weight-error"
 *   unitErrorId="item-weightUnit-error"
 * />
 * ```
 */
const NumberField = <TFieldValues extends FieldValues = FieldValues>(
	props: NumberFieldProps<TFieldValues>
) => {
	const {
		control,
		valueName,
		label,
		description,
		placeholder = '0',
		min = 0,
		max,
		step = 'any',
		optional = false,
		errors,
		valueErrorId,
		className,
		resetKey = 0,
	} = props;

	const hasValueError = !!errors[valueName];
	const hasUnitError = hasUnit(props) ? !!errors[props.unitName] : false;
	const hasError = hasValueError || hasUnitError;

	const descriptionId = description ? `${valueName}-desc` : undefined;
	const valueAriaDescribedBy =
		[hasValueError ? valueErrorId : null, descriptionId ?? null]
			.filter(Boolean)
			.join(' ') || undefined;

	const renderValueInput = (isGrouped: boolean) => (
		<Controller
			name={valueName}
			control={control}
			render={({ field }) => (
				<NumberInput
					// key is stable during typing (resetKey doesn't change).
					// Only changes when the parent bumps resetKey intentionally
					// (e.g. after form.reset()), which remounts the input and
					// re-seeds displayValue from the new field.value.
					key={`${valueName}-${resetKey}`}
					initialValue={field.value}
					onChange={field.onChange}
					onBlur={field.onBlur}
					id={valueName}
					min={min}
					max={max}
					step={step}
					placeholder={placeholder}
					hasValueError={hasValueError}
					ariaDescribedBy={valueAriaDescribedBy}
					isGrouped={isGrouped}
				/>
			)}
		/>
	);

	// ── Without unit ──────────────────────────────────────────────────────────
	if (!hasUnit(props)) {
		return (
			<Field data-invalid={hasError || undefined} className={className}>
				<FieldLabel htmlFor={valueName}>
					{label}
					{optional && (
						<span className="text-muted-foreground ms-1 text-xs font-normal">
							(optional)
						</span>
					)}
				</FieldLabel>

				{renderValueInput(false)}

				{description && (
					<p
						id={descriptionId}
						className="text-muted-foreground text-xs"
					>
						{description}
					</p>
				)}

				{hasValueError && (
					<FieldError
						id={valueErrorId}
						role="alert"
						className="text-destructive font-medium mt-1"
						errors={[errors[valueName]]}
					/>
				)}
			</Field>
		);
	}

	// ── With unit ─────────────────────────────────────────────────────────────
	const { unitName, unitOptions, unitErrorId } = props;

	return (
		<Field data-invalid={hasError || undefined} className={className}>
			<FieldLabel htmlFor={valueName}>
				{label}
				{optional && (
					<span className="text-muted-foreground ms-1 text-xs font-normal">
						(optional)
					</span>
				)}
			</FieldLabel>

			<div
				className={cn(
					'flex overflow-hidden rounded-md border transition-colors',
					'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0',
					hasError ? 'border-destructive' : 'border-input'
				)}
			>
				{renderValueInput(true)}

				<div
					aria-hidden="true"
					className="w-px self-stretch border-s border-input"
				/>

				<Controller
					name={unitName}
					control={control}
					render={({ field }) => (
						<Select
							value={field.value ?? ''}
							onValueChange={(val) => field.onChange(val)}
						>
							<SelectTrigger
								aria-label={`${label} unit`}
								aria-invalid={hasUnitError || undefined}
								aria-describedby={
									hasUnitError ? unitErrorId : undefined
								}
								className={cn(
									'w-36 rounded-s-none border-0 shadow-none',
									'focus:ring-0 focus:ring-offset-0',
									'bg-muted/40 hover:bg-muted/60 transition-colors'
								)}
							>
								<SelectValue placeholder="Unit">
									{unitOptions.find(
										(opt) => opt.value === field.value
									)?.symbol ?? 'Unit'}
								</SelectValue>
							</SelectTrigger>

							<SelectContent align="end">
								{unitOptions.map((opt) => (
									<SelectItem
										key={opt.value}
										value={opt.value}
									>
										{opt.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				/>
			</div>

			{description && (
				<p id={descriptionId} className="text-muted-foreground text-xs">
					{description}
				</p>
			)}

			{hasValueError && (
				<FieldError
					id={valueErrorId}
					role="alert"
					className="text-destructive font-medium mt-1"
					errors={[errors[valueName]]}
				/>
			)}

			{hasUnitError && (
				<FieldError
					id={unitErrorId}
					role="alert"
					className="text-destructive font-medium mt-1"
					errors={[errors[unitName]]}
				/>
			)}
		</Field>
	);
};

export default NumberField;
