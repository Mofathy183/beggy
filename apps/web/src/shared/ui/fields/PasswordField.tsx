'use client';

import { useState } from 'react';
import {
	Controller,
	type Control,
	type FieldValues,
	type Path,
} from 'react-hook-form';
import { HugeiconsIcon } from '@hugeicons/react';
import { ViewIcon, ViewOffIcon } from '@hugeicons/core-free-icons';
import { Button } from '@shadcn-ui/button';
import { Field, FieldDescription, FieldError } from '@shadcn-ui/field';
import { FieldLabel } from '@shadcn-ui/field';
import { Input } from '@shadcn-ui/input';
import { cn } from '@/shared/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type PasswordFieldProps<T extends FieldValues> = {
	/**
	 * react-hook-form control instance from the parent form.
	 */
	control: Control<T>;

	/**
	 * Field name for the password field.
	 * Must be a valid key of the form schema.
	 * @default 'password'
	 */
	passwordName?: Path<T>;

	/**
	 * Field name for the confirm password field.
	 * Pass `null` to render only the password field (e.g. login, reset flows).
	 * @default 'confirmPassword'
	 */
	confirmPasswordName?: Path<T> | null;

	/**
	 * Label text for the password field.
	 * @default 'Password'
	 */
	passwordLabel?: string;

	/**
	 * Label text for the confirm password field.
	 * @default 'Confirm Password'
	 */
	confirmPasswordLabel?: string;

	/**
	 * Helper text shown below the password input.
	 * Pass `null` to hide the description entirely.
	 * @default 'Must be at least 8 characters.'
	 */
	passwordDescription?: string | null;

	/**
	 * autoComplete value for the password field.
	 * Use 'current-password' for login, 'new-password' for signup/reset.
	 * @default 'new-password'
	 */
	passwordAutoComplete?: 'current-password' | 'new-password';

	/**
	 * Disables both fields — pass `isSubmitting` from the parent form.
	 */
	disabled?: boolean;

	/**
	 * Optional className forwarded to the wrapping fragment container.
	 * Useful for spacing overrides from the parent FieldGroup.
	 */
	className?: string;
};

// ─── Sub-component: Toggle button ─────────────────────────────────────────────

type VisibilityToggleProps = {
	visible: boolean;
	onToggle: () => void;
	fieldId: string;
};

/**
 * VisibilityToggle
 *
 * Both icons are always mounted — visibility is toggled with CSS opacity/scale
 * rather than a conditional render. This avoids the unmount→remount cycle that
 * HugeiconsIcon triggers on each click, which was causing the perceived lag and
 * the "multiple clicks needed" issue.
 *
 * onClick calls e.stopPropagation() so the click never reaches the parent
 * <div className="relative"> wrapper, preventing the input from losing and
 * immediately re-gaining focus (which also made the toggle feel unresponsive).
 *
 * transition-colors is intentionally removed — shadcn Button already owns its
 * own internal hover transition; stacking a second one created the jank.
 */
