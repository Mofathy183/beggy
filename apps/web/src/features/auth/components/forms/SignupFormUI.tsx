'use client';

import { Controller, type UseFormReturn } from 'react-hook-form';
import { Button } from '@shadcn-ui/button';
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from '@shadcn-ui/field';
import { Input } from '@shadcn-ui/input';

import type { SignUpInput } from '@beggy/shared/types';
// ─── Props ────────────────────────────────────────────────────────────────────

type SignupFormUIProps = {
	/**
	 * react-hook-form instance using SignUpInput (pre-transform).
	 */
	form: UseFormReturn<SignUpInput>;

	/**
	 * Submit handler — already wrapped with form.handleSubmit in container.
	 * Receives post-transform values (confirmPassword stripped by Zod).
	 */
	onSubmit: (values: SignUpInput) => void;

	/** Mutation loading state. */
	isSubmitting?: boolean;

	/**
	 * Server-side error from useSignup hook.
	 * Covers: email already registered (409), rate limiting, etc.
	 */
	serverError?: string | null;
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * SignupFormUI
 *
 * Pure presentational signup form.
 * Renders only the fields required for account creation.
 *
 * UX decisions:
 * - First + Last name before email — builds identity context first
 * - Optional fields (avatar, gender, location) excluded intentionally —
 *   these belong in onboarding/profile, not account creation
 * - Password description sets expectations before the user types
 * - confirmPassword has no description — the label is self-explanatory
 * - Server error shown above submit — visible before re-attempting
 * - noValidate — Zod + RHF owns all validation
 */
const SignupFormUI = ({
	form,
	onSubmit,
	isSubmitting,
	serverError,
}: SignupFormUIProps) => (
	<form
		onSubmit={form.handleSubmit(onSubmit)}
		noValidate
		className="flex flex-col gap-5"
	>
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
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor="signup-first-name">
									First Name
								</FieldLabel>

								<Input
									{...field}
									id="signup-first-name"
									placeholder="Mohamed"
									autoComplete="given-name"
									required
									aria-required="true"
									aria-invalid={fieldState.invalid}
									aria-describedby={
										fieldState.error ? errorId : undefined
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
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor="signup-last-name">
									Last Name
								</FieldLabel>

								<Input
									{...field}
									id="signup-last-name"
									placeholder="Fathy"
									autoComplete="family-name"
									required
									aria-required="true"
									aria-invalid={fieldState.invalid}
									aria-describedby={
										fieldState.error ? errorId : undefined
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
					const errorId = 'signup-email-error';
					const descId = 'signup-email-desc';

					return (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel htmlFor="signup-email">
								Email
							</FieldLabel>

							<Input
								{...field}
								id="signup-email"
								type="email"
								placeholder="you@example.com"
								autoComplete="email"
								required
								aria-required={true}
								aria-invalid={fieldState.invalid}
								aria-describedby={[
									descId,
									fieldState.error ? errorId : null,
								]
									.filter(Boolean)
									.join(' ')}
								disabled={isSubmitting}
							/>

							<FieldDescription id={descId}>
								This will be your login email.
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

			{/* ── Password ──────────────────────────────────────────── */}
			<Controller
				name="password"
				control={form.control}
				render={({ field, fieldState }) => {
					const errorId = 'signup-password-error';
					const descId = 'signup-password-desc';

					return (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel htmlFor="signup-password">
								Password
							</FieldLabel>

							<Input
								{...field}
								id="signup-password"
								type="password"
								placeholder="••••••••"
								autoComplete="new-password"
								required
								aria-required="true"
								aria-invalid={fieldState.invalid}
								aria-describedby={[
									descId,
									fieldState.error ? errorId : null,
								]
									.filter(Boolean)
									.join(' ')}
								disabled={isSubmitting}
							/>

							<FieldDescription id={descId}>
								Must be at least 8 characters.
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

			{/* ── Confirm Password ──────────────────────────────────── */}
			<Controller
				name="confirmPassword"
				control={form.control}
				render={({ field, fieldState }) => {
					const errorId = 'signup-confirm-password-error';

					return (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel htmlFor="signup-confirm-password">
								Confirm Password
							</FieldLabel>

							<Input
								{...field}
								id="signup-confirm-password"
								type="password"
								placeholder="••••••••"
								autoComplete="new-password"
								required
								aria-required="true"
								aria-invalid={fieldState.invalid}
								aria-describedby={
									fieldState.error ? errorId : undefined
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

			{/* ── Server error ──────────────────────────────────────── */}
			{serverError && (
				<Field data-invalid>
					<FieldError
						role="alert"
						className="text-destructive font-medium mt-1"
						errors={[{ message: serverError }]}
					/>
				</Field>
			)}
		</FieldGroup>

		{/* ── Submit ────────────────────────────────────────────────── */}
		<Button type="submit" className="w-full" disabled={isSubmitting}>
			{isSubmitting ? 'Creating account...' : 'Create account'}
		</Button>
	</form>
);

export default SignupFormUI;
