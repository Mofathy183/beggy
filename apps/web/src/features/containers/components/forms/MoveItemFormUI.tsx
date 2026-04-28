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
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from '@shadcn-ui/field';
import { Input } from '@shadcn-ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@shadcn-ui/select';
import { HugeiconsIcon } from '@hugeicons/react';
import { Backpack01Icon } from '@hugeicons/core-free-icons';
import { FormServerError } from '@shared-ui/error';
import { NumberField } from '@shared-ui/fields';
import { BAG_TYPE_OPTIONS, getEnumIcon } from '@shared-ui/mappers';

import type { MoveItemInput, BagDTO } from '@beggy/shared/types';

// ─── Types ─────────────────────────────────────────────────────────────────────

/**
 * Props for {@link MoveItemFormUI}.
 *
 * @description
 * Pure UI contract for moving an item between bags. All business logic,
 * validation, and side effects are handled upstream.
 */
type MoveItemFormUIProps = {
	form: UseFormReturn<MoveItemInput>;

	/**
	 * Called with validated form values.
	 */
	onSubmit: (values: MoveItemInput) => void;

	/**
	 * Optional cancel handler for dismissing the form.
	 */
	onCancel?: () => void;

	/**
	 * Indicates submission is in progress.
	 */
	isSubmitting?: boolean;

	/**
	 * Server-side error message (post-submit).
	 */
	serverError?: string | null;

	/**
	 * Optional actionable hint related to the server error.
	 */
	serverSuggestion?: string | null;

	/** Display name of the item being moved. */
	itemName: string;

	/** Source bag name (read-only context). */
	fromBagName: string;

	/**
	 * Available target bags excluding the source.
	 *
	 * @remarks
	 * Must not include the current container to avoid invalid moves.
	 */
	targetBags: BagDTO[];

	/** Indicates target bags are still loading. */
	isLoadingBags?: boolean;
};

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * Form UI for moving an item between bags.
 *
 * @description
 * Renders a controlled form using `react-hook-form`. Ensures user-friendly
 * selection by resolving bag IDs into human-readable labels and icons.
 *
 * @remarks
 * - Does not perform business validation.
 * - Assumes `targetBags` is pre-filtered (no source bag included).
 */
const MoveItemFormUI = ({
	form,
	onSubmit,
	onCancel,
	isSubmitting,
	serverError,
	serverSuggestion,
	itemName,
	fromBagName,
	targetBags,
	isLoadingBags,
}: MoveItemFormUIProps) => {
	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			noValidate
			aria-describedby="move-item-description"
		>
			<Card className="w-full">
				<CardHeader>
					<CardTitle>Move to another bag</CardTitle>
					<CardDescription id="move-item-description">
						Pick where this item is heading.
					</CardDescription>
				</CardHeader>

				<CardContent>
					<FieldGroup>
						{/* ── Item (read-only) ───────────────────────── */}
						<Field>
							<FieldLabel>Item</FieldLabel>
							<Input
								value={itemName}
								readOnly
								disabled
								aria-label="Item being moved"
								className="bg-muted text-muted-foreground"
							/>
						</Field>

						{/* ── From bag (read-only) ───────────────────── */}
						<Field>
							<FieldLabel>From</FieldLabel>
							<Input
								value={fromBagName}
								readOnly
								disabled
								aria-label="Source bag"
								className="bg-muted text-muted-foreground"
							/>
						</Field>

						{/* ── To bag (Select) ────────────────────────── */}
						<Controller
							name="toContainerId"
							control={form.control}
							render={({ field, fieldState }) => {
								const errorId = 'move-to-container-error';

								const selectedBag = targetBags.find(
									(b) => b.containerId === field.value
								);

								return (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="move-to-select">
											To
										</FieldLabel>
										<Select
											value={field.value ?? ''}
											onValueChange={field.onChange}
											disabled={
												isLoadingBags ||
												targetBags.length === 0
											}
										>
											<SelectTrigger
												id="move-to-select"
												aria-invalid={
													fieldState.invalid
												}
												aria-describedby={
													fieldState.error
														? errorId
														: undefined
												}
											>
												{/*
												 * Pass selectedBag.name explicitly so
												 * the trigger always shows the name —
												 * never a raw UUID. textValue on each
												 * SelectItem also ensures this.
												 */}
												{selectedBag ? (
													<span className="flex items-center gap-2">
														<HugeiconsIcon
															icon={
																getEnumIcon(
																	BAG_TYPE_OPTIONS,
																	selectedBag.type
																) ??
																Backpack01Icon
															}
															className="text-muted-foreground h-3.5 w-3.5 shrink-0"
															aria-hidden="true"
														/>
														<span>
															{selectedBag.name}
														</span>
													</span>
												) : (
													<SelectValue
														placeholder={
															isLoadingBags
																? 'Loading bags…'
																: targetBags.length ===
																	  0
																	? 'No other bags'
																	: 'Pick a bag'
														}
													/>
												)}
											</SelectTrigger>
											<SelectContent>
												{targetBags.length === 0 &&
												!isLoadingBags ? (
													<div className="text-muted-foreground px-3 py-4 text-center text-sm">
														No other bags available.
													</div>
												) : (
													targetBags.map((bag) => {
														// Resolve bag type icon for visual scan
														const typeOption =
															BAG_TYPE_OPTIONS.find(
																(o) =>
																	o.value ===
																	bag.type
															);
														const BagIcon =
															typeOption?.icon ??
															Backpack01Icon;

														return (
															<SelectItem
																key={bag.id}
																value={
																	bag.containerId
																}
															>
																<div className="flex w-full items-center gap-2.5">
																	{/* Bag type icon */}
																	<div className="bg-accent flex h-6 w-6 shrink-0 items-center justify-center rounded-md">
																		<HugeiconsIcon
																			icon={
																				BagIcon
																			}
																			className="text-accent-foreground h-3.5 w-3.5"
																			aria-hidden="true"
																		/>
																	</div>

																	{/* Bag name — primary */}
																	<span className="flex-1 truncate font-medium">
																		{
																			bag.name
																		}
																	</span>
																</div>
															</SelectItem>
														);
													})
												)}
											</SelectContent>
										</Select>
										{fieldState.error && (
											<FieldError
												id={errorId}
												role="alert"
												className="text-destructive mt-1 font-medium"
												errors={[fieldState.error]}
											/>
										)}
										<FieldDescription>
											Only your other bags are listed
											here.
										</FieldDescription>
									</Field>
								);
							}}
						/>

						{/* ── Quantity ───────────────────────────────── */}
						<NumberField
							control={form.control}
							valueName="quantity"
							label="Quantity"
							placeholder="1"
							errors={form.formState.errors}
							valueErrorId="move-quantity-error"
						/>

						{/* ── Server error ───────────────────────────── */}
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
							onClick={onCancel}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? 'Moving…' : 'Move it'}
						</Button>
					</Field>
				</CardFooter>
			</Card>
		</form>
	);
};

export default MoveItemFormUI;
