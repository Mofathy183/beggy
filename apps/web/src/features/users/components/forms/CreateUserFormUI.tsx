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
}: CreateUserFormUIProps) => {
	return (
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
				<form
					id="form-create-user"
					onSubmit={form.handleSubmit(onSubmit)}
					noValidate
					aria-describedby="create-user-description"
				>
					<FieldGroup>
						{/* =========================
						   First Name
						   ========================= */}
						<Controller
							name="firstName"
							control={form.control}
							render={({ field, fieldState }) => {
								const errorId = 'form-first-name-error';

								return (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="form-first-name">
											First Name
										</FieldLabel>

										<Input
											{...field}
											id="form-first-name"
											placeholder="John"
											autoComplete="given-name"
											required
											aria-required="true"
											aria-invalid={fieldState.invalid}
											aria-describedby={
												fieldState.error
													? errorId
													: undefined
											}
										/>

										{/* Field-level validation error */}
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

						{/* =========================
						   Last Name
						   ========================= */}
						<Controller
							name="lastName"
							control={form.control}
							render={({ field, fieldState }) => {
								const errorId = 'form-last-name-error';

								return (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="form-last-name">
											Last Name
										</FieldLabel>

										<Input
											{...field}
											id="form-last-name"
											placeholder="Doe"
											autoComplete="family-name"
											required
											aria-required="true"
											aria-invalid={fieldState.invalid}
											aria-describedby={
												fieldState.error
													? errorId
													: undefined
											}
										/>

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

						{/* =========================
						   Email
						   ========================= */}
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

						{/* =========================
						   Password
						   ========================= */}
						<Controller
							name="password"
							control={form.control}
							render={({ field, fieldState }) => {
								const errorId = 'form-password-error';
								const descId = 'form-password-desc';

								return (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="form-password">
											Password
										</FieldLabel>

										<Input
											{...field}
											id="form-password"
											type="password"
											placeholder="••••••••"
											autoComplete="new-password"
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
											Must be at least 8 characters.
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

						{/* =========================
						   Confirm Password
						   ========================= */}
						<Controller
							name="confirmPassword"
							control={form.control}
							render={({ field, fieldState }) => {
								const errorId = 'form-confirm-password-error';

								return (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="form-confirm-password">
											Confirm Password
										</FieldLabel>

										<Input
											{...field}
											id="form-confirm-password"
											type="password"
											placeholder="••••••••"
											autoComplete="new-password"
											required
											aria-required="true"
											aria-invalid={fieldState.invalid}
											aria-describedby={
												fieldState.error
													? errorId
													: undefined
											}
										/>

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

						{/* =========================
						   Avatar URL (Optional)
						   ========================= */}
						<Controller
							name="avatarUrl"
							control={form.control}
							render={({ field, fieldState }) => {
								const errorId = 'form-avatar-url-error';
								const descId = 'form-avatar-url-desc';

								return (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="form-avatar-url">
											Avatar URL
										</FieldLabel>

										<Input
											{...field}
											id="form-avatar-url"
											type="url"
											value={field.value ?? ''}
											placeholder="https://example.com/avatar.png"
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
											Optional. Provide a public image
											URL.
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

						{/* =========================
						   Server-Level Error
						   ========================= */}
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
				</form>
			</CardContent>

			{/* Footer actions separated for layout clarity */}
			<CardFooter>
				<Field orientation="horizontal">
					<Button
						type="button"
						variant="outline"
						onClick={() => form.reset()}
						disabled={isSubmitting}
					>
						Reset
					</Button>

					<Button
						type="submit"
						form="form-create-user"
						disabled={isSubmitting}
					>
						{isSubmitting ? 'Creating...' : 'Create User'}
					</Button>
				</Field>
			</CardFooter>
		</Card>
	);
};

export default CreateUserFormUI;
