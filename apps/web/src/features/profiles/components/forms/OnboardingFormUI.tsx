'use client';

import { Controller, UseFormReturn } from 'react-hook-form';
import type { EditProfileInput } from '@beggy/shared/types';
import { Gender } from '@beggy/shared/constants';

import { Button } from '@shared/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@shared/components/ui/card';
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from '@shared/components/ui/field';
import { Input } from '@shared/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@shared/components/ui/select';
import {
	Alert,
	AlertDescription,
	AlertTitle,
} from '@shared/components/ui/alert';
import { Separator } from '@shared/components/ui/separator';
import { HugeiconsIcon } from '@hugeicons/react';
import { AlertCircleIcon, Luggage01Icon } from '@hugeicons/core-free-icons';

// ─── Props ────────────────────────────────────────────────────────────────────

type OnboardingFormUIProps = {
	form: UseFormReturn<EditProfileInput>;
	onSubmit: (values: EditProfileInput) => void;
	isSubmitting?: boolean;
	serverError?: string | null;
	serverSuggestion?: string | null;
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * OnboardingFormUI
 *
 * Purely presentational — no API calls, no routing, no side effects.
 *
 * Tone: warm welcome, not a form. Copy reflects §12.1:
 * "warm, travel-inspired, approachable". Section headers break the fields
 * into digestible groups so new users don't feel overwhelmed.
 *
 * Same Field/FieldLabel/FieldError/FieldGroup pattern as CreateUserFormUI
 * and EditProfileFormUI for architectural consistency.
 */
const OnboardingFormUI = ({
	form,
	onSubmit,
	isSubmitting,
	serverError,
	serverSuggestion,
}: OnboardingFormUIProps) => {
	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			noValidate
			aria-describedby="onboarding-description"
		>
			<Card className="w-full sm:max-w-lg">
				<CardHeader>
					{/* Brand icon — subtle travel flavour */}
					<div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
						<HugeiconsIcon
							icon={Luggage01Icon}
							size={20}
							className="text-primary"
						/>
					</div>
					<CardTitle className="text-xl">
						Let&apos;s set up your traveler profile
					</CardTitle>
					<CardDescription id="onboarding-description">
						Tell us a little about yourself. You can always update
						these later in settings.
					</CardDescription>
				</CardHeader>

				<CardContent>
					<FieldGroup>
						{/* ── Section: Identity ────────────────────────────── */}
						<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
							Your Identity
						</p>

						{/* First Name */}
						<Controller
							name="firstName"
							control={form.control}
							render={({ field, fieldState }) => {
								const errorId = 'onboarding-first-name-error';
								return (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="onboarding-first-name">
											First Name
										</FieldLabel>
										<Input
											{...field}
											id="onboarding-first-name"
											value={field.value ?? ''}
											placeholder="What do your travel companions call you?"
											autoComplete="given-name"
											aria-invalid={fieldState.invalid}
											aria-describedby={
												fieldState.error
													? errorId
													: undefined
											}
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
								const errorId = 'onboarding-last-name-error';
								return (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="onboarding-last-name">
											Last Name
										</FieldLabel>
										<Input
											{...field}
											id="onboarding-last-name"
											value={field.value ?? ''}
											placeholder="Doe"
											autoComplete="family-name"
											aria-invalid={fieldState.invalid}
											aria-describedby={
												fieldState.error
													? errorId
													: undefined
											}
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

						{/* Gender */}
						<Controller
							name="gender"
							control={form.control}
							render={({ field, fieldState }) => {
								const errorId = 'onboarding-gender-error';
								return (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="onboarding-gender">
											Gender{' '}
											<span className="text-muted-foreground font-normal">
												(optional)
											</span>
										</FieldLabel>
										<Select
											value={field.value ?? ''}
											onValueChange={(val) =>
												field.onChange(
													val === ''
														? undefined
														: (val as Gender)
												)
											}
										>
											<SelectTrigger
												id="onboarding-gender"
												aria-invalid={
													fieldState.invalid
												}
												aria-describedby={
													fieldState.error
														? errorId
														: undefined
												}
											>
												<SelectValue placeholder="Select gender" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value={Gender.MALE}>
													Male
												</SelectItem>
												<SelectItem
													value={Gender.FEMALE}
												>
													Female
												</SelectItem>
												<SelectItem
													value={Gender.OTHER}
												>
													Other
												</SelectItem>
											</SelectContent>
										</Select>
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

						<Separator className="my-1" />

						{/* ── Section: Where are you based? ────────────────── */}
						<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
							Where are you based?
						</p>

						{/* Country */}
						<Controller
							name="country"
							control={form.control}
							render={({ field, fieldState }) => {
								const errorId = 'onboarding-country-error';
								return (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="onboarding-country">
											Country{' '}
											<span className="text-muted-foreground font-normal">
												(optional)
											</span>
										</FieldLabel>
										<Input
											{...field}
											id="onboarding-country"
											value={field.value ?? ''}
											placeholder="Egypt"
											autoComplete="country-name"
											aria-invalid={fieldState.invalid}
											aria-describedby={
												fieldState.error
													? errorId
													: undefined
											}
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

						{/* City */}
						<Controller
							name="city"
							control={form.control}
							render={({ field, fieldState }) => {
								const errorId = 'onboarding-city-error';
								return (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="onboarding-city">
											City{' '}
											<span className="text-muted-foreground font-normal">
												(optional)
											</span>
										</FieldLabel>
										<Input
											{...field}
											id="onboarding-city"
											value={field.value ?? ''}
											placeholder="Cairo"
											autoComplete="address-level2"
											aria-invalid={fieldState.invalid}
											aria-describedby={
												fieldState.error
													? errorId
													: undefined
											}
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

						<Separator className="my-1" />

						{/* ── Section: A little more ───────────────────────── */}
						<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
							A little more
						</p>

						{/* Birth Date */}
						<Controller
							name="birthDate"
							control={form.control}
							render={({ field, fieldState }) => {
								const errorId = 'onboarding-birth-date-error';
								const descId = 'onboarding-birth-date-desc';
								return (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="onboarding-birth-date">
											Date of Birth{' '}
											<span className="text-muted-foreground font-normal">
												(optional)
											</span>
										</FieldLabel>
										<Input
											{...field}
											id="onboarding-birth-date"
											type="date"
											value={
												field.value
													? new Date(field.value)
															.toISOString()
															.split('T')[0]
													: ''
											}
											onChange={(e) =>
												field.onChange(
													e.target.value
														? new Date(
																e.target.value
															)
														: undefined
												)
											}
											autoComplete="bday"
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
											Used to show your age on your
											profile.
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

						{/* ── Server-level error ────────────────────────────── */}
						{serverError && (
							<Alert
								variant="destructive"
								role="alert"
								aria-live="polite"
								className="border-destructive/30 bg-destructive/8 text-foreground"
							>
								<HugeiconsIcon
									icon={AlertCircleIcon}
									size={16}
									className="text-destructive"
								/>
								<AlertTitle className="text-destructive font-semibold">
									{serverError}
								</AlertTitle>
								{serverSuggestion && (
									<AlertDescription className="text-muted-foreground text-sm">
										{serverSuggestion}
									</AlertDescription>
								)}
							</Alert>
						)}
					</FieldGroup>
				</CardContent>

				<CardFooter>
					<Button
						type="submit"
						className="w-full"
						disabled={isSubmitting}
					>
						{isSubmitting
							? 'Setting up your profile...'
							: "Let's go →"}
					</Button>
				</CardFooter>
			</Card>
		</form>
	);
};

export default OnboardingFormUI;
