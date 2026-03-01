'use client';

import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import {
	Location01Icon,
	Calendar01Icon,
	Edit01Icon,
	UserCircleIcon,
} from '@hugeicons/core-free-icons';
import { Card, CardContent, CardHeader } from '@shadcn-ui/card';
import { Button } from '@shadcn-ui/button';
import { Separator } from '@shadcn-ui/separator';
import { Skeleton } from '@shadcn-ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@shadcn-ui/tooltip';
import { cn } from '@shadcn-lib';
import { format, parseISO } from 'date-fns';
import type { ProfileDTO } from '@beggy/shared/types';
import { ProfileAvatar } from '@features/profiles/components/details';
import { GenderBadge } from '@features/profiles/components/badges';
import { Gender } from '@beggy/shared/constants';

// ─── MetaRow sub-component ────────────────────────────────────────────────────
// A single metadata line: icon chip + label + value.
// Returns null when value is falsy — no "Not set" noise in the UI.

interface MetaRowProps {
	icon: IconSvgElement;
	label: string;
	value: string | number | null | undefined;
	tooltip?: string;
}

const MetaRow = ({ icon, label, value, tooltip }: MetaRowProps) => {
	if (!value && value !== 0) return null;

	const row = (
		<div className="flex items-center gap-3">
			{/* Icon chip — bg-muted matches §12.7 muted container pattern */}
			<span
				aria-hidden="true"
				className={cn(
					'flex h-8 w-8 shrink-0 items-center justify-center',
					'rounded-lg bg-muted'
				)}
			>
				<HugeiconsIcon
					icon={icon}
					size={15}
					className="text-muted-foreground"
				/>
			</span>

			<div className="min-w-0 flex-1">
				<p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
					{label}
				</p>
				<p className="truncate text-sm font-medium text-foreground">
					{String(value)}
				</p>
			</div>
		</div>
	);

	// Wrap in Tooltip only when a tooltip string is provided
	if (!tooltip) return row;

	return (
		<Tooltip>
			<TooltipTrigger>
				<div className="cursor-default">{row}</div>
			</TooltipTrigger>
			<TooltipContent side="right" className="text-xs">
				{tooltip}
			</TooltipContent>
		</Tooltip>
	);
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

/**
 * ProfileCardSkeleton
 *
 * Matches ProfileCard layout precisely so the transition is seamless.
 * Uses shadcn <Skeleton> throughout.
 */
export const ProfileCardSkeleton = ({ className }: { className?: string }) => {
	return (
		<Card className={cn('overflow-hidden', className)}>
			<CardHeader className="pb-4">
				<div className="flex items-start gap-4">
					{/* Avatar skeleton */}
					<Skeleton className="h-20 w-20 rounded-full shrink-0" />

					<div className="flex-1 space-y-2 pt-1">
						{/* Display name */}
						<Skeleton className="h-5 w-44" />
						{/* Sub name */}
						<Skeleton className="h-3.5 w-28" />
						{/* Gender badge */}
						<Skeleton className="h-5 w-16 rounded-full" />
					</div>
				</div>
			</CardHeader>

			<Separator />

			<CardContent className="pt-5 space-y-4">
				{[80, 64, 48].map((w, i) => (
					<div key={i} className="flex items-center gap-3">
						<Skeleton className="h-8 w-8 rounded-lg shrink-0" />
						<div className="space-y-1.5">
							<Skeleton className="h-2.5 w-12" />
							<Skeleton className={`h-3.5 w-${w}`} />
						</div>
					</div>
				))}
			</CardContent>
		</Card>
	);
};

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ProfileCardProps {
	profile: ProfileDTO;
	/**
	 * When provided, renders an Edit icon button in the card header.
	 * Wire to your settings route: `() => router.push('/settings/profile')`
	 */
	onEdit?: () => void;
	/**
	 * Show the "Member since" row — opt-in for settings/account pages
	 * where that context adds value.
	 */
	showMemberSince?: boolean;
	className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ProfileCard
 *
 * Read-only display of the authenticated user's private profile.
 * Built on shadcn <Card>, using semantic tokens throughout (§12).
 *
 * Design decisions:
 * - Optional fields render only when populated. Absence = silent omission,
 *   not a "Not set" ghost. Cleaner, more trustworthy UI.
 * - The sub-name row only appears when displayName differs from firstName+lastName.
 * - GenderBadge returns null when gender is null — no guard needed here.
 * - onEdit is optional — when absent no empty button slot remains.
 *
 * @example
 * // Settings page header
 * <ProfileCard profile={profile} onEdit={() => router.push('/settings/profile')} showMemberSince />
 *
 * // Dashboard widget (read-only)
 * <ProfileCard profile={profile} />
 */
const ProfileCard = ({
	profile,
	onEdit,
	showMemberSince = false,
	className,
}: ProfileCardProps) => {
	// ── Derived display values ────────────────────────────────────────────────
	const displayName =
		profile.displayName ??
		`${profile.firstName} ${profile.lastName}`.trim();

	const fullName = `${profile.firstName} ${profile.lastName}`.trim();
	const showSubName = profile.displayName && profile.displayName !== fullName;

	const location = [profile.city, profile.country].filter(Boolean).join(', ');

	const formattedBirthDate = profile.birthDate
		? format(parseISO(profile.birthDate), 'MMMM d, yyyy')
		: null;

	const ageLabel = profile.age != null ? `${profile.age} years old` : null;

	const memberSince = showMemberSince
		? format(parseISO(profile.createdAt), 'MMMM yyyy')
		: null;

	return (
		<Card
			className={cn(
				// shadcn Card base + subtle shadow lift on hover
				'overflow-hidden transition-shadow hover:shadow-md',
				className
			)}
		>
			{/* ── Header: Avatar · Name · Edit ─────────────────────────────── */}
			<CardHeader className="pb-4">
				<div className="flex items-start gap-4">
					<ProfileAvatar profile={profile} size="xl" />

					<div className="flex min-w-0 flex-1 flex-col gap-1 pt-0.5">
						{/* Primary display name */}
						<h2 className="truncate text-lg font-semibold leading-tight text-card-foreground">
							{displayName}
						</h2>

						{/* Sub-name: only when displayName differs from firstName+lastName */}
						{showSubName && (
							<p className="truncate text-xs text-muted-foreground">
								{fullName}
							</p>
						)}

						{/* Gender badge — returns null silently when gender is null */}
						<div className="mt-0.5">
							<GenderBadge
								gender={profile.gender as Gender}
								size="sm"
							/>
						</div>
					</div>

					{/* Edit button — only rendered when handler is provided */}
					{onEdit && (
						<Tooltip>
							<TooltipTrigger>
								<Button
									variant="ghost"
									size="icon"
									onClick={onEdit}
									className="shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent"
									aria-label="Edit profile"
								>
									<HugeiconsIcon
										icon={Edit01Icon}
										size={16}
									/>
								</Button>
							</TooltipTrigger>
							<TooltipContent side="left" className="text-xs">
								Edit profile
							</TooltipContent>
						</Tooltip>
					)}
				</div>
			</CardHeader>

			<Separator />

			{/* ── Meta rows ────────────────────────────────────────────────── */}
			<CardContent className="pt-5 space-y-3.5">
				<MetaRow
					icon={Location01Icon}
					label="Location"
					value={location || null}
				/>

				<MetaRow
					icon={Calendar01Icon}
					label="Birthday"
					value={formattedBirthDate}
					tooltip={
						profile.birthDate
							? `Born ${formattedBirthDate} (${ageLabel})`
							: undefined
					}
				/>

				{/* Member since — opt-in */}
				{memberSince && (
					<MetaRow
						icon={UserCircleIcon}
						label="Member since"
						value={memberSince}
					/>
				)}
			</CardContent>
		</Card>
	);
};

export default ProfileCard;
