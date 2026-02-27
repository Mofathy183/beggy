'use client';

import { Controller, type UseFormReturn } from 'react-hook-form';
import type { LoginInput } from '@beggy/shared/types';
import { Button } from '@shadcn-ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@shadcn-ui/field';
import { Input } from '@shadcn-ui/input';

type LoginFormUIProps = {
	form: UseFormReturn<LoginInput>;
	onSubmit: (values: LoginInput) => void;
	isSubmitting?: boolean;
	serverError?: string | null;
};

const LoginFormUI = ({
	form,
	onSubmit,
	isSubmitting,
	serverError,
}: LoginFormUIProps) => (
	<form
		onSubmit={form.handleSubmit(onSubmit)}
		noValidate
		className="flex flex-col gap-5"
	>
		<FieldGroup>
			{/* Email */}
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

			{/* Password */}
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

			{/* Server error */}
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

		<Button type="submit" className="w-full" disabled={isSubmitting}>
			{isSubmitting ? 'Signing in...' : 'Sign in'}
		</Button>
	</form>
);

export default LoginFormUI;
