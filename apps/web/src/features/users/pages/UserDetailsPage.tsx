'use client';

import { AlertCircle } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { useRouter } from 'next/navigation';
import { UserCard, UserDetailsHeader } from '@features/users/components';
import { useUserDetails } from '@features/users/hooks';
import { Card, CardContent } from '@shadcn-ui/card';
import { Button } from '@shadcn-ui/button';

/**
 * Props for {@link UserDetailsPage}.
 */
type UserDetailsPageProps = {
	/** Unique identifier of the user to display. */
	id: string;
};

/**
 * Feature page responsible for displaying detailed information about a user.
 *
 * This component orchestrates data retrieval via {@link useUserDetails} and
 * renders the appropriate UI state:
 *
 * - Loading skeleton while data is being fetched
 * - Error fallback when the request fails
 * - User details when data is successfully retrieved
 *
 * @remarks
 * Designed as a composition layer that connects feature hooks, UI components,
 * and navigation behavior for the user details experience.
 */
const UserDetailsPage = ({ id }: UserDetailsPageProps) => {
	const router = useRouter();

	const { user, isLoading, error, refetch } = useUserDetails(id);

	// ─────────────────────────────────────────────
	// Loading State
	// Display skeleton placeholders while the
	// user data request is in progress.
	// ─────────────────────────────────────────────
	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="h-16 w-64 animate-pulse rounded-md bg-muted" />
				<div className="h-40 animate-pulse rounded-md bg-muted" />
			</div>
		);
	}

	// ─────────────────────────────────────────────
	// Error State
	// Render a recovery UI when fetching fails
	// or when the user cannot be resolved.
	// ─────────────────────────────────────────────
	if (error || !user) {
		return (
			<Card>
				<CardContent className="flex flex-col items-center justify-center gap-4 py-10 text-center">
					<HugeiconsIcon
						icon={AlertCircle}
						className="size-6 text-destructive"
					/>
					<p className="text-sm text-muted-foreground">
						Failed to load user details.
					</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => refetch()}
					>
						Try Again
					</Button>
				</CardContent>
			</Card>
		);
	}

	// ─────────────────────────────────────────────
	// Success State
	// Render the full user details layout.
	// ─────────────────────────────────────────────
	return (
		<div className="space-y-6">
			<UserDetailsHeader user={user} onBack={() => router.back()} />
			<UserCard user={user} />
		</div>
	);
};

export default UserDetailsPage;
