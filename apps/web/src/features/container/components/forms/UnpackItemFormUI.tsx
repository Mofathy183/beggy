'use client';

import { UseFormReturn } from 'react-hook-form';

import { Button } from '@shadcn-ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@shadcn-ui/card';
import { Field, FieldGroup, FieldLabel } from '@shadcn-ui/field';
import { Input } from '@shadcn-ui/input';
import { FormServerError } from '@shared-ui/error';
import { NumberField } from '@shared-ui/fields';

import type { UnpackItemInput } from '@beggy/shared/types';

// ─── Props ─────────────────────────────────────────────────────────────────────

/**
 * Props for {@link UnpackItemFormUI}.
 *
 * @description
 * Pure UI contract for removing items from a container.
 * All validation and mutation logic are handled upstream.
 */
type UnpackItemFormUIProps = {
	form: UseFormReturn<UnpackItemInput>;
	onSubmit: (values: UnpackItemInput) => void;
	onCancel?: () => void;
	isSubmitting?: boolean;
	serverError?: string | null;
	serverSuggestion?: string | null;

	/** Display name of the item being unpacked. */
	itemName: string;

	/**
	 * Maximum quantity available to unpack.
	 *
	 * @remarks
	 * Should be enforced at validation layer; UI only communicates the constraint.
	 */
	maxQuantity: number;
};

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * Form UI for unpacking items.
 *
 * @description
 * Renders a minimal form where the item is fixed and the user specifies
 * the quantity to remove.
 *
 * @remarks
 * - Item field is read-only
 * - Quantity is the only editable input
 * - Does not enforce constraints directly (delegated to schema/UI field)
 */
const UnpackItemFormUI = ({
	form,
	onSubmit,
	onCancel,
	isSubmitting,
	serverError,
	serverSuggestion,
	itemName,
	maxQuantity,
}: UnpackItemFormUIProps) => {
	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			noValidate
			aria-describedby="unpack-item-description"
		>
			<Card className="w-full sm:max-w-sm">
				<CardHeader>
					<CardTitle>Remove from bag</CardTitle>
					<CardDescription id="unpack-item-description">
						How many are you taking out?
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
								aria-label="Item being unpacked"
								className="bg-muted text-muted-foreground"
							/>
						</Field>

						{/* ── Quantity ───────────────────────────────── */}
						<NumberField
							control={form.control}
							valueName="quantity"
							label={`Quantity (max ${maxQuantity})`}
							placeholder="1"
							errors={form.formState.errors}
							valueErrorId="unpack-item-quantity-error"
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
						<Button
							type="submit"
							variant="destructive"
							disabled={isSubmitting}
						>
							{isSubmitting ? 'Removing…' : 'Remove it'}
						</Button>
					</Field>
				</CardFooter>
			</Card>
		</form>
	);
};

export default UnpackItemFormUI;
