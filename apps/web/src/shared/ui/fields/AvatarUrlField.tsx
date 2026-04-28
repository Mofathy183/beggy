'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import {
	Controller,
	type Control,
	type FieldValues,
	type Path,
} from 'react-hook-form';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, ImageNotFound01Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/shared/components/ui/button';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from '@/shared/components/ui/field';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Debounce delay before attempting to load a new URL (ms) */
const PREVIEW_DEBOUNCE_MS = 350;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Derive up to 2 initials from a display name.
 * "Bruce Wayne" → "BW", "Bruce" → "B", "" → null
 */
const getInitials = (name: string): string | null => {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (!parts.length) return null;
	return parts
		.slice(0, 2)
		.map((p) => p[0]?.toUpperCase())
		.join('');
};

// ─── Types ────────────────────────────────────────────────────────────────────

type PreviewState = 'empty' | 'loading' | 'loaded' | 'error';

type AvatarUrlFieldProps<T extends FieldValues> = {
	/** react-hook-form control from the parent form */
	control: Control<T>;

	/**
	 * Field name — must be a valid key of the form schema.
	 * @default 'avatarUrl'
	 */
	name?: Path<T>;

	/**
	 * Label text.
	 * @default 'Avatar URL'
	 */
	label?: string;

	/**
	 * Description shown below the input.
	 * Pass `null` to hide entirely.
	 * @default 'Optional. Provide a public image URL.'
	 */
	description?: string | null;

	/**
	 * Displayed name used inside the avatar fallback aria-label.
	 * Useful when the form has a firstName/lastName context.
	 * @default 'User'
	 */
	displayName?: string;

	/** Disable the field — pass `isSubmitting` from parent form */
	disabled?: boolean;

	/** Optional className forwarded to the outer Field wrapper */
	className?: string;
};

// ─── Sub-component: Avatar preview ────────────────────────────────────────────

type AvatarPreviewProps = {
	url: string;
	previewState: PreviewState;
	onLoad: () => void;
	onError: () => void;
	displayName: string;
};

/**
 * AvatarPreview
 *
 * Renders the four visual states of the avatar preview:
 * - empty   → shadcn AvatarFallback with initials (if displayName set) or icon
 * - loading → skeleton pulse overlay while Next.js Image fetches
 * - loaded  → the actual image, crossfaded in with opacity transition
 * - error   → AvatarFallback with broken-image icon + destructive tint
 *
 * Uses shadcn <Avatar> + <AvatarFallback> for the empty/error state so the
 * fallback matches the app's avatar style everywhere (sidebar, profile card).
 * Uses Next.js <Image> with unoptimized=true for the preview — unoptimized
 * is correct here because the URL is user-provided and external, so Next.js
 * cannot know the domain at build time and optimization would fail.
 * The image stays mounted while loading so the browser never aborts the fetch.
 */