const VisibilityToggle = ({
	visible,
	onToggle,
	fieldId,
}: VisibilityToggleProps) => {
	return (
		<Button
			type="button"
			variant="ghost"
			size="icon"
			aria-label={visible ? 'Hide password' : 'Show password'}
			aria-controls={fieldId}
			aria-pressed={visible}
			onClick={(e) => {
				e.stopPropagation();
				onToggle();
			}}
			className={cn(
				'absolute end-1 top-1/2 -translate-y-1/2',
				'h-7 w-7 shrink-0',
				'text-muted-foreground hover:text-foreground hover:bg-accent'
			)}
		>
			{/* ViewIcon — shown when password is hidden (visible = false) */}
			<HugeiconsIcon
				icon={ViewIcon}
				className={cn(
					'h-4 w-4 absolute transition-[opacity,transform] duration-150',
					visible
						? 'opacity-0 scale-75 pointer-events-none'
						: 'opacity-100 scale-100'
				)}
			/>

			{/* ViewOffIcon — shown when password is visible (visible = true) */}
			<HugeiconsIcon
				icon={ViewOffIcon}
				className={cn(
					'h-4 w-4 absolute transition-[opacity,transform] duration-150',
					visible
						? 'opacity-100 scale-100'
						: 'opacity-0 scale-75 pointer-events-none'
				)}
			/>
		</Button>
	);
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * PasswordField
 *
 * Reusable password + confirm-password field pair for react-hook-form forms.
 *
 * Usage:
 * - Signup form  → both fields (default)
 * - Reset form   → both fields with passwordAutoComplete="new-password"
 * - Login form   → confirmPasswordName={null} + passwordAutoComplete="current-password"
 *
 * Must be rendered inside a <FieldGroup> in the parent form.
 *
 * @example
 * // Signup / Reset — both fields
 * <PasswordFields control={form.control} disabled={isSubmitting} />
 *
 * @example
 * // Login — password only
 * <PasswordField
 *   control={form.control}
 *   confirmPasswordName={null}
 *   passwordAutoComplete="current-password"
 *   passwordDescription={null}
 *   disabled={isSubmitting}
 * />
 *
 * @example
 * // Custom field names (e.g. if your schema uses different keys)
 * <PasswordField
 *   control={form.control}
 *   passwordName="newPassword"
 *   confirmPasswordName="newPasswordConfirm"
 *   passwordLabel="New Password"
 *   confirmPasswordLabel="Repeat New Password"
 *   disabled={isSubmitting}
 * />
 */
const PasswordField = <T extends FieldValues>({
	control,
	passwordName = 'password' as Path<T>,
	confirmPasswordName = 'confirmPassword' as Path<T>,
	passwordLabel = 'Password',
	confirmPasswordLabel = 'Confirm Password',
	passwordDescription = 'Must be at least 8 characters.',
	passwordAutoComplete = 'new-password',
	disabled = false,
	className,
}: PasswordFieldProps<T>) => {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);

	const passwordFieldId = 'field-password';
	const confirmFieldId = 'field-confirm-password';
	const passwordErrorId = 'field-password-error';
	const passwordDescId = 'field-password-desc';
	const confirmErrorId = 'field-confirm-password-error';

	return (
		<>
			{/* ── Password ──────────────────────────────────────────── */}
			<Controller
				name={passwordName}
				control={control}
				render={({ field, fieldState }) => (
					<Field
						data-invalid={fieldState.invalid || undefined}
						className={className}
					>
						<FieldLabel htmlFor={passwordFieldId}>
							{passwordLabel}
						</FieldLabel>

						<div className="relative">
							<Input
								{...field}
								id={passwordFieldId}
								type={showPassword ? 'text' : 'password'}
								placeholder="••••••••"
								autoComplete={passwordAutoComplete}
								required
								aria-required="true"
								aria-invalid={fieldState.invalid}
								aria-describedby={
									[
										passwordDescription
											? passwordDescId
											: null,
										fieldState.error
											? passwordErrorId
											: null,
									]
										.filter(Boolean)
										.join(' ') || undefined
								}
								disabled={disabled}
								className="pe-9"
							/>

							<VisibilityToggle
								visible={showPassword}
								onToggle={() => setShowPassword((v) => !v)}
								fieldId={passwordFieldId}
							/>
						</div>

						{passwordDescription && (
							<FieldDescription id={passwordDescId}>
								{passwordDescription}
							</FieldDescription>
						)}

						{fieldState.error && (
							<FieldError
								id={passwordErrorId}
								role="alert"
								className="text-destructive font-medium mt-1"
								errors={[fieldState.error]}
							/>
						)}
					</Field>
				)}
			/>

			{/* ── Confirm Password ──────────────────────────────────── */}
			{confirmPasswordName !== null && (
				<Controller
					name={confirmPasswordName}
					control={control}
					render={({ field, fieldState }) => (
						<Field
							data-invalid={fieldState.invalid || undefined}
							className={className}
						>
							<FieldLabel htmlFor={confirmFieldId}>
								{confirmPasswordLabel}
							</FieldLabel>

							<div className="relative">
								<Input
									{...field}
									id={confirmFieldId}
									type={showConfirm ? 'text' : 'password'}
									placeholder="••••••••"
									autoComplete="new-password"
									required
									aria-required="true"
									aria-invalid={fieldState.invalid}
									aria-describedby={
										fieldState.error
											? confirmErrorId
											: undefined
									}
									disabled={disabled}
									className="pe-9"
								/>

								<VisibilityToggle
									visible={showConfirm}
									onToggle={() => setShowConfirm((v) => !v)}
									fieldId={confirmFieldId}
								/>
							</div>

							{fieldState.error && (
								<FieldError
									id={confirmErrorId}
									role="alert"
									className="text-destructive font-medium mt-1"
									errors={[fieldState.error]}
								/>
							)}
						</Field>
					)}
				/>
			)}
		</>
	);
};

export default PasswordField;
