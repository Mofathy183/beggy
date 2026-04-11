'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle } from '@shadcn-ui/card';
import { Button } from '@shadcn-ui/button';
import { Badge } from '@shadcn-ui/badge';
import { Separator } from '@shadcn-ui/separator';
import { Skeleton } from '@shadcn-ui/skeleton';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	ArrowLeft01Icon,
	PencilEdit02Icon,
	Delete02Icon,
	WeightScaleIcon,
	DropletIcon,
	Luggage01Icon,
	Diamond01Icon,
	Calendar01Icon,
	AlertCircleIcon,
} from '@hugeicons/core-free-icons';
import { cn } from '@shadcn-lib';

import { ContainerStatusSummaryCard } from '@features/container/components/details';
import {
	DetailPageTabs,
	type DetailPageTab,
} from '@features/packing/components/tabs';
import { BagTypeBadge } from '@features/bags/components/badges';
import { BagFeatureChips } from '@features/bags/components/chips';
import { UpdateBagDialog } from '@features/bags/components/dialogs';

import useBagDetails from '@features/bags/hooks/useBagDetails';
import useBagActions from '@features/bags/hooks/useBagActions';

import { notify } from '@shared/utils/notify.utils';

import {
	BagFeature,
	SuccessMessages,
	ContainerType,
} from '@beggy/shared/constants';
import {
	SIZE_OPTIONS,
	MATERIAL_OPTIONS,
	getEnumLabel,
} from '@shared/ui/mappers';
import { HttpClientError } from '@shared/types';

// ─── Skeleton ──────────────────────────────────────────────────────────────────

/**
 * BagDetailsPageSkeleton
 *
 * Matches the details page layout exactly so there's no layout shift
 * when the real data arrives.
 */
