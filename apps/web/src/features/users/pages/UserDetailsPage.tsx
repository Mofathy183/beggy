'use client';

import { useParams } from 'next/navigation';
import { AlertCircle } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { useRouter } from 'next/navigation';
import { UserCard, UserDetailsHeader } from '@features/users/components';
import { useUserDetails } from '@features/users/hooks';
import { Card, CardContent } from '@shadcn-ui/card';
import { Button } from '@shadcn-ui/button';

const UserDetailsPage = () => {
	const params = useParams();
	const userId = params?.id as string | undefined;

	const router = useRouter();

	const { user, isLoading, error, refetch } = useUserDetails(userId);

	// ─────────────────────────────────────────────
	// Loading State
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
	// ─────────────────────────────────────────────
	return (
		<div className="space-y-6">
			<UserDetailsHeader user={user} onBack={() => router.back()} />
			<UserCard user={user} />
		</div>
	);
};

export default UserDetailsPage;
