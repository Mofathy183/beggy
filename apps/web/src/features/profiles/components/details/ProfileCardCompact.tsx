'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { Location01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { Card, CardContent } from '@shadcn-ui/card';
import { Button } from '@shadcn-ui/button';
import { Skeleton } from '@shadcn-ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@shadcn-ui/tooltip';
import { cn } from '@shadcn-lib';
import type { ProfileDTO } from '@beggy/shared/types';
import { ProfileAvatar } from '@features/profiles/components/details';
import { GenderBadge } from '@features/profiles/components/badges';
import { Gender } from '@beggy/shared/constants';

// ─── Skeleton ─────────────────────────────────────────────────────────────────

/**
 * ProfileCardCompactSkeleton
 *
 * Drop-in loading state — matches the compact card's single-row layout.
 * Uses shadcn <Skeleton>.
 */
export const ProfileCardCompactSkeleton = ({
	className,
}: {
	className?: string;
}) => {
	return (
		<div className={cn('flex items-center gap-3 px-3 py-2.5', className)}>
			<Skeleton className="h-9 w-9 rounded-full shrink-0" />
			<div className="flex-1 space-y-1.5">
				<Skeleton className="h-3.5 w-32" />
				<Skeleton className="h-3 w-20" />
			</div>
		</div>
	);
};

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ProfileCardCompactProps {
	profile: ProfileDTO;
	/**
	 * When provided, the whole row becomes a clickable button.
	 * Recommended: `() => router.push('/settings/profile')`
	 */
	onClick?: () => void;
	/** Show the gender badge icon inline next to the display name */
	showGender?: boolean;
	/**
	 * When true, renders inside a shadcn Card wrapper.
	 * When false (default), renders as a bare row — for sidebar footers
	 * that already sit inside a layout container.
	 */
	withCard?: boolean;
	className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ProfileCardCompact
 *
 * A single-row profile summary built with shadcn components.
 *
 * Designed for:
 *  - Sidebar footer ("logged in as")
 *  - Dropdown trigger buttons
 *  - Navigation headers
 *
 * When `onClick` is provided → renders as a shadcn <Button variant="ghost">
 * with hover using sidebar-accent tokens (§12.6 Sidebar Tokens).
 * When absent → renders as a static layout div.
 *
 * `withCard` wraps the row in a shadcn <Card> — useful in settings
 * mini-panels or dashboard summaries.
 *
 * @example
 * // Sidebar footer (bare, interactive)
 * <ProfileCardCompact
 *   profile={profile}
 *   onClick={() => router.push('/settings/profile')}
 * />
 *
 * // Settings page summary card
 * <ProfileCardCompact profile={profile} withCard showGender />
 */
export const ProfileCardCompact = ({
	profile,
	onClick,
	showGender = false,
	withCard = false,
	className,
}: ProfileCardCompactProps) => {
	const displayName =
		profile.displayName ??
		`${profile.firstName} ${profile.lastName}`.trim();

	const location = [profile.city, profile.country].filter(Boolean).join(', ');

	// ── Inner row content ─────────────────────────────────────────────────────
	const inner = (
		<>
			<ProfileAvatar profile={profile} size="sm" className="shrink-0" />

			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-1.5">
					<p className="truncate text-sm font-medium leading-tight text-foreground">
						{displayName}
					</p>
					{/* GenderBadge — icon-only for compact density; silent when null */}
					{showGender && (
						<GenderBadge
							gender={profile.gender as Gender}
							size="sm"
							iconOnly
						/>
					)}
				</div>

				{location ? (
					<p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
						<HugeiconsIcon
							icon={Location01Icon}
							size={10}
							className="shrink-0"
						/>
						{location}
					</p>
				) : (
					// Dim placeholder text — signals the field is absent without disrupting layout
					<p className="mt-0.5 truncate text-[11px] text-muted-foreground/50">
						No location set
					</p>
				)}
			</div>

			{/* Directional arrow — only when clickable */}
			{onClick && (
				<HugeiconsIcon
					icon={ArrowRight01Icon}
					size={14}
					className="shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground"
				/>
			)}
		</>
	);

	// ── Clickable variant: shadcn Button ghost ────────────────────────────────
	const row = onClick ? (
		<Tooltip>
			<TooltipTrigger>
				{/*
				 * Using Button variant="ghost" gives us:
				 * - Correct focus ring (ring-ring / §12.6)
				 * - Keyboard accessibility
				 * - hover:bg-accent / hover:text-accent-foreground via ghost variant
				 * We override bg to use sidebar tokens when inside sidebar context
				 */}
				<Button
					variant="ghost"
					onClick={onClick}
					className={cn(
						'group flex w-full items-center justify-start gap-3',
						'h-auto rounded-xl px-3 py-2.5',
						// Sidebar-specific hover tokens (§12.6 Sidebar Tokens)
						'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
						className
					)}
				>
					{inner}
				</Button>
			</TooltipTrigger>
			<TooltipContent side="right" className="text-xs">
				View profile settings
			</TooltipContent>
		</Tooltip>
	) : (
		<div
			className={cn(
				'flex w-full items-center gap-3 px-3 py-2.5',
				className
			)}
		>
			{inner}
		</div>
	);

	// ── Optional Card wrapper ─────────────────────────────────────────────────
	if (withCard) {
		return (
			<Card className="overflow-hidden">
				<CardContent className="p-0">{row}</CardContent>
			</Card>
		);
	}

	return row;
};

export default ProfileCardCompact;
