'use client';

import { Controller, type Control, type FieldErrors } from 'react-hook-form';

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

type NumberFieldBaseProps = {
	/**
	 * RHF control from `useForm<T>()`.
	 * Typed as `any` to keep this component schema-agnostic —
	 * the caller's TypeScript enforces the correct field names.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>;

	/** RHF field name for the numeric value (e.g. "maxWeight") */
	valueName: string;

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
};

// ─── Variant: plain numeric field (no unit) ───────────────────────────────────

type NumberFieldWithoutUnit = NumberFieldBaseProps & {
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

type NumberFieldWithUnit = NumberFieldBaseProps & {
	/**
	 * When `true`, a `<Select>` is attached to the trailing edge of the input.
	 * Both controls share a single group border + focus-within ring.
	 * Requires `unitName`, `unitOptions`, and `unitErrorId`.
	 */
	unit: true;

	/** RHF field name for the unit select (e.g. "weightUnit") */
	unitName: string;

	/** Options rendered inside the unit dropdown */
	unitOptions: NumberUnitOption[];

	/** Stable id for the unit `<FieldError>` element */
	unitErrorId: string;
};

export type NumberFieldProps = NumberFieldWithoutUnit | NumberFieldWithUnit;

// ─── Type guard ───────────────────────────────────────────────────────────────

function hasUnit(props: NumberFieldProps): props is NumberFieldWithUnit {
	return props.unit === true;
}

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
const NumberField = (props: NumberFieldProps) => {
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
	} = props;

	const hasValueError = !!errors[valueName];
	const hasUnitError = hasUnit(props) ? !!errors[props.unitName] : false;
	const hasError = hasValueError || hasUnitError;

	// IDs
	const descriptionId = description ? `${valueName}-desc` : undefined;

	// aria-describedby — join description id + error id when both exist
	const valueAriaDescribedBy =
		[hasValueError ? valueErrorId : null, descriptionId ?? null]
			.filter(Boolean)
			.join(' ') || undefined;

	// ── Shared: value input rendered by Controller ────────────────────────────
	const renderValueInput = (isGrouped: boolean) => (
		<Controller
			name={valueName}
			control={control}
			render={({ field }) => (
				<Input
					{...field}
					id={valueName}
					type="number"
					min={min}
					max={max}
					step={step}
					inputMode="decimal"
					placeholder={placeholder}
					aria-invalid={hasValueError || undefined}
					aria-describedby={valueAriaDescribedBy}
					onChange={(e) =>
						field.onChange(
							e.target.value === ''
								? undefined
								: Number(e.target.value)
						)
					}
					value={
						field.value !== undefined && field.value !== null
							? field.value
							: ''
					}
					className={cn(
						// Remove browser spin buttons — keyboard ↑/↓ still works
						'[appearance:textfield]',
						'[&::-webkit-outer-spin-button]:appearance-none',
						'[&::-webkit-inner-spin-button]:appearance-none',
						// When grouped, strip individual border + ring —
						// the group wrapper owns them
						isGrouped && [
							'flex-1 rounded-none border-0 shadow-none',
							'focus-visible:ring-0 focus-visible:ring-offset-0',
						]
					)}
				/>
			)}
		/>
	);

	// ── Without unit: plain field ─────────────────────────────────────────────
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

	// ── With unit: joined input-group ─────────────────────────────────────────
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

			{/*
			 * Group wrapper — owns the single shared border + focus-within ring.
			 * ┌──────────────────────────────┬──────────────────┐
			 * │  0.0                          │  Kilogram (kg) ▾ │
			 * └──────────────────────────────┴──────────────────┘
			 *
			 * border-destructive when either value or unit field has an error.
			 */}
			<div
				className={cn(
					'flex overflow-hidden rounded-md border transition-colors',
					'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0',
					hasError ? 'border-destructive' : 'border-input'
				)}
			>
				{/* Numeric input — takes all available space */}
				{renderValueInput(true)}

				{/*
				 * Vertical divider between input and Select.
				 * border-s (logical) keeps it RTL-safe.
				 */}
				<div
					aria-hidden="true"
					className="w-px self-stretch border-s border-input"
				/>

				{/* Unit Select — fixed width, square start corners, no own border */}
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
								{/*
								 * Show the short symbol in the collapsed trigger
								 * (e.g. "kg") and the full label in the dropdown
								 * (e.g. "Kilogram (kg)").
								 */}
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

			{/* Optional description — shown below the group */}
			{description && (
				<p id={descriptionId} className="text-muted-foreground text-xs">
					{description}
				</p>
			)}

			{/* Value error */}
			{hasValueError && (
				<FieldError
					id={valueErrorId}
					role="alert"
					className="text-destructive font-medium mt-1"
					errors={[errors[valueName]]}
				/>
			)}

			{/* Unit error — separate message below value error */}
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
