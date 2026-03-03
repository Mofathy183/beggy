'use client';

import {
	ProfileCard,
	ProfileCardSkeleton,
} from '@features/profiles/components/details';
import { usePrivateProfile } from '@features/profiles/hooks';
import { HugeiconsIcon } from '@hugeicons/react';
import { AlertCircleIcon } from '@hugeicons/core-free-icons';
import { Button } from '@shared/components/ui/button';

/**
 * ProfileTab
 *
 * Read-only profile display inside the settings page tabs.
 * The ProfileCard's onEdit prop switches to the Edit tab.
 */
const ProfileTab = ({ onEditClick }: { onEditClick: () => void }) => {
	const { profile, isLoading, isError, error, refetch } = usePrivateProfile();

	if (isLoading) {
		return <ProfileCardSkeleton />;
	}

	if (isError || !profile) {
		return (
			<div className="flex flex-col items-center gap-4 rounded-xl border border-destructive/30 bg-destructive/8 p-8 text-center">
				<div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
					<HugeiconsIcon
						icon={AlertCircleIcon}
						size={20}
						className="text-destructive"
					/>
				</div>
				<div className="space-y-1">
					<p className="font-semibold text-foreground">
						{error?.body.message ?? "Couldn't load your profile"}
					</p>
					<p className="text-sm text-muted-foreground">
						{error?.body.suggestion ?? 'Please try again.'}
					</p>
				</div>
				<Button variant="outline" size="sm" onClick={refetch}>
					Try again
				</Button>
			</div>
		);
	}

	return (
		<ProfileCard profile={profile} onEdit={onEditClick} showMemberSince />
	);
};

export default ProfileTab;
