'use client';

import { useRouter } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	InformationCircleIcon,
	Cancel01Icon,
} from '@hugeicons/core-free-icons';
import { Button } from '@shadcn-ui/button';
import { Alert, AlertDescription, AlertTitle } from '@shadcn-ui/alert';
import { useAppDispatch, useAppSelector } from '@shared/store/hooks';
import {
	dismissNudge,
	selectNudgeDismissed,
	selectOnboardingCompleted,
} from '@features/dashboard/store';

/**
 * @description
 * Displays a soft onboarding prompt encouraging users to complete their profile.
 *
 * @remarks
 * - Rendered only when onboarding is incomplete and the nudge has not been dismissed.
 * - Dismissal is persisted in global state to avoid repeated prompts.
 * - Provides both primary (navigate to onboarding) and secondary (dismiss) actions.
 */
const OnboardingNudge = () => {
	const dispatch = useAppDispatch();
	const router = useRouter();

	const dismissed = useAppSelector(selectNudgeDismissed);
	const onboardingCompleted = useAppSelector(selectOnboardingCompleted);

	// Do not render if onboarding is completed or the user dismissed the nudge
	if (onboardingCompleted !== false || dismissed) return null;

	const handleDismiss = () => dispatch(dismissNudge());

	const handleNavigate = () => {
		router.push('/onboarding');
	};

	return (
		<Alert className="border-s-primary border-s-2">
			{/* Icon */}
			<div className="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
				<HugeiconsIcon
					icon={InformationCircleIcon}
					className="text-primary h-4 w-4"
				/>
			</div>

			{/* Text */}
			<div className="flex flex-1 flex-col justify-center">
				<AlertTitle className="text-foreground text-sm font-medium leading-none">
					Complete your profile to unlock all features
				</AlertTitle>
				<AlertDescription className="text-muted-foreground mt-0.5 text-xs">
					Takes about 2 minutes — helps us personalise your packing
					suggestions
				</AlertDescription>
			</div>

			{/* Actions */}
			<div className="flex shrink-0 items-center gap-1">
				<Button size="sm" onClick={handleNavigate}>
					Complete profile
				</Button>

				<Button
					size="sm"
					variant="ghost"
					className="text-muted-foreground"
					onClick={handleDismiss}
				>
					Later
				</Button>

				<Button
					size="icon"
					variant="ghost"
					className="text-muted-foreground hover:text-foreground h-7 w-7"
					aria-label="Dismiss nudge"
					onClick={handleDismiss}
				>
					<HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
				</Button>
			</div>
		</Alert>
	);
};

export default OnboardingNudge;
