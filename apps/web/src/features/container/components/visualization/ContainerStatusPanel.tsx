'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@shadcn-lib';
import { Separator } from '@shadcn-ui/separator';
import { Skeleton } from '@shadcn-ui/skeleton';
import { Card, CardContent, CardHeader } from '@shadcn-ui/card';
import { Badge } from '@shadcn-ui/badge';
import type { ContainerStatusDTO } from '@beggy/shared/types';
import { ContainerStatus } from '@beggy/shared/constants';
import { ContainerStatusBadge } from '@features/container/components/badges';
import { ContainerStatusReasonChips } from '@features/container/components/chips';
import { ContainerStatusEmptyState } from '@features/container/components/states';
import {
	ContainerStatCell,
	ContainerProgressBar,
} from '@features/container/components/visualization';

// ─── Panel variants ───────────────────────────────────────────────────────────

const panelVariants = cva('flex flex-col', {
	variants: {
		variant: {
			/**
			 * `compact` — BagCard list view.
			 * Tight layout, no card shell, no metric grid.
			 * Badge lives in the card header already — showBadge=false by default.
			 */
			compact: 'gap-2.5',
			/**
			 * `full` — BagDetailsPage + form live preview.
			 * Card shell, header surface, metric grid, reason chips.
			 */
			full: 'gap-0',
		},
	},
	defaultVariants: { variant: 'full' },
});

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ContainerStatusPanelProps extends VariantProps<
	typeof panelVariants
