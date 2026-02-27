'use client';

import { Controller, type UseFormReturn } from 'react-hook-form';
import type { LoginInput } from '@beggy/shared/types';
import { Button } from '@shadcn-ui/button';
import { Label } from '@shadcn-ui/label';
import { Checkbox } from '@shadcn-ui/checkbox';

import { Field, FieldError, FieldGroup, FieldLabel } from '@shadcn-ui/field';
import { Input } from '@shadcn-ui/input';
import { cn } from '@shared/lib/utils';

// ─── Props ────────────────────────────────────────────────────────────────────

type LoginFormUIProps = {
	/**
	 * react-hook-form instance configured in LoginForm container.
	 * Controls validation state and form lifecycle.
	 */
	form: UseFormReturn<LoginInput>;

	/**
	 * Submit handler — already wrapped with form.handleSubmit in container.
	 */
	onSubmit: (values: LoginInput) => void;

	/**
	 * Mutation loading state.
	 * Disables all inputs and submit button during request.
	 */
	isSubmitting?: boolean;

	/**
	 * Server-side error string from useLogin hook.
	 * Covers: wrong credentials, inactive account, rate limiting.
	 */
	serverError?: string | null;
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * LoginFormUI
 *
 * Pure presentational login form.
 * Zero business logic, zero API calls, zero routing.
 *
 * UX decisions:
 * - Email field first — matches user's mental model (email is identity)
 * - Password second — natural credential pair flow
 * - Server error shown above submit — user sees it before re-attempting
 * - All inputs disabled during submission — prevents double-submit
 * - noValidate — Zod + RHF owns all validation messaging
 */
const LoginFormUI = ({
	form,
	onSubmit,
	isSubmitting,
	serverError,
}: LoginFormUIProps) => (
	<form
		onSubmit={form.handleSubmit(onSubmit)}
		noValidate
		aria-describedby="login-form-description"
		className="flex flex-col gap-5"
	>
		<FieldGroup>
			{/* ── Email ─────────────────────────────────────────────── */}
			<Controller
				name="email"
				control={form.control}
				render={({ field, fieldState }) => {
					const errorId = 'login-email-error';

					return (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel htmlFor="login-email">Email</FieldLabel>

							<Input
								{...field}
								id="login-email"
								type="email"
								placeholder="you@example.com"
								autoComplete="email"
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

			{/* ── Password ──────────────────────────────────────────── */}
			<Controller
				name="password"
				control={form.control}
				render={({ field, fieldState }) => {
					const errorId = 'login-password-error';

					return (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel htmlFor="login-password">
								Password
							</FieldLabel>

							<Input
								{...field}
								id="login-password"
								type="password"
								placeholder="••••••••"
								autoComplete="current-password"
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

			{/* ── RememberMe ────────────────────────────────────────── */}
			<Controller
				name="rememberMe"
				control={form.control}
				render={({ field }) => (
					<Field>
						<div
							className={cn(
								'flex items-center gap-2.5',
								isSubmitting && 'pointer-events-none opacity-50'
							)}
						>
							<Checkbox
								id="login-remember-me"
								checked={field.value}
								onCheckedChange={field.onChange}
								onBlur={field.onBlur}
								disabled={isSubmitting}
								ref={field.ref}
							/>
							<Label
								htmlFor="login-remember-me"
								className={cn(
									'cursor-pointer select-none',
									'text-sm text-muted-foreground',
									'transition-colors hover:text-foreground'
								)}
							>
								Keep me signed in
							</Label>
						</div>
					</Field>
				)}
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
			{isSubmitting ? 'Signing in...' : 'Sign in'}
		</Button>
	</form>
);

export default LoginFormUI;
