'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@shadcn-ui/button';
import { Card, CardContent, CardHeader } from '@shadcn-ui/card';
import { Skeleton } from '@shadcn-ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@shadcn-ui/alert';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	ArrowLeft02Icon,
	AlertCircleIcon,
	PencilEdit02Icon,
	Delete02Icon,
} from '@hugeicons/core-free-icons';
import { ItemCard } from '@features/items/components/details';
import { UpdateItemDialog } from '@features/items/components/dialogs';

import { useItemDetails, useItemsActions } from '@features/items/hooks';
import { useProfileSyncWithAuth } from '@features/profiles/hooks';

// ─── Skeleton ──────────────────────────────────────────────────────────────────

/**
 * Mirrors the final card structure so layout shift is minimal.
 */
const ItemDetailsSkeleton = () => (
	<div className="flex flex-col gap-6 p-6">
		{/* Back button */}
		<Skeleton className="h-8 w-24 rounded-md" />

		{/* Header */}
		<div className="flex items-start justify-between">
			<div className="flex flex-col gap-2">
				<Skeleton className="h-7 w-48 rounded" />
				<Skeleton className="h-4 w-24 rounded-full" />
			</div>
			<div className="flex gap-2">
				<Skeleton className="h-9 w-20 rounded-md" />
				<Skeleton className="h-9 w-20 rounded-md" />
			</div>
		</div>

		{/* Card */}
		<Card>
			<CardHeader>
				<Skeleton className="h-5 w-32 rounded" />
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<div className="flex gap-2">
					<Skeleton className="h-6 w-24 rounded-full" />
					<Skeleton className="h-6 w-16 rounded-full" />
				</div>
				<Skeleton className="h-px w-full" />
				<div className="flex gap-3">
					<Skeleton className="h-14 w-32 rounded-lg" />
					<Skeleton className="h-14 w-32 rounded-lg" />
				</div>
				<Skeleton className="h-px w-full" />
				<div className="flex flex-col gap-1.5">
					<Skeleton className="h-4 w-40 rounded" />
					<Skeleton className="h-4 w-36 rounded" />
				</div>
			</CardContent>
		</Card>
	</div>
);

// ─── Component ─────────────────────────────────────────────────────────────────

type ItemDetailsPageProps = {
	id: string;
};

/**
 * ItemDetailsPage
 *
 * @description
 * Detail page for a single item. Composes shadcn primitives throughout:
 * - `Card` / `CardHeader` / `CardContent` — detail surface
 * - `Badge`             — color indicator pill
 * - `Separator`         — section dividers
 * - `Dialog`            — edit form overlay
 * - `Tooltip`           — measurement labels on hover
 * - `Skeleton`          — loading state
 * - `Alert`             — error state (soft destructive pattern §12.7)
 *
 * @remarks
 * Three explicit visual states:
 * 1. Loading    → `ItemDetailsSkeleton`
 * 2. Error/404  → soft destructive `Alert` with optional retry
 * 3. Loaded     → full detail card with badges, measurements, timestamps
 */
const ItemDetailsPage = ({ id }: ItemDetailsPageProps) => {
	const router = useRouter();

	const { item, isLoading, notFound, error, refetch } = useItemDetails(id);
	const { remove, isDeleting, isUpdating } = useItemsActions();

	const { syncProfile } = useProfileSyncWithAuth();

	const [editOpen, setEditOpen] = useState(false);

	const handleDelete = async () => {
		if (!item) return;
		await remove(item.id, {
			onSuccess: () => router.push('/items'),
		});
	};

	// ── Loading ───────────────────────────────────────────────────────────────
	if (isLoading) {
		return <ItemDetailsSkeleton />;
	}

	// ── Error / not found ────────────────────────────────────────────────────
	if (notFound || error || !item) {
		return (
			<div className="flex flex-col gap-4 p-6">
				<Button
					variant="ghost"
					size="sm"
					className="w-fit"
					onClick={() => router.push('/items')}
				>
					<HugeiconsIcon
						icon={ArrowLeft02Icon}
						className="mr-2 size-4"
					/>
					Back to items
				</Button>

				<Alert className="border-destructive/30 bg-destructive/8 text-foreground">
					<HugeiconsIcon
						icon={AlertCircleIcon}
						size={16}
						className="text-destructive"
					/>
					<AlertTitle className="text-destructive font-semibold">
						{notFound ? 'Item not found' : 'Something went wrong'}
					</AlertTitle>
					<AlertDescription className="text-muted-foreground text-sm">
						{notFound
							? "This item doesn't exist or may have been deleted."
							: "We couldn't load this item. Try again."}
					</AlertDescription>
					{!notFound && (
						<Button
							variant="outline"
							size="sm"
							className="mt-3"
							onClick={() => refetch()}
						>
							Try again
						</Button>
					)}
				</Alert>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6 p-6">
			{/* ── Back navigation ──────────────────────────────────────────── */}
			<Button
				variant="ghost"
				size="sm"
				className="text-muted-foreground hover:text-foreground -ml-2 w-fit"
				onClick={() => router.push('/items')}
			>
				<HugeiconsIcon
					icon={ArrowLeft02Icon}
					className="mr-1.5 size-4"
				/>
				Items
			</Button>

			{/* ── Page header: name + action buttons ───────────────────────── */}
			<div className="flex items-start justify-between gap-4">
				<h1 className="text-foreground text-2xl font-semibold tracking-tight">
					{item.name}
				</h1>

				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setEditOpen(true)}
						disabled={isUpdating || isDeleting}
					>
						<HugeiconsIcon
							icon={PencilEdit02Icon}
							className="mr-2 size-4"
						/>
						Edit
					</Button>
					<Button
						variant="destructive"
						size="sm"
						onClick={() => void handleDelete()}
						disabled={isUpdating || isDeleting}
					>
						<HugeiconsIcon
							icon={Delete02Icon}
							className="mr-2 size-4"
						/>
						{isDeleting ? 'Deleting…' : 'Delete'}
					</Button>
				</div>
			</div>

			{/* ── Detail card ──────────────────────────────────────────────── */}
			{/*
			 * ItemCard replaces the hand-rolled detail Card.
			 *
			 * onSelect is a no-op — the user is already on this item's
			 * detail page, navigating here again would be disorienting.
			 * The page header already owns Edit and Delete as primary
			 * actions, so the overflow menu is redundant here — but we
			 * wire it anyway so the card renders consistently.
			 *
			 * isDeleting dims and locks the card while the mutation runs,
			 * matching the locked state on the header buttons above.
			 */}
			<ItemCard
				item={item}
				onSelect={() => router.push(`/items/${item.id}`)}
				onEdit={() => setEditOpen(true)}
				onDelete={() => void handleDelete()}
				isUpdating={isUpdating}
				isDeleting={isDeleting}
			/>

			{/* ── Edit dialog ──────────────────────────────────────────────── */}
			<UpdateItemDialog
				item={editOpen ? item : null}
				onClose={() => setEditOpen(false)}
				onSuccess={() => {
					syncProfile();
					setEditOpen(false);
					void refetch();
				}}
			/>
		</div>
	);
};

export default ItemDetailsPage;
