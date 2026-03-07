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

type UnitOption = {
	value: string;
	label: string;
	symbol: string;
};

type MeasurementFieldProps = {
	/** RHF control passed down from the parent form */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>;
	/** RHF field name for the numeric value (e.g. "weight") */
	valueName: string;
	/** RHF field name for the unit select (e.g. "weightUnit") */
	unitName: string;
	/** Field label displayed above the input group */
	label: string;
	/** Accessible placeholder for the numeric input */
	placeholder?: string;
	/** Available unit options */
	unitOptions: UnitOption[];
	/** Combined errors object from form.formState.errors */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	errors: FieldErrors<any>;
	/** IDs for the value and unit error elements */
	valueErrorId: string;
	unitErrorId: string;
};

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * MeasurementField
 *
 * @description
 * A joined input-group combining a numeric Input and a unit Select.
 * The two controls share a single visible border — the Input takes up
 * available space (flex-1) and the Select attaches to its right edge
 * with no gap, a left border divider, and square inner corners.
 *
 * Visual structure:
 * ┌─────────────────────────────┬──────────────────┐
 * │  0.0                        │  Kilogram (kg) ▾ │
 * └─────────────────────────────┴──────────────────┘
 *
 * @remarks
 * - Extracted as a shared sub-component to avoid duplicating the
 *   input-group markup across CreateItemFormUI and UpdateItemFormUI.
 * - The outer wrapper removes individual Input/Select borders and
 *   applies a single shared border + ring to the group container.
 * - `rounded-r-none` on Input + `rounded-l-none` on SelectTrigger
 *   creates the seamless join.
 */
const MeasurementField = ({
	control,
	valueName,
	unitName,
	label,
	placeholder = '0.0',
	unitOptions,
	errors,
	valueErrorId,
	unitErrorId,
}: MeasurementFieldProps) => {
	const hasValueError = !!errors[valueName];
	const hasUnitError = !!errors[unitName];
	const hasError = hasValueError || hasUnitError;

	return (
		<Field data-invalid={hasError}>
			<FieldLabel>{label}</FieldLabel>

			{/*
			 * Input-group container.
			 * - Single shared border wraps both controls
			 * - focus-within ring applies when either control is focused
			 * - border-destructive when either field has an error
			 */}
			<div
				className={cn(
					'flex overflow-hidden rounded-md border',
					'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0',
					'transition-colors',
					hasError ? 'border-destructive' : 'border-input'
				)}
			>
				{/* Numeric input — flex-1, no individual border, no ring */}
				<Controller
					name={valueName}
					control={control}
					render={({ field }) => (
						<Input
							{...field}
							type="number"
							min={0}
							step="any"
							inputMode="decimal"
							placeholder={placeholder}
							aria-label={`${label} value`}
							aria-invalid={hasValueError}
							aria-describedby={
								hasValueError ? valueErrorId : undefined
							}
							onChange={(e) =>
								field.onChange(
									e.target.value === ''
										? undefined
										: Number(e.target.value)
								)
							}
							value={
								field.value !== undefined &&
								field.value !== null
									? field.value
									: ''
							}
							className={cn(
								// Remove individual border + ring — group container owns these
								'flex-1 rounded-none border-0 shadow-none',
								'focus-visible:ring-0 focus-visible:ring-offset-0'
							)}
						/>
					)}
				/>

				{/* Divider between input and select */}
				<div className="border-input w-px self-stretch border-l" />

				{/* Unit select — fixed width, square left corners, no left border */}
				<Controller
					name={unitName}
					control={control}
					render={({ field }) => (
						<Select
							value={field.value}
							onValueChange={(val) => field.onChange(val)}
						>
							<SelectTrigger
								className={cn(
									'w-36 rounded-l-none border-0 shadow-none',
									'focus:ring-0 focus:ring-offset-0',
									'bg-muted/40'
								)}
								aria-label={`${label} unit`}
								aria-invalid={hasUnitError}
								aria-describedby={
									hasUnitError ? unitErrorId : undefined
								}
							>
								<SelectValue placeholder="Unit">
									{unitOptions.find(
										(opt) => opt.value === field.value
									)?.label ?? 'Unit'}
								</SelectValue>
							</SelectTrigger>
							<SelectContent>
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

			{/* Field-level errors */}
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

export default MeasurementField;
