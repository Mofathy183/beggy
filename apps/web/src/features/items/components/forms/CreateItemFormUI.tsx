'use client';

import { Controller, UseFormReturn } from 'react-hook-form';

import { Button } from '@shadcn-ui/button';
import { Card, CardContent, CardFooter } from '@shadcn-ui/card';
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from '@shadcn-ui/field';
import { Input } from '@shadcn-ui/input';
import { Switch } from '@shadcn-ui/switch';
import { Label } from '@shadcn-ui/label';
import { FormServerError } from '@shared-ui/error';

import { Chips } from '@shared-ui/chips';
import {
	ITEM_CATEGORY_OPTIONS,
	WEIGHT_UNIT_META,
	VOLUME_UNIT_META,
} from '@shared-ui/mappers';

import type { CreateItemInput } from '@beggy/shared/types';
import MeasurementField from './MeasurementField';

// ─── Unit options ───────────────────────────────────────────────────────────────

const WEIGHT_UNIT_OPTIONS = WEIGHT_UNIT_META.map((m) => ({
	value: m.value,
	label: `${m.label} (${m.symbol})`,
	symbol: m.symbol,
}));

const VOLUME_UNIT_OPTIONS = VOLUME_UNIT_META.map((m) => ({
	value: m.value,
	label: `${m.label} (${m.symbol})`,
	symbol: m.symbol,
}));

// ─── Props ─────────────────────────────────────────────────────────────────────

type CreateItemFormUIProps = {
	form: UseFormReturn<CreateItemInput>;
	onSubmit: (values: CreateItemInput) => void;
	isSubmitting?: boolean;
	/** Called when the user cancels — closes the dialog if present */
	onCancel?: () => void;
	/** Beggy-style error message from HttpClientError.body.message */
	serverError?: string | null;
	/** Beggy-style suggestion from HttpClientError.body.suggestion */
	serverSuggestion?: string | null;
};

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * CreateItemFormUI
 *
 * Purely presentational — no API calls, no routing, no side effects.
 * Follows the same Field/FieldLabel/FieldError/FieldGroup + EditProfileFormUI
 * pattern for architectural consistency across the forms layer.
 *
 * Field layout:
 * - name            (text input, full width)
 * - category        (Chips single-select with icons)
 * - weight + unit   (joined input-group via MeasurementField)
 * - volume + unit   (joined input-group via MeasurementField)
 * - color           (text input, optional)
 * - isFragile       (Switch toggle row)
 */