> {
	/** Aggregated container status (metrics + state). */
	status: ContainerStatusDTO | null | undefined;

	/** Maximum allowed weight. */
	maxWeight: number;

	/** Maximum allowed capacity. */
	maxCapacity: number;

	weightUnit?: string;
	capacityUnit?: string;

	/** Toggles status badge visibility. */
	showBadge?: boolean;

	/** Toggles metric grid visibility. */
	showMetrics?: boolean;

	/** Context label used in empty state messaging. */
	containerLabel?: string;

	className?: string;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

/**
 * Skeleton placeholder matching the panel layout.
 *
 * @remarks
 * Variant-aware to preserve layout stability during loading.
 */
export const ContainerStatusPanelSkeleton = ({
	variant,
	className,
}: {
	variant?: 'compact' | 'full';
	className?: string;
}) => {
	if (variant === 'compact') {
		return (
			<div className={cn('flex flex-col gap-2.5', className)}>
				<div className="flex items-center justify-between">
					<Skeleton className="h-5 w-20 rounded-full" />
					<Skeleton className="h-4 w-10 rounded-md" />
				</div>
				{[0, 1].map((i) => (
					<div key={i} className="flex flex-col gap-1.5">
						<div className="flex items-center justify-between">
							<Skeleton className="h-3 w-12" />
							<Skeleton className="h-3 w-20" />
						</div>
						<Skeleton className="h-1.5 w-full rounded-full" />
					</div>
				))}
			</div>
		);
	}

	return (
		<Card className={cn('overflow-hidden', className)}>
			{/* Header skeleton */}
			<CardHeader className="bg-muted/40 pb-3">
				<div className="flex items-center justify-between">
					<Skeleton className="h-6 w-24 rounded-full" />
					<Skeleton className="h-4 w-14 rounded-md" />
				</div>
			</CardHeader>
			<CardContent className="flex flex-col gap-5 pt-5">
				{/* Metric grid skeleton */}
				<div className="grid grid-cols-2 gap-3">
					{Array.from({ length: 4 }).map((_, i) => (
						<div
							key={i}
							className={cn(
								'flex flex-col gap-1.5 rounded-lg border border-border p-3',
								// First two cells are taller (primary metrics)
								i < 2 && 'py-3.5'
							)}
						>
							<Skeleton className="h-2.5 w-16" />
							<Skeleton
								className={cn('w-20', i < 2 ? 'h-6' : 'h-4')}
							/>
						</div>
					))}
				</div>
				<Separator className="opacity-40" />
				{/* Progress bars skeleton */}
				<div className="flex flex-col gap-4">
					{[0, 1].map((i) => (
						<div key={i} className="flex flex-col gap-2">
							<div className="flex items-center justify-between">
								<Skeleton className="h-3 w-12" />
								<Skeleton className="h-3 w-24" />
							</div>
							<Skeleton className="h-2 w-full rounded-full" />
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * High-level container status visualization panel.
 *
 * @description
 * Composes badge, metrics, progress bars, and reason indicators into a
 * cohesive UI. Supports both compact and full layouts depending on context.
 *
 * @remarks
 * - `status === null/undefined` → renders skeleton (loading state)
 * - `EMPTY` status → renders empty state (full variant only)
 * - Emphasis and formatting are derived locally to keep subcomponents simple
 */
const ContainerStatusPanel = ({
	status,
	maxWeight,
	maxCapacity,
	variant = 'full',
	weightUnit = 'kg',
	capacityUnit = 'L',
	showBadge = true,
	showMetrics = true,
	containerLabel = 'container',
	className,
}: ContainerStatusPanelProps) => {
	// ── Null guard ───────────────────────────────────────────────────────────
	if (!status) {
		return (
			<ContainerStatusPanelSkeleton
				variant={variant ?? 'full'}
				className={className}
			/>
		);
	}

	const { metrics, state } = status;
	const isCompact = variant === 'compact';

	// ── Empty state — full variant only ─────────────────────────────────────
	if (state.status === ContainerStatus.EMPTY && !isCompact) {
		return (
			<ContainerStatusEmptyState
				containerLabel={containerLabel}
				className={className}
			/>
		);
	}

	// ── Emphasis derivation ──────────────────────────────────────────────────
	const weightEmphasis: 'destructive' | 'warning' | undefined =
		state.isOverweight
			? 'destructive'
			: state.isFull && metrics.weightPercentage >= 95
				? 'warning'
				: undefined;

	const capacityEmphasis: 'destructive' | 'warning' | undefined =
		state.isOverCapacity
			? 'destructive'
			: state.isFull && metrics.capacityPercentage >= 95
				? 'warning'
				: undefined;

	const maxWeightStr = `${maxWeight} ${weightUnit}`;
	const maxCapacityStr = `${maxCapacity} ${capacityUnit}`;

	// ── Compact variant ──────────────────────────────────────────────────────
	// Purpose-built for card context — tight, no chrome, no metric grid
	if (isCompact) {
		return (
			<div className={cn(panelVariants({ variant }), className)}>
				{showBadge && (
					<div className="flex items-center justify-between gap-2">
						<ContainerStatusBadge
							value={state.status}
							display="short"
							size="sm"
						/>
						<span className="text-xs text-muted-foreground tabular-nums">
							{metrics.itemCount}{' '}
							{metrics.itemCount === 1 ? 'item' : 'items'}
						</span>
					</div>
				)}
				<ContainerProgressBar
					label="Weight"
					percentage={metrics.weightPercentage}
					current={`${metrics.currentWeight.toFixed(1)} ${weightUnit}`}
					max={maxWeightStr}
					status={state.status}
				/>
				<ContainerProgressBar
					label="Capacity"
					percentage={metrics.capacityPercentage}
					current={`${metrics.currentCapacity.toFixed(1)} ${capacityUnit}`}
					max={maxCapacityStr}
					status={state.status}
				/>
			</div>
		);
	}

	// ── Full variant ─────────────────────────────────────────────────────────
	return (
		<Card className={cn('overflow-hidden', className)}>
			{/* ── Header — tinted surface for visual lift ────────────────────── */}
			{showBadge && (
				<CardHeader className="bg-muted/40 pb-4 pt-4">
					<div className="flex items-center justify-between gap-3">
						<ContainerStatusBadge
							value={state.status}
							display="full"
							size="md"
						/>
						{/* Item count pill */}
						<Badge
							variant="secondary"
							className="tabular-nums font-normal"
						>
							{metrics.itemCount}{' '}
							{metrics.itemCount === 1 ? 'item' : 'items'}
						</Badge>
					</div>
				</CardHeader>
			)}

			<CardContent
				className={cn(
					'flex flex-col gap-5',
					showBadge ? 'pt-5' : 'pt-6'
				)}
			>
				{/* ── 2×2 Metric grid ───────────────────────────────────────── */}
				{showMetrics && (
					<>
						<div className="grid grid-cols-2 gap-3">
							{/* Row 1: primary — current values (largest type) */}
							<ContainerStatCell
								label="Current weight"
								value={metrics.currentWeight.toFixed(1)}
								unit={weightUnit}
								emphasis={weightEmphasis}
								primary
							/>
							<ContainerStatCell
								label="Used capacity"
								value={metrics.currentCapacity.toFixed(1)}
								unit={capacityUnit}
								emphasis={capacityEmphasis}
								primary
							/>
							{/* Row 2: secondary — remaining headroom (smaller type) */}
							<ContainerStatCell
								label="Remaining weight"
								value={metrics.remainingWeight.toFixed(1)}
								unit={weightUnit}
								emphasis={
									metrics.remainingWeight <= 0
										? 'destructive'
										: undefined
								}
							/>
							<ContainerStatCell
								label="Remaining capacity"
								value={metrics.remainingCapacity.toFixed(1)}
								unit={capacityUnit}
								emphasis={
									metrics.remainingCapacity <= 0
										? 'destructive'
										: undefined
								}
							/>
						</div>
						<Separator className="opacity-40" />
					</>
				)}

				{/* ── Progress bars ──────────────────────────────────────────── */}
				<div className="flex flex-col gap-4">
					<ContainerProgressBar
						label="Weight"
						percentage={metrics.weightPercentage}
						current={`${metrics.currentWeight.toFixed(1)} ${weightUnit}`}
						max={maxWeightStr}
						status={state.status}
					/>
					<ContainerProgressBar
						label="Capacity"
						percentage={metrics.capacityPercentage}
						current={`${metrics.currentCapacity.toFixed(1)} ${capacityUnit}`}
						max={maxCapacityStr}
						status={state.status}
					/>
				</div>

				{/* ── Reason chips — only when reasons exist ─────────────────── */}
				{state.reasons.length > 0 && (
					<>
						<Separator className="opacity-40" />
						<ContainerStatusReasonChips
							reasons={state.reasons}
							maxVisible={Infinity}
							display="full"
						/>
					</>
				)}
			</CardContent>
		</Card>
	);
};

export default ContainerStatusPanel;