const AvatarPreview = ({
	url,
	previewState,
	onLoad,
	onError,
	displayName,
}: AvatarPreviewProps) => {
	const isLoading = previewState === 'loading';
	const isLoaded = previewState === 'loaded';
	const isError = previewState === 'error';

	const initials = getInitials(displayName);

	return (
		<Avatar
			aria-label={
				isLoaded
					? `Preview of ${displayName}'s avatar`
					: 'Avatar preview'
			}
			aria-busy={isLoading}
			className={cn(
				'w-20 h-20 border-2 transition-colors duration-200',
				// State-driven border colour
				!isLoaded && !isError && 'border-border',
				isLoaded && 'border-primary/40',
				isError && 'border-destructive/40'
			)}
		>
			{/* ── Actual image via Next.js — always mounted when URL exists ── */}
			{url && (
				<Image
					key={url}
					src={url}
					alt={`${displayName} avatar preview`}
					fill
					/*
					 * unoptimized: user-supplied external URLs have no known
					 * domain — Next.js image optimization requires domains to
					 * be allow-listed in next.config. For a live preview of
					 * arbitrary URLs, unoptimized is the correct approach.
					 */
					unoptimized
					onLoad={onLoad}
					onError={onError}
					className={cn(
						'object-cover rounded-full',
						'transition-opacity duration-300',
						isLoaded ? 'opacity-100' : 'opacity-0'
					)}
				/>
			)}

			{/* ── Skeleton pulse — shown while loading ── */}
			{isLoading && (
				<span
					className="absolute inset-0 rounded-full bg-muted animate-pulse"
					aria-hidden="true"
				/>
			)}

			{/* ── Fallback — shown when empty or error ── */}
			<AvatarFallback
				className={cn(
					'text-sm font-medium select-none transition-colors',
					isError
						? 'bg-destructive/5 text-destructive/60'
						: 'bg-muted text-muted-foreground'
				)}
			>
				{isError ? (
					/*
					 * Broken image icon — tells the user the URL didn't load,
					 * distinct from the "no URL yet" empty state.
					 */
					<HugeiconsIcon
						icon={ImageNotFound01Icon}
						className="h-7 w-7 text-destructive/60"
					/>
				) : initials ? (
					/*
					 * Initials from displayName — shown when the user has
					 * typed their name but hasn't set a URL yet. Matches how
					 * the Avatar renders across the rest of the app.
					 */
					initials
				) : (
					/*
					 * Generic fallback — shown when displayName is empty.
					 * Uses shadcn's default Avatar placeholder character.
					 */
					<span className="text-lg text-muted-foreground/50">?</span>
				)}
			</AvatarFallback>
		</Avatar>
	);
};

// ─── Inner component (holds state, separated to keep Controller render clean) ──

type InnerProps = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	field: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	fieldState: any;
	fieldId: string;
	errorId: string;
	descId: string;
	label: string;
	description: string | null;
	displayName: string;
	disabled: boolean;
	className?: string;
};

