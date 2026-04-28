'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@shadcn-ui/button';
import { Skeleton } from '@shadcn-ui/skeleton';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	ArrowLeft01Icon,
	AlertCircleIcon,
	UserMinus01Icon,
	UserCheck01Icon,
	Delete02Icon,
} from '@hugeicons/core-free-icons';

import { UserCard } from '@features/users/components/details';
import { ChangeRoleDialog } from '@features/users/components/dialogs';
import { useUserDetails, useUserActions } from '@features/users/hooks';
import { useAppSelector } from '@shared/store/hooks';
import { selectAuthUser } from '@features/auth/store';
import { notify } from '@shared/utils/notify.utils';

// ─── Skeleton ──────────────────────────────────────────────────────────────────

const UserDetailsPageSkeleton = () => (
	<div className="flex flex-col gap-6">
		<div className="flex items-center justify-between gap-4">
			<div className="flex items-center gap-3">
				<Skeleton className="h-9 w-9 rounded-md" />
				<div className="flex flex-col gap-1.5">
					<Skeleton className="h-6 w-48 rounded" />
					<Skeleton className="h-4 w-32 rounded" />
				</div>
			</div>
			<div className="flex items-center gap-2">
				<Skeleton className="h-9 w-28 rounded-md" />
				<Skeleton className="h-9 w-24 rounded-md" />
			</div>
		</div>
		<Skeleton className="h-64 w-full rounded-xl" />
	</div>
);

// ─── Error state ───────────────────────────────────────────────────────────────

const UserDetailsError = ({
	onBack,
	onRetry,
}: {
	onBack: () => void;
	onRetry: () => void;
}) => (
	<div className="flex flex-col items-center gap-4 py-16 text-center">
		<div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
			<HugeiconsIcon
				icon={AlertCircleIcon}
				className="h-6 w-6 text-destructive"
			/>
		</div>
		<div className="space-y-1">
			<h3 className="text-foreground font-semibold">
				Couldn&apos;t load this user
			</h3>
			<p className="text-muted-foreground text-sm">
				Something went wrong fetching the user details.
			</p>
		</div>
		<div className="flex items-center gap-2">
			<Button variant="outline" onClick={onBack}>
				<HugeiconsIcon
					icon={ArrowLeft01Icon}
					className="me-2 h-4 w-4"
				/>
				Back to users
			</Button>
			<Button onClick={onRetry}>Try again</Button>
		</div>
	</div>
);

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
	const currentUser = useAppSelector(selectAuthUser);

	// ✅ isError now available — aligned with useBagDetails
	const { user, isLoading, isError, refetch } = useUserDetails(id);
	const { activate, deactivate, remove, isUpdatingStatus, isDeleting } =
		useUserActions();

	const isCurrentUser = currentUser?.id === id;

	const handleToggleStatus = async () => {
		if (!user) return;
		if (user.isActive) {
			await deactivate(user.id, {
				onSuccess: () => {
					notify.success({ message: 'User deactivated' });
					void refetch();
				},
			});
		} else {
			await activate(user.id, {
				onSuccess: () => {
					notify.success({ message: 'User activated' });
					void refetch();
				},
			});
		}
	};

	const handleDelete = async () => {
		if (!user) return;
		await remove(user.id, {
			onSuccess: () => {
				notify.success({ message: 'User deleted' });
				router.push('/users');
			},
		});
	};

	if (isLoading) return <UserDetailsPageSkeleton />;

	// ✅ isError instead of error — matches BagDetailsPage guard pattern
	if (isError || !user) {
		return (
			<UserDetailsError
				onBack={() => router.push('/users')}
				onRetry={() => void refetch()}
			/>
		);
	}

	// ─────────────────────────────────────────────
	// Success State
	// Render the full user details layout.
	// ─────────────────────────────────────────────
	return (
		<div className="flex flex-col gap-6">
			{/* ── Page header ──────────────────────────────────────────────── */}
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="flex items-center gap-3">
					<Button
						variant="ghost"
						size="icon"
						aria-label="Back to users"
						onClick={() => router.push('/users')}
					>
						<HugeiconsIcon
							icon={ArrowLeft01Icon}
							className="h-4 w-4"
						/>
					</Button>
					<div>
						{/*
						 * truncate + title: email is the page title here.
						 * max-w-sm caps the width so the action buttons
						 * are never pushed off-screen by a long address.
						 */}
						<h1
							className="text-foreground max-w-sm truncate text-xl font-semibold leading-tight"
							title={user.email}
						>
							{user.email}
						</h1>
						<p className="text-muted-foreground text-sm">
							User details
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					{/*
					 * ChangeRoleDialog is a domain-specific action with its
					 * own dialog — it lives here as a primary action, not
					 * in the overflow menu, because role changes are
					 * consequential enough to warrant a dedicated surface.
					 */}
					<ChangeRoleDialog
						userId={user.id}
						currentRole={user.role}
					/>

					<Button
						variant="outline"
						size="sm"
						onClick={() => void handleToggleStatus()}
						disabled={
							isCurrentUser || isUpdatingStatus || isDeleting
						}
					>
						<HugeiconsIcon
							icon={
								user.isActive
									? UserMinus01Icon
									: UserCheck01Icon
							}
							className="me-2 h-4 w-4"
						/>
						{isUpdatingStatus
							? user.isActive
								? 'Deactivating…'
								: 'Activating…'
							: user.isActive
								? 'Deactivate'
								: 'Activate'}
					</Button>

					<Button
						variant="destructive"
						size="sm"
						onClick={() => void handleDelete()}
						disabled={
							isCurrentUser || isDeleting || isUpdatingStatus
						}
					>
						<HugeiconsIcon
							icon={Delete02Icon}
							className="me-2 h-4 w-4"
						/>
						{isDeleting ? 'Deleting…' : 'Delete'}
					</Button>
				</div>
			</div>

			{/*
			 * UserCard with showActions=false — the page header already owns
			 * all primary actions. Showing them again in the overflow menu
			 * creates two paths to the same action, which causes hesitation.
			 * onSelect/onEdit are no-ops: user is already on the detail page.
			 */}
			<UserCard
				user={user}
				onSelect={() => {}}
				onEdit={() => {}}
				onToggleStatus={() => void handleToggleStatus()}
				onDelete={() => void handleDelete()}
				isCurrentUser={isCurrentUser}
				isUpdatingStatus={isUpdatingStatus}
				isDeleting={isDeleting}
			/>
		</div>
	);
};

export default UserDetailsPage;
