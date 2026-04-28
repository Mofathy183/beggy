'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@shadcn-ui/button';
import { Skeleton } from '@shadcn-ui/skeleton';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	ArrowLeft01Icon,
	PencilEdit02Icon,
	Delete02Icon,
	AlertCircleIcon,
} from '@hugeicons/core-free-icons';

import { ContainerStatusSummaryCard } from '@features/containers/components/details';
import { BagCard } from '@features/bags/components/details';
import {
	DetailPageTabs,
	type DetailPageTab,
} from '@features/packing/components/tabs';
import { UpdateBagDialog } from '@features/bags/components/dialogs';

import useBagDetails from '@features/bags/hooks/useBagDetails';
import useBagActions from '@features/bags/hooks/useBagActions';

// ── NEW: packing context wiring ──────────────────────────────────
import { useAppDispatch } from '@shared/store/hooks';
import { setPackingContext } from '@features/packing/store';
// ─────────────────────────────────────────────────────────────────

import { ContainerType, SuccessMessages } from '@beggy/shared/constants';
import { notify } from '@shared/utils/notify.utils';
import type { HttpClientError } from '@shared/types';

// ─── Skeleton ──────────────────────────────────────────────────────────────────

const BagDetailsPageSkeleton = () => (
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
				<Skeleton className="h-9 w-20 rounded-md" />
				<Skeleton className="h-9 w-24 rounded-md" />
			</div>
		</div>
		<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<div className="flex flex-col gap-6 lg:col-span-2">
				<Skeleton className="h-48 w-full rounded-xl" />
				<Skeleton className="h-32 w-full rounded-xl" />
			</div>
			<div className="flex flex-col gap-6">
				<Skeleton className="h-64 w-full rounded-xl" />
			</div>
		</div>
	</div>
);

// ─── Error state ───────────────────────────────────────────────────────────────

const BagDetailsError = ({
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
				Couldn&apos;t load this bag
			</h3>
			<p className="text-muted-foreground text-sm">
				Something went wrong fetching the bag details.
			</p>
		</div>
		<div className="flex items-center gap-2">
			<Button variant="outline" onClick={onBack}>
				<HugeiconsIcon
					icon={ArrowLeft01Icon}
					className="me-2 h-4 w-4"
				/>
				Back to bags
			</Button>
			<Button onClick={onRetry}>Try again</Button>
		</div>
	</div>
);

// ─── Component ─────────────────────────────────────────────────────────────────

type BagDetailsPageProps = {
	id: string;
};

const BagDetailsPage = ({ id }: BagDetailsPageProps) => {
	const router = useRouter();

	// ── NEW ──────────────────────────────────────────────────────────────────
	const dispatch = useAppDispatch();
	// ─────────────────────────────────────────────────────────────────────────

	const { bag, isLoading, isError, refetch } = useBagDetails(id);
	const [editOpen, setEditOpen] = useState(false);
	const { remove, isDeleting } = useBagActions();
	const [activeTab, setActiveTab] = useState<DetailPageTab>('info');

	const handleDelete = async () => {
		if (!bag) return;
		await remove(bag.id, {
			onSuccess: () => {
				notify.success({ message: SuccessMessages.BAG_DELETED });
				router.push('/bags');
			},
			onError: (err: unknown) =>
				notify.error.fromHttp(err as HttpClientError),
		});
	};

	// ── NEW: dispatch context then navigate ──────────────────────────────────
	const handleNavigateToPacking = () => {
		if (!bag) return;

		dispatch(
			setPackingContext({
				containerId: bag.containerId,
				containerName: bag.name,
				containerType: ContainerType.BAG,
				sourceId: bag.id,
				maxWeight: bag.maxWeight,
				maxCapacity: bag.maxCapacity,
				weightUnit: 'kg',
				capacityUnit: 'L',
			})
		);

		router.push(`/packing/${bag.containerId}`);
	};
	// ─────────────────────────────────────────────────────────────────────────

	if (isLoading) return <BagDetailsPageSkeleton />;

	if (isError || !bag) {
		return (
			<BagDetailsError
				onBack={() => router.push('/bags')}
				onRetry={() => void refetch()}
			/>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			{/* ── Page header ──────────────────────────────────────────────── */}
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="flex items-center gap-3">
					<Button
						variant="ghost"
						size="icon"
						aria-label="Back to bags"
						onClick={() => router.push('/bags')}
					>
						<HugeiconsIcon
							icon={ArrowLeft01Icon}
							className="h-4 w-4"
						/>
					</Button>
					<div>
						<h1 className="text-foreground text-xl font-semibold leading-tight">
							{bag.name}
						</h1>
						<p className="text-muted-foreground text-sm">
							Bag details
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setEditOpen(true)}
						disabled={isDeleting}
					>
						<HugeiconsIcon
							icon={PencilEdit02Icon}
							className="me-2 h-4 w-4"
						/>
						Edit
					</Button>
					<Button
						variant="destructive"
						size="sm"
						onClick={() => void handleDelete()}
						disabled={isDeleting}
					>
						<HugeiconsIcon
							icon={Delete02Icon}
							className="me-2 h-4 w-4"
						/>
						{isDeleting ? 'Deleting…' : 'Delete'}
					</Button>
				</div>
			</div>

			{/* ── Tab row ──────────────────────────────────────────────────── */}
			<DetailPageTabs
				activeTab={activeTab}
				onTabChange={setActiveTab}
				containerId={bag.containerId}
				// ── FIXED: was router.push only, now dispatches context first ──
				onNavigateToPacking={handleNavigateToPacking}
				// ─────────────────────────────────────────────────────────────
				containerName={bag.name}
				containerType={ContainerType.BAG}
				sourceId={bag.id}
				maxWeight={bag.maxWeight}
				maxCapacity={bag.maxCapacity}
			/>

			{/* ── Content — only when info tab is active ───────────────────── */}
			{activeTab === 'info' && (
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
					{/* Left column */}
					<div className="flex flex-col gap-6 lg:col-span-2">
						{/* Identity card */}
						{/*
						 * BagCard replaces the hand-rolled identity card + features card.
						 *
						 * We suppress the actions menu here — the page header already
						 * has Edit and Delete buttons, so the overflow menu would be
						 * redundant and confusing. onSelect is a no-op for the same
						 * reason: the user is already on the detail page.
						 *
						 * isDeleting dims and locks the card while the mutation runs,
						 * matching the same locked state on the header buttons.
						 */}
						<BagCard
							bag={bag}
							onSelect={() => router.push(`/bags/${bag.id}`)}
							onEdit={() => setEditOpen(true)}
							onDelete={() => void handleDelete()}
							isDeleting={isDeleting}
						/>
					</div>

					{/* Right column */}
					<div className="flex flex-col gap-6">
						<ContainerStatusSummaryCard
							status={bag.status ?? null}
							maxWeight={bag.maxWeight}
							maxCapacity={bag.maxCapacity}
							title="Packing status"
						/>
					</div>
				</div>
			)}

			{/* ── Edit dialog ──────────────────────────────────────────────── */}
			<UpdateBagDialog
				bag={editOpen ? bag : null}
				onClose={() => setEditOpen(false)}
				onSuccess={() => {
					setEditOpen(false);
					void refetch();
				}}
			/>
		</div>
	);
};

export default BagDetailsPage;
