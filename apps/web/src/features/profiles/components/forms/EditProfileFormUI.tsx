'use client';

import { Controller, UseFormReturn } from 'react-hook-form';
import type { EditProfileInput } from '@beggy/shared/types';
import { Gender } from '@beggy/shared/constants';
import { GENDER_OPTIONS, getEnumLabel } from '@shared-ui/mappers';

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
import { HugeiconsIcon } from '@hugeicons/react';
import { AlertCircleIcon } from '@hugeicons/core-free-icons';

import { AvatarUrlField } from '@shared-ui/fields';

// ─── Props ────────────────────────────────────────────────────────────────────

type EditProfileFormUIProps = {
	form: UseFormReturn<EditProfileInput>;
	onSubmit: (values: EditProfileInput) => void;
	isSubmitting?: boolean;
	/** Beggy-style error message from HttpClientError.body.message */
	serverError?: string | null;
	/** Beggy-style suggestion from HttpClientError.body.suggestion */
	serverSuggestion?: string | null;
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * EditProfileFormUI
 *
 * Purely presentational — no API calls, no routing, no side effects.
 * All fields are optional (PATCH semantics); empty = "don't change this field".
 *
 * Follows the same Field/FieldLabel/FieldError/FieldGroup pattern as
 * CreateUserFormUI for architectural consistency across the forms layer.
 */
const EditProfileFormUI = ({
	form,
	onSubmit,
	isSubmitting,
	serverError,
	serverSuggestion,
}: EditProfileFormUIProps) => {
	const firstName = form.watch('firstName');
	const lastName = form.watch('lastName');
	const displayName =
		[firstName, lastName].filter(Boolean).join(' ') || 'User';

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			noValidate
			aria-describedby="edit-profile-description"
		>
			<Card className="w-full sm:max-w-lg">
				<CardHeader>
					<CardTitle>Edit Profile</CardTitle>
					<CardDescription id="edit-profile-description">
						Update your personal details. All fields are optional —
						only changed fields will be saved.
					</CardDescription>
				</CardHeader>

				<CardContent>
					<FieldGroup>
						<section className="space-y-4">
							<h3 className="text-sm font-semibold text-foreground">
								Identity
							</h3>

							{/* ── Avatar URL — with live preview ───────────────── */}
							<AvatarUrlField
								control={form.control}
								displayName={displayName}
								disabled={isSubmitting}
							/>

							<div className="grid grid-cols-2 gap-4">
								{/* ── First Name ───────────────────────────────────── */}
								<Controller
									name="firstName"
									control={form.control}
									render={({ field, fieldState }) => {
										const errorId =
											'edit-profile-first-name-error';
										return (
											<Field
												data-invalid={
													fieldState.invalid
												}
											>
												<FieldLabel htmlFor="edit-profile-first-name">
													First Name
												</FieldLabel>
												<Input
													{...field}
													id="edit-profile-first-name"
													value={field.value ?? ''}
													placeholder="John"
													autoComplete="given-name"
													aria-invalid={
														fieldState.invalid
													}
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
														errors={[
															fieldState.error,
														]}
													/>
												)}
											</Field>
										);
									}}
								/>

								{/* ── Last Name ────────────────────────────────────── */}
								<Controller
									name="lastName"
									control={form.control}
									render={({ field, fieldState }) => {
										const errorId =
											'edit-profile-last-name-error';
										return (
											<Field
												data-invalid={
													fieldState.invalid
												}
											>
												<FieldLabel htmlFor="edit-profile-last-name">
													Last Name
												</FieldLabel>
												<Input
													{...field}
													id="edit-profile-last-name"
													value={field.value ?? ''}
													placeholder="Doe"
													autoComplete="family-name"
													aria-invalid={
														fieldState.invalid
													}
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
														errors={[
															fieldState.error,
														]}
													/>
												)}
											</Field>
										);
									}}
								/>
							</div>
						</section>

						<section className="space-y-4">
							<h3 className="text-sm font-semibold text-foreground">
								Personal details
							</h3>

							{/* Gender */}
							<Controller
								name="gender"
								control={form.control}
								render={({ field, fieldState }) => {
									const errorId = 'onboarding-gender-error';

									return (
										<Field
											data-invalid={fieldState.invalid}
										>
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
													<SelectValue placeholder="Select gender">
														{getEnumLabel<Gender>(
															GENDER_OPTIONS,
															field.value as any
														)}
													</SelectValue>
												</SelectTrigger>

												<SelectContent>
													{GENDER_OPTIONS.map(
														(option) => (
															<SelectItem
																key={
																	option.value
																}
																value={
																	option.value
																}
															>
																<div className="flex items-center gap-2">
																	{option.icon && (
																		<HugeiconsIcon
																			icon={
																				option.icon
																			}
																			className="size-4 text-muted-foreground"
																		/>
																	)}
																	<span>
																		{
																			option.label
																		}
																	</span>
																</div>
															</SelectItem>
														)
													)}
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

							{/* ── Birth Date ───────────────────────────────────── */}
							<Controller
								name="birthDate"
								control={form.control}
								render={({ field, fieldState }) => {
									const errorId =
										'edit-profile-birth-date-error';
									const descId =
										'edit-profile-birth-date-desc';
									return (
										<Field
											data-invalid={fieldState.invalid}
										>
											<FieldLabel htmlFor="edit-profile-birth-date">
												Date of Birth{' '}
												<span className="text-muted-foreground font-normal">
													(optional)
												</span>
											</FieldLabel>
											<Input
												{...field}
												id="edit-profile-birth-date"
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
																	e.target
																		.value
																)
															: undefined
													)
												}
												autoComplete="bday"
												aria-invalid={
													fieldState.invalid
												}
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
												Used to display your age on your
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
						</section>

						<section className="space-y-4">
							<h3 className="text-sm font-semibold text-foreground">
								Location
							</h3>

							<div className="grid grid-cols-2 gap-4">
								{/* ── Country ──────────────────────────────────────── */}
								<Controller
									name="country"
									control={form.control}
									render={({ field, fieldState }) => {
										const errorId =
											'edit-profile-country-error';
										return (
											<Field
												data-invalid={
													fieldState.invalid
												}
											>
												<FieldLabel htmlFor="edit-profile-country">
													Country{' '}
													<span className="text-muted-foreground font-normal">
														(optional)
													</span>
												</FieldLabel>
												<Input
													{...field}
													id="edit-profile-country"
													value={field.value ?? ''}
													placeholder="Egypt"
													autoComplete="country-name"
													aria-invalid={
														fieldState.invalid
													}
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
														errors={[
															fieldState.error,
														]}
													/>
												)}
											</Field>
										);
									}}
								/>

								{/* ── City ─────────────────────────────────────────── */}
								<Controller
									name="city"
									control={form.control}
									render={({ field, fieldState }) => {
										const errorId =
											'edit-profile-city-error';
										return (
											<Field
												data-invalid={
													fieldState.invalid
												}
											>
												<FieldLabel htmlFor="edit-profile-city">
													City{' '}
													<span className="text-muted-foreground font-normal">
														(optional)
													</span>
												</FieldLabel>
												<Input
													{...field}
													id="edit-profile-city"
													value={field.value ?? ''}
													placeholder="Cairo"
													autoComplete="address-level2"
													aria-invalid={
														fieldState.invalid
													}
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
														errors={[
															fieldState.error,
														]}
													/>
												)}
											</Field>
										);
									}}
								/>
							</div>
						</section>

						{/* ── Server-level error (HttpClientError) ─────────── */}
						{serverError && (
							// Soft destructive alert pattern from §12.7
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
					<Field orientation="horizontal">
						<Button
							type="button"
							variant="outline"
							onClick={() => form.reset()}
							disabled={isSubmitting}
						>
							Reset
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? 'Saving...' : 'Save Changes'}
						</Button>
					</Field>
				</CardFooter>
			</Card>
		</form>
	);
};

export default EditProfileFormUI;
