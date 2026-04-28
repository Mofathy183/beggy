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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@shadcn-ui/select';
import { HugeiconsIcon } from '@hugeicons/react';
import { WeightScale01Icon, TShirtIcon } from '@hugeicons/core-free-icons';
import { FormServerError } from '@shared-ui/error';
import { NumberField } from '@shared-ui/fields';
import {
	ITEM_CATEGORY_OPTIONS,
	WEIGHT_UNIT_META,
	getEnumIcon,
} from '@shared-ui/mappers';

import type { PackItemInput, ItemDTO } from '@beggy/shared/types';

// ─── Types ─────────────────────────────────────────────────────────────────────

/**
 * Props for {@link PackItemFormUI}.
 *
 * @description
 * Pure UI contract for packing items into a container.
 * All data preparation and side effects are handled upstream.
 */
type PackItemFormUIProps = {
	form: UseFormReturn<PackItemInput>;
	onSubmit: (values: PackItemInput) => void;
	onCancel?: () => void;
	isSubmitting?: boolean;
	serverError?: string | null;
	serverSuggestion?: string | null;

	/** Available items for selection. */
	items: ItemDTO[];

	/** Indicates items are still loading. */
	isLoadingItems?: boolean;

	/**
	 * Locks the item field when provided.
	 *
	 * @remarks
	 * Used when the item is preselected externally.
	 */
	lockedItemId?: string;

	/**
	 * Resolved display name for the locked item.
	 *
	 * @remarks
	 * Prevents rendering raw IDs in the UI.
	 */
	lockedItemName?: string;
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Formats item weight for display.
 *
 * @param weight - Numeric weight value
 * @param weightUnit - Raw unit enum value
 * @returns Human-readable weight string (e.g. "0.5 kg")
 *
 * @remarks
 * - Trims trailing zeros for cleaner display
 * - Falls back to lowercase unit if metadata is missing
 */
const formatWeight = (weight: number, weightUnit: string): string => {
	const meta = WEIGHT_UNIT_META?.find((m) => m.value === weightUnit);
	const symbol = meta?.symbol ?? weightUnit.toLowerCase();

	const formatted = parseFloat(weight.toFixed(2)).toString();
	return `${formatted} ${symbol}`;
};

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * Form UI for packing items.
 *
 * @description
 * Renders a controlled form using `react-hook-form`, supporting both
 * selectable and locked item states.
 *
 * @remarks
 * - Does not perform validation or mutations
 * - Assumes `items` are already filtered and ready for display
 */
const PackItemFormUI = ({
	form,
	onSubmit,
	onCancel,
	isSubmitting,
	serverError,
	serverSuggestion,
	items,
	isLoadingItems,
	lockedItemId,
	lockedItemName,
}: PackItemFormUIProps) => {
	const isItemLocked = !!lockedItemId;

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			noValidate
			aria-describedby="pack-item-description"
		>
			<Card className="w-full">
				<CardHeader>
					<CardTitle>Pack an item</CardTitle>
					<CardDescription id="pack-item-description">
						Choose what to add and how many.
					</CardDescription>
				</CardHeader>

				<CardContent>
					<FieldGroup>
						{/* ── Item selector ─────────────────────────── */}
						{isItemLocked ? (
							<Field>
								<FieldLabel>Item</FieldLabel>
								<Input
									value={
										lockedItemName ??
										(isLoadingItems
											? 'Loading…'
											: lockedItemId)
									}
									readOnly
									disabled
									aria-label="Item to pack (pre-selected)"
									className="bg-muted text-muted-foreground"
								/>
							</Field>
						) : (
							<Controller
								name="itemId"
								control={form.control}
								render={({ field, fieldState }) => {
									const errorId = 'pack-item-id-error';

									const selectedItem = items.find(
										(item) => item.id === field.value
									);

									return (
										<Field
											data-invalid={fieldState.invalid}
										>
											<FieldLabel htmlFor="pack-item-select">
												Item
											</FieldLabel>
											<Select
												value={field.value ?? ''}
												onValueChange={field.onChange}
												disabled={isLoadingItems}
											>
												<SelectTrigger
													id="pack-item-select"
													aria-invalid={
														fieldState.invalid
													}
													aria-describedby={
														fieldState.error
															? errorId
															: undefined
													}
												>
													{selectedItem ? (
														<span className="flex items-center gap-2">
															<HugeiconsIcon
																icon={
																	getEnumIcon(
																		ITEM_CATEGORY_OPTIONS,
																		selectedItem.category
																	) ??
																	TShirtIcon
																}
																className="text-muted-foreground h-3.5 w-3.5 shrink-0"
																aria-hidden="true"
															/>
															<span>
																{
																	selectedItem.name
																}
															</span>
														</span>
													) : (
														<SelectValue
															placeholder={
																isLoadingItems
																	? 'Loading items…'
																	: 'Choose an item'
															}
														/>
													)}
												</SelectTrigger>
												<SelectContent>
													{items.length === 0 &&
													!isLoadingItems ? (
														<div className="text-muted-foreground px-3 py-4 text-center text-sm">
															No items in your
															library yet.
														</div>
													) : (
														items.map((item) => (
															<SelectItem
																key={item.id}
																value={item.id}
															>
																<div className="flex w-full items-center justify-between gap-3">
																	{/* Name — primary label */}
																	<span className="truncate font-medium">
																		{
																			item.name
																		}
																	</span>

																	{/* Weight pill — secondary, only in dropdown */}
																	{item.weight !=
																		null && (
																		<span className="text-muted-foreground flex shrink-0 items-center gap-1 text-xs">
																			<HugeiconsIcon
																				icon={
																					WeightScale01Icon
																				}
																				className="h-3 w-3"
																				aria-hidden="true"
																			/>
																			{formatWeight(
																				item.weight,
																				item.weightUnit
																			)}
																		</span>
																	)}
																</div>
															</SelectItem>
														))
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
										</Field>
									);
								}}
							/>
						)}

						{/* ── Quantity ───────────────────────────────── */}
						<NumberField
							control={form.control}
							valueName="quantity"
							label="Quantity"
							placeholder="1"
							errors={form.formState.errors}
							valueErrorId="pack-item-quantity-error"
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
							{isSubmitting ? 'Packing…' : 'Pack it'}
						</Button>
					</Field>
				</CardFooter>
			</Card>
		</form>
	);
};

export default PackItemFormUI;
