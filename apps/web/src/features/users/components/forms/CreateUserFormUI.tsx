'use client';

import { Controller, UseFormReturn } from 'react-hook-form';
import type { CreateUserInput } from '@beggy/shared/types';

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

import { PasswordField } from '@shared-ui/fields';

/**
 * Props for CreateUserFormUI.
 *
 * This component is purely presentational.
 * It does not contain business logic or mutation logic.
 *
 * Architectural principle:
 * - Container handles API + side effects.
 * - UI handles rendering + accessibility.
 */
type CreateUserFormUIProps = {
	/**
	 * react-hook-form instance configured in the container layer.
	 * Manages validation, form state, and submission lifecycle.
	 */
	form: UseFormReturn<CreateUserInput>;

	/**
	 * Submission handler injected from container.
	 * Must already be wrapped with form.handleSubmit.
	 */
	onSubmit: (values: CreateUserInput) => void;

	/**
	 * Indicates mutation loading state.
	 * Used to disable buttons and provide feedback.
	 */
	isSubmitting?: boolean;

	/**
	 * Server-side error message returned from backend.
	 * Displayed as a form-level error block.
	 */
	serverError?: string | null;

	onCancel?: () => void;
};

/**
 * CreateUserFormUI
 *
 * Accessible, validated form for creating a new user.
 *
 * UX Goals:
 * - Clear vertical rhythm
 * - Immediate validation feedback
 * - Accessible aria relationships
 * - Predictable submit/reset behavior
 * - Strong error visibility
 */
const CreateUserFormUI = ({
	form,
	onSubmit,
	isSubmitting,
	serverError,
	onCancel,
}: CreateUserFormUIProps) => {
	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			noValidate
			aria-describedby="create-user-description"
		>
			<Card className="w-full sm:max-w-lg">
				{/* Header establishes form intent */}
				<CardHeader>
					<CardTitle>Create User</CardTitle>
					<CardDescription id="create-user-description">
						Add a new user to the Beggy platform.
					</CardDescription>
				</CardHeader>

				<CardContent>
					{/* 
                        noValidate disables native browser validation
                        so Zod + RHF fully control validation messaging.
                 */}

					<FieldGroup>
						{/* ── Name row ──────────────────────────────────────────── */}
						<div className="grid grid-cols-2 gap-4">
							{/* First Name */}
							<Controller
								name="firstName"
								control={form.control}
								render={({ field, fieldState }) => {
									const errorId = 'signup-first-name-error';

									return (
										<Field
											data-invalid={fieldState.invalid}
										>
											<FieldLabel htmlFor="signup-first-name">
												First Name
											</FieldLabel>

											<Input
												{...field}
												id="signup-first-name"
												placeholder="Bruce"
												autoComplete="given-name"
												required
												aria-required="true"
												aria-invalid={
													fieldState.invalid
												}
												aria-describedby={
													fieldState.error
														? errorId
														: undefined
												}
												disabled={isSubmitting}
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

							{/* Last Name */}
							<Controller
								name="lastName"
								control={form.control}
								render={({ field, fieldState }) => {
									const errorId = 'signup-last-name-error';

									return (
										<Field
											data-invalid={fieldState.invalid}
										>
											<FieldLabel htmlFor="signup-last-name">
												Last Name
											</FieldLabel>

											<Input
												{...field}
												id="signup-last-name"
												placeholder="Wayne"
												autoComplete="family-name"
												required
												aria-required="true"
												aria-invalid={
													fieldState.invalid
												}
												aria-describedby={
													fieldState.error
														? errorId
														: undefined
												}
												disabled={isSubmitting}
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
						</div>

						{/* ── Email ─────────────────────────────────────────────── */}
						<Controller
							name="email"
							control={form.control}
							render={({ field, fieldState }) => {
								const errorId = 'form-email-error';
								const descId = 'form-email-desc';

								return (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="form-email">
											Email
										</FieldLabel>

										<Input
											{...field}
											id="form-email"
											type="email"
											placeholder="john@example.com"
											autoComplete="email"
											required
											aria-required="true"
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
											This email will be used for login.
										</FieldDescription>

										{fieldState.error && (
											<FieldError
												className="text-destructive font-medium mt-1"
												id={errorId}
												role="alert"
												errors={[fieldState.error]}
											/>
										)}
									</Field>
								);
							}}
						/>

						{/* ── Password + Confirm Password ───────────────────────── */}
						<PasswordField
							control={form.control}
							disabled={isSubmitting}
						/>

						{/* ── Server error ──────────────────────────────────────── */}
						{serverError && (
							<Field data-invalid>
								<FieldError
									className="text-destructive font-medium mt-1"
									role="alert"
									errors={[{ message: serverError }]}
								/>
							</Field>
						)}
					</FieldGroup>
				</CardContent>

				{/* Footer actions separated for layout clarity */}
				{/* ── Submit ────────────────────────────────────────────────── */}
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
							{isSubmitting ? 'Creating...' : 'Create User'}
						</Button>
					</Field>
				</CardFooter>
			</Card>
		</form>
	);
};

export default CreateUserFormUI;