const AvatarUrlFieldInner = ({
	field,
	fieldState,
	fieldId,
	errorId,
	descId,
	label,
	description,
	displayName,
	disabled,
	className,
}: InnerProps) => {
	// The URL we're currently attempting to preview (debounced from field.value)
	const [previewUrl, setPreviewUrl] = useState<string>(field.value ?? '');
	const [previewState, setPreviewState] = useState<PreviewState>(
		field.value ? 'loading' : 'empty'
	);

	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// ── Debounced preview update ──────────────────────────────────────────────
	const schedulePreview = useCallback((url: string) => {
		if (debounceRef.current) clearTimeout(debounceRef.current);

		const trimmed = url.trim();

		if (!trimmed) {
			setPreviewUrl('');
			setPreviewState('empty');
			return;
		}

		// Immediately show loading so the UI feels responsive
		setPreviewState('loading');

		debounceRef.current = setTimeout(() => {
			setPreviewUrl(trimmed);
		}, PREVIEW_DEBOUNCE_MS);
	}, []);

	// Cleanup debounce on unmount
	useEffect(() => {
		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, []);

	// ── Sync preview when field value changes externally (e.g. form.reset()) ─
	useEffect(() => {
		const val = field.value ?? '';
		if (val !== previewUrl) {
			schedulePreview(val);
		}
		// Only run when field.value changes from outside
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [field.value]);

	// ── Handlers ─────────────────────────────────────────────────────────────
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		field.onChange(e);
		schedulePreview(e.target.value);
	};

	const handleClear = () => {
		field.onChange('');
		setPreviewUrl('');
		setPreviewState('empty');
	};

	const handleImageLoad = () => setPreviewState('loaded');

	const handleImageError = () => setPreviewState('error');

	// ── Derived ───────────────────────────────────────────────────────────────
	const hasValue = Boolean((field.value ?? '').trim());
	const showErrorHint =
		previewState === 'error' && hasValue && !fieldState.error;

	return (
		<Field
			data-invalid={fieldState.invalid || undefined}
			className={className}
		>
			<FieldLabel htmlFor={fieldId}>{label}</FieldLabel>

			{/* ── Preview + input row ───────────────────────────────── */}
			<section className="flex flex-col sm:flex-row sm:items-center gap-3">
				{/* Avatar preview circle */}
				<div className="flex justify-center sm:justify-start">
					<AvatarPreview
						url={previewUrl}
						previewState={previewState}
						onLoad={handleImageLoad}
						onError={handleImageError}
						displayName={displayName}
					/>
				</div>

				{/* Input + clear button */}
				<div className="relative w-full sm:flex-1 min-w-0">
					<Input
						{...field}
						id={fieldId}
						type="url"
						value={field.value ?? ''}
						onChange={handleChange}
						placeholder="https://example.com/avatar.png"
						autoComplete="off"
						aria-invalid={
							fieldState.invalid || previewState === 'error'
						}
						aria-describedby={
							[
								description ? descId : null,
								fieldState.error ? errorId : null,
							]
								.filter(Boolean)
								.join(' ') || undefined
						}
						disabled={disabled}
						className={cn(
							hasValue && 'pe-9',
							// Soft destructive border hint when URL is broken
							// but Zod hasn't fired (URL is structurally valid but 404s)
							showErrorHint &&
								'border-destructive/50 focus-visible:ring-destructive/30'
						)}
					/>

					{/* Clear button — only visible when there's a value */}
					{hasValue && (
						<Button
							type="button"
							variant="ghost"
							size="icon"
							aria-label="Clear avatar URL"
							onClick={handleClear}
							disabled={disabled}
							className={cn(
								'absolute inset-e-1 top-1/2 -translate-y-1/2',
								'h-7 w-7 shrink-0',
								'text-muted-foreground hover:text-foreground hover:bg-accent'
							)}
						>
							<HugeiconsIcon
								icon={Cancel01Icon}
								className="h-4 w-4"
							/>
						</Button>
					)}
				</div>
			</section>

			{/* ── URL load error hint (not a Zod error — just a broken image) ── */}
			{showErrorHint && (
				<p
					className="text-destructive/80 text-sm font-medium mt-1"
					role="status"
					aria-live="polite"
				>
					This URL couldn&apos;t be loaded as an image. Double-check
					the link.
				</p>
			)}

			{/* ── Description ──────────────────────────────────────── */}
			{description && (
				<FieldDescription id={descId}>{description}</FieldDescription>
			)}

			{/* ── Zod / RHF validation error ───────────────────────── */}
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
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * AvatarUrlField
 *
 * Drop-in replacement for the plain `avatarUrl` Controller block.
 * Adds a live avatar preview with debounced URL loading and three
 * visual states: empty → loading → loaded/error.
 *
 * Must be rendered inside a <FieldGroup> in the parent form.
 *
 * @example
 * // Basic usage — drop into EditProfileFormUI
 * <AvatarUrlField control={form.control} disabled={isSubmitting} />
 *
 * @example
 * // With display name for better aria labels
 * <AvatarUrlField
 *   control={form.control}
 *   displayName={`${form.watch('firstName')} ${form.watch('lastName')}`}
 *   disabled={isSubmitting}
 * />
 *
 * @example
 * // Custom field name (e.g. nested schema)
 * <AvatarUrlField
 *   control={form.control}
 *   name="profile.avatarUrl"
 *   label="Profile Picture URL"
 * />
 */
const AvatarUrlField = <T extends FieldValues>({
	control,
	name = 'avatarUrl' as Path<T>,
	label = 'Avatar URL',
	description = 'Optional. Provide a public image URL.',
	displayName = 'User',
	disabled = false,
	className,
}: AvatarUrlFieldProps<T>) => {
	const fieldId = 'field-avatar-url';
	const errorId = 'field-avatar-url-error';
	const descId = 'field-avatar-url-desc';

	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState }) => (
				<AvatarUrlFieldInner
					field={field}
					fieldState={fieldState}
					fieldId={fieldId}
					errorId={errorId}
					descId={descId}
					label={label}
					description={description}
					displayName={displayName}
					disabled={disabled}
					className={className}
				/>
			)}
		/>
	);
};

export default AvatarUrlField;
