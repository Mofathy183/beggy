'use client';

import { Controller, type UseFormReturn } from 'react-hook-form';

import { Button } from '@shadcn-ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@shadcn-ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@shadcn-ui/field';
import { Input } from '@shadcn-ui/input';
import { FormServerError } from '@shared-ui/error';
import { NumberField } from '@shared-ui/fields';
import { Chips } from '@shared-ui/chips';

import {
	BAG_TYPE_OPTIONS,
	SIZE_OPTIONS,
	MATERIAL_OPTIONS,
	BAG_FEATURE_OPTIONS,
} from '@shared/ui/mappers';
import type { UpdateBagInput } from '@beggy/shared/types';
import type { BagFeature } from '@beggy/shared/constants';

// ─── Props ────────────────────────────────────────────────────────────────────

type UpdateBagFormUIProps = {
	form: UseFormReturn<UpdateBagInput>;
	onSubmit: (values: UpdateBagInput) => void;
	onCancel?: () => void;
	isSubmitting?: boolean;
	serverError?: string | null;
	serverSuggestion?: string | null;
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * UpdateBagFormUI
 *
 * Purely presentational — no API calls, no routing, no side effects.
 * PATCH semantics: all fields are optional; only changed fields are sent.
 */
const UpdateBagFormUI = ({
	form,
	onSubmit,
	onCancel,
	isSubmitting,
	serverError,
	serverSuggestion,
}: UpdateBagFormUIProps) => {
	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			noValidate
			aria-describedby="update-bag-description"
		>
			<Card className="w-full sm:max-w-xl">
				<CardHeader>
					<CardTitle>Edit bag</CardTitle>
					<CardDescription id="update-bag-description">
						Update your bag&apos;s details. Only changed fields will
						be saved.
					</CardDescription>
				</CardHeader>

				<CardContent>
					<FieldGroup>
						{/* ── Name ─────────────────────────────────────────── */}
						<Controller
							name="name"
							control={form.control}
							render={({ field, fieldState }) => {
								const errorId = 'update-bag-name-error';
								return (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="update-bag-name">
											Bag name
										</FieldLabel>
										<Input
											{...field}
											id="update-bag-name"
											value={field.value ?? ''}
											placeholder="e.g. Cabin carry-on, Weekend duffel…"
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

						{/* ── Type ─────────────────────────────────────────── */}
						<Controller
							name="type"
							control={form.control}
							render={({ field, fieldState }) => {
								const errorId = 'update-bag-type-error';
								return (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel>Bag type</FieldLabel>
										<Chips
											mode="single"
											options={BAG_TYPE_OPTIONS}
											value={field.value ?? null}
											variant="primary"
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

						{/* ── Size ─────────────────────────────────────────── */}
						<Controller
							name="size"
							control={form.control}
							render={({ field, fieldState }) => {
								const errorId = 'update-bag-size-error';
								return (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel>Size</FieldLabel>
										<Chips
											mode="single"
											options={SIZE_OPTIONS}
											value={field.value ?? null}
											variant="primary"
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

						{/* ── Weight limits ─────────────────────────────────── */}
						<div className="grid grid-cols-2 gap-4">
							{/* maxWeight */}
							<NumberField
								control={form.control}
								valueName="maxWeight"
								label="Max weight"
								placeholder="0.0"
								step={0.1}
								errors={form.formState.errors}
								valueErrorId="create-bag-maxWeight-error"
							/>

							{/* maxCapacity */}
							<NumberField
								control={form.control}
								valueName="maxCapacity"
								label="Max Capacity"
								placeholder="0.0"
								step={0.1}
								errors={form.formState.errors}
								valueErrorId="create-bag-maxCapacity-error"
							/>
						</div>

						{/* ── Empty weight (optional) ───────────────────────── */}
						<NumberField
							control={form.control}
							valueName="emptyWeight"
							label="Empty Weight"
							placeholder="0.0"
							description="This is just the bag’s weight on its own — no gear inside. If you know it, it helps keep your total weight accurate. If not, no stress… you can always add it later."
							step={0.1}
							errors={form.formState.errors}
							valueErrorId="create-bag-emptyWeight-error"
						/>

						{/* ── Color (optional) ─────────────────────────────── */}
						<Controller
							name="color"
							control={form.control}
							render={({ field, fieldState }) => {
								const errorId = 'update-bag-color-error';
								return (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="update-bag-color">
											Color
											<span className="text-muted-foreground ms-1 text-xs font-normal">
												(optional)
											</span>
										</FieldLabel>
										<Input
											{...field}
											id="update-bag-color"
											value={field.value ?? ''}
											placeholder="e.g. black, navy, olive…"
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

						{/* ── Material (optional Chips) ────────────────────── */}
						<Controller
							name="material"
							control={form.control}
							render={({ field, fieldState }) => {
								const errorId = 'create-bag-material-error';
								return (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel>Material</FieldLabel>
										<Chips
											mode="single"
											options={MATERIAL_OPTIONS}
											value={field.value}
											variant="default"
											onChange={field.onChange}
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

						{/* ── Features (multi-select Chips) ────────────────── */}
						<Controller
							name="features"
							control={form.control}
							render={({ field, fieldState }) => {
								const errorId = 'update-bag-features-error';
								return (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel>Features</FieldLabel>
										<Chips
											mode="multiple"
											options={BAG_FEATURE_OPTIONS}
											value={(field.value ?? []).filter(
												(v): v is BagFeature =>
													v != null
											)}
											variant="accent"
											onChange={field.onChange}
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

						{/* ── Server error ──────────────────────────────────── */}
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

export default UpdateBagFormUI;
