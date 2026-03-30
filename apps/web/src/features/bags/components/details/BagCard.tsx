'use client';

import { Card, CardContent, CardHeader } from '@shadcn-ui/card';
import { Badge } from '@shadcn-ui/badge';
import { Separator } from '@shadcn-ui/separator';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	WeightScaleIcon,
	DropletIcon,
	Luggage01Icon,
} from '@hugeicons/core-free-icons';
import { cn } from '@shadcn-lib';
import { format } from 'date-fns';

import { BagTypeBadge } from '@features/bags/components/badges';
import { BagFeatureChips } from '@features/bags/components/chips';
import { MaterialBadge, SizeBadge } from '@shared-ui/badges';
import { BagActions } from '@features/bags/components/actions';
import { ContainerStatusPanel } from '@features/container/components/visualization';

import { BagFeature } from '@beggy/shared/constants';
import type { BagDTO } from '@beggy/shared/types';

// ─── Types ─────────────────────────────────────────────────────────────────────

type BagCardProps = {
	bag: BagDTO;
	onEdit: (bag: BagDTO) => void;
	onDelete: (bag: BagDTO) => void;
	isUpdating?: boolean;
	isDeleting?: boolean;
	className?: string;
};

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * BagCard
 *
 * @description
 * Displays a single bag as a card in the bags grid.
 *
 * @remarks
 * Anatomy (top to bottom):
 * 1. Header       — name (line-clamp-2) + BagActions overflow menu
 * 2. Meta row     — BagTypeBadge + waterproof/trolley-sleeve indicators
 *                   Indicators are derived from BagFeature[] using the typed
 *                   enum — never string literals cast with `as never`.
 * 3. Stats        — max weight / max capacity in a 2-col grid
 * 4. Status panel — ContainerStatusPanel compact variant (progress bars only,
 *                   no badge — BagTypeBadge already occupies that visual slot)
 * 5. Features     — BagFeatureChips read-only, max 3 + overflow chip
 * 6. Footer       — createdAt date, muted
 *
 * The `isDeleting` dim/lock is applied at card level so the user can't
 * re-trigger the action while the mutation is in-flight.
 */
const BagCard = ({
	bag,
	onEdit,
	onDelete,
	isUpdating = false,
	isDeleting = false,
	className,
}: BagCardProps) => {
	// Derive feature flags from the typed enum — no string casting needed
	const isWaterproof = bag.features?.includes(BagFeature.WATERPROOF);
	const hasTrolleySleeve = bag.features?.includes(BagFeature.TROLLEY_SLEEVE);

	return (
		<Card
			className={cn(
				'flex flex-col gap-0 transition-shadow hover:shadow-md',
				isDeleting && 'pointer-events-none opacity-60',
				className
			)}
		>
			{/* ── Header: name + actions ───────────────────────────────────── */}
			<CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
				<h3
					className="text-foreground line-clamp-2 text-sm font-semibold leading-snug"
					title={bag.name}
				>
					{bag.name}
				</h3>

				<BagActions
					bag={bag}
					onEdit={() => onEdit(bag)}
					onDelete={() => onDelete(bag)}
					isUpdating={isUpdating}
					isDeleting={isDeleting}
				/>
			</CardHeader>

			<CardContent className="flex flex-col gap-3 pt-0">
				{/* ── Type + property indicators ───────────────────────────── */}
				<div className="flex flex-wrap items-center gap-1.5">
					<BagTypeBadge value={bag.type} size="sm" />

					<SizeBadge value={bag.size} size="sm" />

					<MaterialBadge value={bag.material} size="sm" />

					{/*
					 * Only the two most universally recognisable features
					 * get a dedicated indicator badge here — waterproof and
					 * trolley sleeve (wheels). The rest are in BagFeatureChips.
					 */}
					{isWaterproof && (
						<Badge
							aria-label="Waterproof"
							className={cn(
								'inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium',
								'border-success/30 bg-success/10 text-success'
							)}
						>
							<HugeiconsIcon
								icon={DropletIcon}
								size={10}
								className="shrink-0"
							/>
							Waterproof
						</Badge>
					)}

					{hasTrolleySleeve && (
						<Badge
							aria-label="Trolley sleeve"
							className={cn(
								'inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium',
								'bg-secondary text-secondary-foreground border-border'
							)}
						>
							<HugeiconsIcon
								icon={Luggage01Icon}
								size={10}
								className="shrink-0"
							/>
							Trolley
						</Badge>
					)}
				</div>

				<Separator />

				{/* ── Stats: max weight + max capacity ─────────────────────── */}
				<div className="grid grid-cols-2 gap-3">
					<div className="flex flex-col gap-0.5">
						<span className="text-muted-foreground flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide">
							<HugeiconsIcon
								icon={WeightScaleIcon}
								size={10}
								className="shrink-0"
							/>
							Max weight
						</span>
						<span className="text-foreground text-sm font-semibold tabular-nums">
							{bag.maxWeight != null
								? `${bag.maxWeight} kg`
								: '—'}
						</span>
					</div>

					<div className="flex flex-col gap-0.5">
						<span className="text-muted-foreground flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide">
							<HugeiconsIcon
								icon={Luggage01Icon}
								size={10}
								className="shrink-0"
							/>
							Max capacity
						</span>
						<span className="text-foreground text-sm font-semibold tabular-nums">
							{bag.maxCapacity != null
								? `${bag.maxCapacity} L`
								: '—'}
						</span>
					</div>
				</div>

				<Separator />

				{/* ── Container status — compact progress bars ─────────────── */}
				{/*
				 * bag.status is optional — panel renders its own skeleton
				 * when null so the card layout stays stable during load.
				 * showBadge=false: BagTypeBadge already occupies the badge
				 * slot; a second badge would create visual competition.
				 */}
				<ContainerStatusPanel
					status={bag.status ?? null}
					maxWeight={bag.maxWeight}
					maxCapacity={bag.maxCapacity}
					variant="compact"
					showBadge={false}
				/>

				{/* ── Features ─────────────────────────────────────────────── */}
				{/*
				 * BagFeatureChips uses ChipList internally — read-only,
				 * pointer-events-none, no hover affordance.
				 * groupLabel corrected to "Bag features" (not "Status reasons").
				 * maxVisible=3 + overflow chip prevents card height blowout.
				 */}
				{bag.features && bag.features.length > 0 && (
					<>
						<Separator />
						<BagFeatureChips
							features={bag.features}
							maxVisible={3}
							display="short"
						/>
					</>
				)}

				{/* ── Footer: date added ───────────────────────────────────── */}
				{bag.createdAt && (
					<>
						<Separator />
						<p className="text-muted-foreground/70 text-[11px]">
							Added{' '}
							{format(new Date(bag.createdAt), 'MMM d, yyyy')}
						</p>
					</>
				)}
			</CardContent>
		</Card>
	);
};

export default BagCard;
