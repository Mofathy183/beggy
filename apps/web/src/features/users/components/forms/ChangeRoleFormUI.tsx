'use client';

import { Controller, UseFormReturn } from 'react-hook-form';
import type { ChangeRoleInput } from '@beggy/shared/types';

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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@shadcn-ui/select';
import { FormServerError } from '@shared-ui/error';
import { Role } from '@beggy/shared/constants';

import { ROLE_OPTIONS, getEnumLabel } from '@shared-ui/mappers';

/**
 * Props for ChangeRoleFormUI.
 *
 * This component is purely presentational.
 * It receives a fully configured react-hook-form instance
 * from the container layer and renders the UI.
 *
 * Architectural note:
 * - No business logic or API calls should exist here.
 * - All mutations and side-effects must live in the container.
 */
type ChangeRoleFormUIProps = {
	/**
	 * react-hook-form instance configured in the container.
	 * Controls validation state and form lifecycle.
	 */
	form: UseFormReturn<ChangeRoleInput>;

	/**
	 * Wrapped submit handler from form.handleSubmit(...)
	 * Passed from container to keep separation of concerns.
	 */
	onSubmit: () => void;

	/**
	 * Indicates whether the mutation is currently in progress.
	 * Used to disable the submit button and provide feedback.
	 */
	isSubmitting?: boolean;

	/** Beggy-style error message from HttpClientError.body.message */
	serverError?: string | null;
	/** Beggy-style suggestion from HttpClientError.body.suggestion */
	serverSuggestion?: string | null;

	onCancel?: () => void;
};

/**
 * ChangeRoleFormUI
 *
 * A controlled, accessible form for updating a user's role.
 *
 * UX Goals:
 * - Clear hierarchy (Card layout)
 * - Immediate validation feedback
 * - Accessible aria attributes
 * - Clear error communication (field + server)
 * - Safe cancel/reset behavior
 */
const ChangeRoleFormUI = ({
	form,
	onSubmit,
	isSubmitting,
	serverError,
	serverSuggestion,
	onCancel,
}: ChangeRoleFormUIProps) => {
	return (
		<Card className="w-full sm:max-w-md">
			{/* Header section provides clear intent and context */}
			<CardHeader>
				<CardTitle>Change User Role</CardTitle>
				<CardDescription>
					Modify the selected user's access level.
				</CardDescription>
			</CardHeader>

			<CardContent>
				{/* 
					Form uses external submit button via `form` attribute.
					This allows flexible footer layout while maintaining accessibility.
				*/}
				<form id="form-change-role" onSubmit={onSubmit}>
					<FieldGroup>
						{/* 
							Controller is required because Select is not a native input.
							It bridges react-hook-form with controlled UI components.
						*/}
						<Controller
							name="role"
							control={form.control}
							render={({ field, fieldState }) => {
								const errorId = 'form-role-error';
								const descId = 'form-role-desc';

								return (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="form-role">
											Role
										</FieldLabel>

										{/* 
											Select is fully controlled via RHF.
											Accessibility:
											- aria-invalid for screen readers
											- aria-describedby links description + error
										*/}
										<Select
											value={field.value}
											onValueChange={field.onChange}
										>
											<SelectTrigger
												id="form-role"
												aria-invalid={
													fieldState.invalid
												}
												aria-required="true"
												aria-describedby={[
													descId,
													fieldState.error
														? errorId
														: null,
												]
													.filter(Boolean)
													.join(' ')}
											>
												<SelectValue placeholder="Select a role">
													{getEnumLabel<Role>(
														ROLE_OPTIONS,
														field.value as any
													)}
												</SelectValue>
											</SelectTrigger>

											<SelectContent>
												{/* 
													Role enum is centralized in shared constants.
													This ensures backend + frontend alignment.
												*/}
												{ROLE_OPTIONS.map((option) => (
													<SelectItem
														key={option.value}
														value={option.value}
													>
														<div className="flex items-center gap-2">
															<span>
																{option.label}
															</span>
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>

										{/* Helper text improves clarity and reduces mistakes */}
										<FieldDescription id={descId}>
											This will immediately update the
											user's permissions.
										</FieldDescription>

										{/* Field-level validation error */}
										{fieldState.error && (
											<FieldError
												id={errorId}
												className="text-destructive font-medium mt-1"
												role="alert"
												errors={[fieldState.error]}
											/>
										)}
									</Field>
								);
							}}
						/>

						{/* ── Server-level error (HttpClientError) ─────────── */}
						<FormServerError
							message={serverError}
							suggestion={serverSuggestion}
						/>
					</FieldGroup>
				</form>
			</CardContent>

			{/* 
				Footer contains action buttons.
				Cancel resets to defaultValues defined in container.
			*/}
			<CardFooter>
				<Field orientation="horizontal">
					<Button
						type="button"
						variant="outline"
						onClick={() => {
							form.reset();
							onCancel?.();
						}}
					>
						Cancel
					</Button>

					<Button
						type="submit"
						form="form-change-role"
						disabled={isSubmitting}
					>
						{isSubmitting ? 'Updating...' : 'Update Role'}
					</Button>
				</Field>
			</CardFooter>
		</Card>
	);
};

export default ChangeRoleFormUI;
