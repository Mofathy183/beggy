'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Avatar, AvatarFallback, AvatarImage } from '@shadcn-ui/avatar';
import { cn } from '@shadcn-lib';
import type { ProfileDTO } from '@beggy/shared/types';

// ─── Size variants ────────────────────────────────────────────────────────────
// shadcn Avatar has no built-in sizes — we extend it via CVA.
// ring-2 ring-background ensures a clean cut edge on any surface.

const avatarSizeVariants = cva(
	'shrink-0 ring-2 ring-background transition-shadow',
	{
		variants: {
			size: {
				xs: 'h-7 w-7',
				sm: 'h-9 w-9',
				md: 'h-11 w-11',
				lg: 'h-14 w-14',
				xl: 'h-20 w-20',
				'2xl': 'h-28 w-28',
			},
		},
		defaultVariants: { size: 'md' },
	}
);

// Fallback uses the soft badge pattern from §12.7:
// bg-primary/10 text-primary — teal tint on white, never hardcoded
const fallbackTextVariants = cva(
	'bg-primary/10 text-primary font-semibold select-none',
	{
		variants: {
			size: {
				xs: 'text-[10px]',
				sm: 'text-xs',
				md: 'text-sm',
				lg: 'text-base',
				xl: 'text-xl',
				'2xl': 'text-2xl',
			},
		},
		defaultVariants: { size: 'md' },
	}
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Derives up-to-two-letter initials.
 * Priority: displayName → firstName + lastName → firstName → "?"
 */
function getInitials(
	profile: Pick<ProfileDTO, 'firstName' | 'lastName' | 'displayName'>
): string {
	const display = profile.displayName?.trim();
	if (display) {
		const words = display.split(/\s+/).filter(Boolean);
		return words.length >= 2
			? `${words[0]![0]}${words[1]![0]}`.toUpperCase()
			: display.slice(0, 2).toUpperCase();
	}
	const f = profile.firstName?.trim()[0] ?? '';
	const l = profile.lastName?.trim()[0] ?? '';
	if (f && l) return `${f}${l}`.toUpperCase();
	return f ? f.toUpperCase() : '?';
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ProfileAvatarProps extends VariantProps<
	typeof avatarSizeVariants
> {
	profile: Pick<
		ProfileDTO,
		'firstName' | 'lastName' | 'avatarUrl' | 'displayName'
	>;
	/**
	 * Renders a small success-green dot for presence/online indicators.
	 * Uses --success token from §12.6.
	 */
	showOnline?: boolean;
	className?: string;
	/** Override the img alt text. Defaults to displayName or full name. */
	alt?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ProfileAvatar
 *
 * Built on shadcn <Avatar> / <AvatarImage> / <AvatarFallback>.
 *
 * Key shadcn behaviour used here:
 * - <AvatarImage> renders the photo; Radix handles loading state internally
 * - <AvatarFallback> mounts automatically when image is missing or broken
 *   — no manual onError handler needed
 *
 * @example
 * <ProfileAvatar profile={profile} size="xl" showOnline />
 * <ProfileAvatar profile={profile} size="sm" />  // sidebar usage
 */
const ProfileAvatar = ({
	profile,
	size = 'md',
	showOnline = false,
	className,
	alt,
}: ProfileAvatarProps) => {
	const initials = getInitials(profile);
	const altText =
		alt ??
		profile.displayName ??
		`${profile.firstName} ${profile.lastName}`.trim();

	return (
		<span className="relative inline-flex">
			<Avatar className={cn(avatarSizeVariants({ size }), className)}>
				{profile.avatarUrl && (
					<AvatarImage
						src={profile.avatarUrl}
						alt={altText}
						className="object-cover"
					/>
				)}
				{/* Always rendered by shadcn Radix; shows when image is absent/broken */}
				<AvatarFallback className={cn(fallbackTextVariants({ size }))}>
					{initials}
				</AvatarFallback>
			</Avatar>

			{/* Online indicator — bg-success from §12.6 */}
			{showOnline && (
				<span
					aria-label="Online"
					className={cn(
						'absolute bottom-0 right-0 rounded-full',
						'bg-success ring-2 ring-background',
						size === 'xs' || size === 'sm'
							? 'h-2 w-2'
							: size === 'md'
								? 'h-2.5 w-2.5'
								: 'h-3 w-3'
					)}
				/>
			)}
		</span>
	);
};

export default ProfileAvatar;