const BagDetailsPageSkeleton = () => (
	<div className="flex flex-col gap-6">
		{/* Header */}
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

		{/* Content grid */}
		<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
			{/* Left column */}
			<div className="flex flex-col gap-6 lg:col-span-2">
				<Skeleton className="h-48 w-full rounded-xl" />
				<Skeleton className="h-32 w-full rounded-xl" />
			</div>
			{/* Right column */}
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
				Couldn't load this bag
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

/**
 * BagDetailsPage
 *
 * @description
 * Full detail view for a single bag, accessed at `/bags/[id]`.
 *
 * @remarks
 * Layout — two-column on large screens, single-column on small:
 *
 * ┌─────────────────────────────────────┬───────────────────────┐
 * │ LEFT (lg:col-span-2)                │ RIGHT (lg:col-span-1) │
 * ├─────────────────────────────────────┼───────────────────────┤
 * │ Bag identity card                   │ ContainerStatus       │
 * │  - type badge + property indicators │  (full variant with   │
 * │  - size, material, color            │   metric grid +       │
 * │  - empty weight, createdAt          │   progress bars +     │
 * ├─────────────────────────────────────┤   reason chips)       │
 * │ Features card                       │                       │
 * │  - BagFeatureChips full labels      │                       │
 * │  - all features, no overflow        │                       │
 * └─────────────────────────────────────┴───────────────────────┘
 *
 * Actions:
 * - Edit button → opens UpdateBagDialog
 * - Delete button → remove() with notify callbacks → navigate back on success
 *
 * Hook wiring:
 * - `useBagDetails(id)` — fetches the bag (skips when id undefined)
 * - `useBagActions()`   — edit/remove with callbacks
 * - `isDeleting` from actions drives the delete button loading state
 *
 * The page owns all notify calls. Hooks expose callbacks; pages own feedback.
 */
const BagDetailsPage = ({ id }: BagDetailsPageProps) => {
	const router = useRouter();

	// ── Data ─────────────────────────────────────────────────────────────────
	const { bag, isLoading, isError, refetch } = useBagDetails(id);

	// ── Edit dialog ──────────────────────────────────────────────────────────
	const [editOpen, setEditOpen] = useState(false);

	// ── Mutations ────────────────────────────────────────────────────────────
	const { remove, isDeleting } = useBagActions();

	// ── tab state ───────────────────────────────────────────────────────
	// Only 'info' is a real state here — 'packing' navigates away.
	// We track it so the Info tab can show its active style correctly.
	const [activeTab, setActiveTab] = useState<DetailPageTab>('info');

	const handleDelete = () => {
		if (!bag) return;
		remove(bag.id, {
			onSuccess: () => {
				notify.success({ message: SuccessMessages.BAG_DELETED });
				router.push('/bags');
			},
			onError: (err: unknown) =>
				notify.error.fromHttp(err as HttpClientError),
		});
	};

	// ── Loading ───────────────────────────────────────────────────────────────
	if (isLoading) return <BagDetailsPageSkeleton />;

	// ── Error ─────────────────────────────────────────────────────────────────
	if (isError || !bag) {
		return (
			<BagDetailsError
				onBack={() => router.push('/bags')}
				onRetry={refetch}
			/>
		);
	}

	// ── Derived ───────────────────────────────────────────────────────────────
	const isWaterproof = bag.features?.includes(BagFeature.WATERPROOF);
	const hasTrolleySleeve = bag.features?.includes(BagFeature.TROLLEY_SLEEVE);
	const hasFeatures = bag.features && bag.features.length > 0;

	const sizeLabel = getEnumLabel(SIZE_OPTIONS, bag.size);
	const materialLabel = bag.material
		? getEnumLabel(MATERIAL_OPTIONS, bag.material)
		: null;

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

				{/* Action buttons */}
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
						onClick={handleDelete}
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

			{/* ── Content grid ─────────────────────────────────────────────── */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* ── Left column ──────────────────────────────────────────── */}
				<div className="flex flex-col gap-6 lg:col-span-2">
					{/* Identity card */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Bag info
							</CardTitle>
						</CardHeader>

						<CardContent className="flex flex-col gap-4">
							{/* Type + property indicators */}
							<div className="flex flex-wrap items-center gap-1.5">
								<BagTypeBadge value={bag.type} size="md" />

								{isWaterproof && (
									<Badge
										aria-label="Waterproof"
										className={cn(
											'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium',
											'border-success/30 bg-success/10 text-success'
										)}
									>
										<HugeiconsIcon
											icon={DropletIcon}
											size={11}
											className="shrink-0"
										/>
										Waterproof
									</Badge>
								)}

								{hasTrolleySleeve && (
									<Badge
										aria-label="Trolley sleeve"
										className={cn(
											'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium',
											'bg-secondary text-secondary-foreground border-border'
										)}
									>
										<HugeiconsIcon
											icon={Luggage01Icon}
											size={11}
											className="shrink-0"
										/>
										Trolley sleeve
									</Badge>
								)}
							</div>

							<Separator />

							{/* Metadata grid */}
							<div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
								{/* Size */}
								{sizeLabel && (
									<div className="flex flex-col gap-0.5">
										<span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">
											Size
										</span>
										<span className="text-foreground text-sm font-medium">
											{sizeLabel}
										</span>
									</div>
								)}

								{/* Material */}
								{materialLabel && (
									<div className="flex flex-col gap-0.5">
										<span className="text-muted-foreground flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide">
											<HugeiconsIcon
												icon={Diamond01Icon}
												size={10}
											/>
											Material
										</span>
										<span className="text-foreground text-sm font-medium">
											{materialLabel}
										</span>
									</div>
								)}

								{/* Color */}
								{bag.color && (
									<div className="flex flex-col gap-0.5">
										<span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">
											Color
										</span>
										<span className="text-foreground text-sm font-medium capitalize">
											{bag.color}
										</span>
									</div>
								)}

								{/* Max weight */}
								<div className="flex flex-col gap-0.5">
									<span className="text-muted-foreground flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide">
										<HugeiconsIcon
											icon={WeightScaleIcon}
											size={10}
										/>
										Max weight
									</span>
									<span className="text-foreground text-sm font-semibold tabular-nums">
										{bag.maxWeight != null
											? `${bag.maxWeight} kg`
											: '—'}
									</span>
								</div>

								{/* Max capacity */}
								<div className="flex flex-col gap-0.5">
									<span className="text-muted-foreground flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide">
										<HugeiconsIcon
											icon={Luggage01Icon}
											size={10}
										/>
										Max capacity
									</span>
									<span className="text-foreground text-sm font-semibold tabular-nums">
										{bag.maxCapacity != null
											? `${bag.maxCapacity} L`
											: '—'}
									</span>
								</div>

								{/* Empty weight */}
								{bag.emptyWeight != null && (
									<div className="flex flex-col gap-0.5">
										<span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">
											Empty weight
										</span>
										<span className="text-foreground text-sm font-medium tabular-nums">
											{bag.emptyWeight} kg
										</span>
									</div>
								)}

								{/* Date added */}
								{bag.createdAt && (
									<div className="flex flex-col gap-0.5">
										<span className="text-muted-foreground flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide">
											<HugeiconsIcon
												icon={Calendar01Icon}
												size={10}
											/>
											Added
										</span>
										<span className="text-foreground text-sm font-medium">
											{format(
												new Date(bag.createdAt),
												'MMM d, yyyy'
											)}
										</span>
									</div>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Features card — only when features exist */}
					{hasFeatures && (
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-sm font-medium text-muted-foreground">
									Features
								</CardTitle>
							</CardHeader>

							<CardContent>
								{/*
								 * Full labels + no overflow on detail pages.
								 * groupLabel="Bag features" — corrected from
								 * the original "Status reasons" typo.
								 */}
								<BagFeatureChips
									features={bag.features}
									display="full"
									maxVisible={Infinity}
								/>
							</CardContent>
						</Card>
					)}
				</div>

				{/* ── Right column: container status ───────────────────────── */}
				{/*
				 * ContainerStatusSummaryCard wraps ContainerStatusPanel with
				 * the full variant: metric grid + progress bars + reason chips.
				 * bag.status is optional — the card handles null gracefully
				 * by rendering the panel's built-in skeleton.
				 */}
				<div className="flex flex-col gap-6">
					<ContainerStatusSummaryCard
						status={bag.status ?? null}
						maxWeight={bag.maxWeight}
						maxCapacity={bag.maxCapacity}
						title="Packing status"
					/>
				</div>
			</div>

			{/* ── Tab row — NEW ─────────────────────────────────────────────── */}
			{/*
			 * Requires bag.containerId to be present in BagDTO.
			 * Add `containerId: bag.containerId` to your bag mapper on the API side.
			 *
			 * The Pack tab dispatches setPackingContext to Redux and navigates
			 * to /packing/[containerId] — no search params needed.
			 */}
			<DetailPageTabs
				activeTab={activeTab}
				onTabChange={setActiveTab}
				containerId={bag.containerId}
				onNavigateToPacking={() =>
					router.push(`/packing/${bag.containerId}`)
				}
				containerName={bag.name}
				containerType={ContainerType.BAG}
				sourceId={bag.id}
				maxWeight={bag.maxWeight}
				maxCapacity={bag.maxCapacity}
			/>

			{/* ── Content — only shown when activeTab === 'info' ────────────── */}
			{activeTab === 'info' && (
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
					{/* Left column — bag identity + features cards (unchanged) */}
					<div className="flex flex-col gap-6 lg:col-span-2">
						{/* ... your existing identity Card and features Card ... */}
					</div>

					{/* Right column — container status (unchanged) */}
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
			{/*
			 * Boolean open pattern (vs nullable-bag pattern on list page)
			 * because we already have the bag from useBagDetails —
			 * we don't need a separate state variable to carry the bag.
			 * onSuccess: close dialog + refetch so metrics update.
			 */}
			<UpdateBagDialog
				bag={editOpen ? bag : null}
				onClose={() => setEditOpen(false)}
				onSuccess={() => {
					setEditOpen(false);
					refetch();
				}}
			/>
		</div>
	);
};

export default BagDetailsPage;