const CreateItemFormUI = ({
	form,
	onSubmit,
	onCancel,
	isSubmitting,
	serverError,
	serverSuggestion,
}: CreateItemFormUIProps) => {
	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			noValidate
			aria-describedby="create-item-description"
		>
			<Card className="w-full sm:max-w-lg" tabIndex={-1}>
				<CardContent>
					<FieldGroup>
						{/* ── Name ─────────────────────────────────────────── */}
						<Controller
							name="name"
							control={form.control}
							render={({ field, fieldState }) => {
								const errorId = 'create-item-name-error';
								return (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="create-item-name">
											Item name
										</FieldLabel>
										<Input
											{...field}
											id="create-item-name"
											placeholder="e.g. Passport, Travel toothbrush…"
											autoComplete="off"
											autoFocus={false}
											aria-invalid={fieldState.invalid}
											aria-describedby={
												fieldState.error
													? errorId
													: undefined
											}
										/>
										{fieldState.error && (
											<FieldError
												id={errorId}
												role="alert"
												className="text-destructive font-medium mt-1"
												errors={[fieldState.error]}
											/>
										)}
									</Field>
								);
							}}
						/>

						{/* ── Category ─────────────────────────────────────── */}
						<Controller
							name="category"
							control={form.control}
							render={({ field, fieldState }) => {
								const errorId = 'create-item-category-error';
								return (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel>Category</FieldLabel>
										{/*
										 * Chips single-select — icons + labels from
										 * ITEM_CATEGORY_OPTIONS. More scannable than a
										 * dropdown for a fixed 10-item enum.
										 * Emits T | null; null → undefined for Zod.
										 */}
										<Chips
											mode="single"
											options={ITEM_CATEGORY_OPTIONS}
											value={field.value ?? null}
											variant="accent"
											onChange={(val) =>
												field.onChange(val ?? undefined)
											}
										/>
										{fieldState.error && (
											<FieldError
												id={errorId}
												role="alert"
												className="text-destructive font-medium mt-1"
												errors={[fieldState.error]}
											/>
										)}
									</Field>
								);
							}}
						/>

						{/* ── Weight + unit (joined input-group) ───────────── */}
						<MeasurementField
							control={form.control}
							valueName="weight"
							unitName="weightUnit"
							label="Weight"
							placeholder="0.0"
							unitOptions={WEIGHT_UNIT_OPTIONS}
							errors={form.formState.errors}
							valueErrorId="create-item-weight-error"
							unitErrorId="create-item-weight-unit-error"
						/>

						{/* ── Volume + unit (joined input-group) ───────────── */}
						<MeasurementField
							control={form.control}
							valueName="volume"
							unitName="volumeUnit"
							label="Volume"
							placeholder="0.0"
							unitOptions={VOLUME_UNIT_OPTIONS}
							errors={form.formState.errors}
							valueErrorId="create-item-volume-error"
							unitErrorId="create-item-volume-unit-error"
						/>

						{/* ── Color ────────────────────────────────────────── */}
						<Controller
							name="color"
							control={form.control}
							render={({ field, fieldState }) => {
								const errorId = 'create-item-color-error';
								const descId = 'create-item-color-desc';
								return (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="create-item-color">
											Color
											<span className="text-muted-foreground ml-1 text-xs font-normal">
												(optional)
											</span>
										</FieldLabel>
										<Input
											{...field}
											id="create-item-color"
											placeholder="e.g. black, navy, olive…"
											autoComplete="off"
											aria-invalid={fieldState.invalid}
											aria-describedby={[
												descId,
												fieldState.error
													? errorId
													: null,
											]
												.filter(Boolean)
												.join(' ')}
										/>
										<FieldDescription id={descId}>
											Used to identify your item at a
											glance.
										</FieldDescription>
										{fieldState.error && (
											<FieldError
												id={errorId}
												role="alert"
												className="text-destructive font-medium mt-1"
												errors={[fieldState.error]}
											/>
										)}
									</Field>
								);
							}}
						/>

						{/* ── isFragile (Switch row) ───────────────────────── */}
						<Controller
							name="isFragile"
							control={form.control}
							render={({ field }) => (
								<Field>
									<div className="border-border flex items-center justify-between gap-4 rounded-lg border p-4">
										<div className="flex flex-col gap-0.5">
											<Label
												htmlFor="create-item-fragile"
												className="text-sm font-medium leading-none"
											>
												Fragile item
											</Label>
											<p className="text-muted-foreground text-sm">
												Mark this item as needing
												careful handling.
											</p>
										</div>
										<Switch
											id="create-item-fragile"
											checked={field.value ?? false}
											onCheckedChange={field.onChange}
											aria-label="Mark item as fragile"
										/>
									</div>
								</Field>
							)}
						/>

						{/* ── Server-level error (HttpClientError) ─────────── */}
						<FormServerError
							message={serverError}
							suggestion={serverSuggestion}
						/>
					</FieldGroup>
				</CardContent>

				<CardFooter>
					<Field orientation="horizontal">
						<Button
							type="button"
							variant="outline"
							onClick={onCancel ?? (() => form.reset())}
							disabled={isSubmitting}
						>
							{onCancel ? 'Cancel' : 'Reset'}
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? 'Adding…' : 'Add item'}
						</Button>
					</Field>
				</CardFooter>
			</Card>
		</form>
	);
};

export default CreateItemFormUI;
