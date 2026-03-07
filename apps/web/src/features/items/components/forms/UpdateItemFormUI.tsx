'use client';

import { Controller, UseFormReturn } from 'react-hook-form';

import { Button } from '@shadcn-ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@shadcn-ui/card';
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from '@shadcn-ui/field';
import { Input } from '@shadcn-ui/input';
import { Switch } from '@shadcn-ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@shadcn-ui/alert';
import { Label } from '@shadcn-ui/label';
import { HugeiconsIcon } from '@hugeicons/react';
import { AlertCircleIcon } from '@hugeicons/core-free-icons';

import { Chips } from '@shared-ui/chips';
import {
	ITEM_CATEGORY_OPTIONS,
	WEIGHT_UNIT_META,
	VOLUME_UNIT_META,
} from '@shared-ui/mappers';

import type { UpdateItemInput } from '@beggy/shared/types';
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

type UpdateItemFormUIProps = {
	form: UseFormReturn<UpdateItemInput>;
	onSubmit: (values: UpdateItemInput) => void;
	/** Called when user cancels — closes the dialog */
	onCancel?: () => void;
	isSubmitting?: boolean;
	serverError?: string | null;
	serverSuggestion?: string | null;
};

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * UpdateItemFormUI
 *
 * Purely presentational — no API calls, no routing, no side effects.
 * PATCH semantics: all fields are optional; only changed fields are sent.
 *
 * Structurally identical to CreateItemFormUI with three differences:
 * 1. CardTitle + description reflect "edit" intent
 * 2. Footer has Cancel (calls onCancel) instead of Reset
 * 3. Submit button reads "Save changes" instead of "Add item"
 *
 * Weight+unit and volume+unit use the shared MeasurementField joined
 * input-group — single border, no gap between input and select.
 */
const UpdateItemFormUI = ({
	form,
	onSubmit,
	onCancel,
	isSubmitting,
	serverError,
	serverSuggestion,
}: UpdateItemFormUIProps) => {
	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			noValidate
			aria-describedby="update-item-description"
		>
			<Card className="w-full sm:max-w-lg">
				<CardHeader>
					<CardTitle>Edit item</CardTitle>
					<CardDescription id="update-item-description">
						Update your item details. Only changed fields will be
						saved.
					</CardDescription>
				</CardHeader>

				<CardContent>
					<FieldGroup>
						{/* ── Name ─────────────────────────────────────────── */}
						<Controller
							name="name"
							control={form.control}
							render={({ field, fieldState }) => {
								const errorId = 'update-item-name-error';
								return (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="update-item-name">
											Item name
										</FieldLabel>
										<Input
											{...field}
											id="update-item-name"
											value={field.value ?? ''}
											placeholder="e.g. Passport, Travel toothbrush…"
											autoComplete="off"
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
								const errorId = 'update-item-category-error';
								return (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel>Category</FieldLabel>
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
							valueErrorId="update-item-weight-error"
							unitErrorId="update-item-weight-unit-error"
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
							valueErrorId="update-item-volume-error"
							unitErrorId="update-item-volume-unit-error"
						/>

						{/* ── Color ────────────────────────────────────────── */}
						<Controller
							name="color"
							control={form.control}
							render={({ field, fieldState }) => {
								const errorId = 'update-item-color-error';
								const descId = 'update-item-color-desc';
								return (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="update-item-color">
											Color
											<span className="text-muted-foreground ml-1 text-xs font-normal">
												(optional)
											</span>
										</FieldLabel>
										<Input
											{...field}
											id="update-item-color"
											value={field.value ?? ''}
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
												htmlFor="update-item-fragile"
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
											id="update-item-fragile"
											checked={field.value ?? false}
											onCheckedChange={field.onChange}
											aria-label="Mark item as fragile"
										/>
									</div>
								</Field>
							)}
						/>

						{/* ── Server error ─────────────────────────────────── */}
						{serverError && (
							<Alert
								variant="destructive"
								role="alert"
								aria-live="polite"
								className="border-destructive/30 bg-destructive/8 text-foreground"
							>
								<HugeiconsIcon
									icon={AlertCircleIcon}
									size={16}
									className="text-destructive"
								/>
								<AlertTitle className="text-destructive font-semibold">
									{serverError}
								</AlertTitle>
								{serverSuggestion && (
									<AlertDescription className="text-muted-foreground text-sm">
										{serverSuggestion}
									</AlertDescription>
								)}
							</Alert>
						)}
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
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? 'Saving…' : 'Save changes'}
						</Button>
					</Field>
				</CardFooter>
			</Card>
		</form>
	);
};

export default UpdateItemFormUI;
