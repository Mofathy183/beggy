'use client';

import { useGetPublicProfileQuery } from '@features/profiles/api';
import {
	ProfileAvatar,
	ProfileCardSkeleton,
} from '@features/profiles/components/details';
import { HugeiconsIcon } from '@hugeicons/react';
import { Location01Icon, AlertCircleIcon } from '@hugeicons/core-free-icons';
import { Button } from '@shadcn-ui/button';
import { Separator } from '@shadcn-ui/separator';
import { cn } from '@shadcn-lib';
import type { PublicProfileDTO } from '@beggy/shared/types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface PublicProfilePageProps {
	userId: string;
}

// ─── Error State ──────────────────────────────────────────────────────────────

const ProfileErrorState = ({
	message,
	onRetry,
}: {
	message?: string;
	onRetry: () => void;
}) => (
	<div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
		<span className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
			<HugeiconsIcon
				icon={AlertCircleIcon}
				size={22}
				className="text-destructive"
			/>
		</span>
		<div className="space-y-1">
			<p className="text-sm font-medium text-foreground">
				{message ?? 'Profile not found'}
			</p>
			<p className="text-xs text-muted-foreground">
				This profile may not exist or is unavailable.
			</p>
		</div>
		<Button variant="outline" size="sm" onClick={onRetry}>
			Try again
		</Button>
	</div>
);

// ─── Profile Content ──────────────────────────────────────────────────────────

const PublicProfileContent = ({ profile }: { profile: PublicProfileDTO }) => {
	const displayName =
		profile.displayName ??
		`${profile.firstName} ${profile.lastName}`.trim();

	const fullName = `${profile.firstName} ${profile.lastName}`.trim();
	const showSubName = profile.displayName && profile.displayName !== fullName;

	const location = [profile.city, profile.country].filter(Boolean).join(', ');

	return (
		<div className="mx-auto w-full max-w-lg px-4 py-10">
			{/* ── Hero card ─────────────────────────────────────────────── */}
			<div
				className={cn(
					'rounded-2xl border bg-card shadow-sm',
					'overflow-hidden'
				)}
			>
				{/* Subtle tinted banner strip */}
				<div className="h-20 bg-gradient-to-r from-primary/8 via-primary/5 to-transparent" />

				{/* Avatar — overlaps banner with negative margin */}
				<div className="-mt-10 flex flex-col items-center px-6 pb-6">
					<ProfileAvatar
						profile={profile}
						size="2xl"
						className="ring-4 ring-card shadow-md"
					/>

					{/* Name block */}
					<div className="mt-3 text-center space-y-0.5">
						<h1 className="text-xl font-semibold tracking-tight text-card-foreground">
							{displayName}
						</h1>

						{showSubName && (
							<p className="text-sm text-muted-foreground">
								{fullName}
							</p>
						)}
					</div>

					<Separator className="my-5 w-full" />

					{/* ── Meta pills ──────────────────────────────────────── */}
					<div className="flex flex-wrap justify-center gap-2">
						{location && (
							<span
								className={cn(
									'inline-flex items-center gap-1.5',
									'rounded-full border bg-muted/50 px-3 py-1',
									'text-xs font-medium text-muted-foreground'
								)}
							>
								<HugeiconsIcon
									icon={Location01Icon}
									size={11}
									className="shrink-0"
								/>
								{location}
							</span>
						)}

						{profile.age != null && (
							<span
								className={cn(
									'inline-flex items-center',
									'rounded-full border bg-muted/50 px-3 py-1',
									'text-xs font-medium text-muted-foreground'
								)}
							>
								{profile.age} years old
							</span>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

// ─── Page ─────────────────────────────────────────────────────────────────────

/**
 * PublicProfilePage
 *
 * Renders a public-facing profile using PublicProfileDTO.
 * Accessible without authentication — no auth guard needed.
 *
 * Route: /profile/[userId]
 * Data:  GET /profiles/:userId  →  useGetPublicProfileQuery
 *
 * States:
 *  isLoading → ProfileCardSkeleton
 *  isError   → ProfileErrorState with refetch
 *  success   → PublicProfileContent
 */
const PublicProfilePage = ({ userId }: PublicProfilePageProps) => {
	const { data, isLoading, isError, error, refetch } =
		useGetPublicProfileQuery(userId);

	if (isLoading) {
		return (
			<div className="mx-auto w-full max-w-lg px-4 py-10">
				<ProfileCardSkeleton />
			</div>
		);
	}

	if (isError || !data?.data) {
		return (
			<ProfileErrorState
				message={(error as any)?.body?.message}
				onRetry={refetch}
			/>
		);
	}

	return <PublicProfileContent profile={data.data} />;
};

export default PublicProfilePage;
