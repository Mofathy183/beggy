'use client';

import { toast } from 'sonner';
import { usePrivateProfile } from '@features/profiles/hooks';
import EditProfileForm from '../forms/EditProfileForm';
import { ProfileCardSkeleton } from '../details/ProfileCard';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	AlertCircleIcon,
	CheckmarkCircle01Icon,
} from '@hugeicons/core-free-icons';
import { Button } from '@shared/components/ui/button';

/**
 * ProfileEditTab
 *
 * Loads the current profile to pre-fill the form, then renders EditProfileForm.
 * Success fires a Sonner toast and calls onSaveSuccess so the parent
 * can switch back to the View tab.
 */
const ProfileEditTab = ({ onSaveSuccess }: { onSaveSuccess: () => void }) => {
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
		<EditProfileForm
			defaultValues={{
				firstName: profile.firstName ?? undefined,
				lastName: profile.lastName ?? undefined,
				avatarUrl: profile.avatarUrl ?? undefined,
				gender: profile.gender ?? undefined,
				birthDate: profile.birthDate ? new Date() : undefined,
				country: profile.country ?? undefined,
				city: profile.city ?? undefined,
			}}
			onSuccess={(updated) => {
				toast.success('Profile updated', {
					description: `Looking good, ${updated.firstName ?? 'traveler'}!`,
					icon: (
						<HugeiconsIcon
							icon={CheckmarkCircle01Icon}
							size={16}
							className="text-success"
						/>
					),
				});
				onSaveSuccess();
			}}
		/>
	);
};

export default ProfileEditTab;
