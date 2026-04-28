'use client';

import { cn } from '@shadcn-lib';
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn-ui/card';
import { HugeiconsIcon } from '@hugeicons/react';
import { BarChart } from '@hugeicons/core-free-icons';
import type { ContainerStatusDTO } from '@beggy/shared/types';
import { ContainerStatusPanel } from '@/features/containers/components/visualization';

export interface ContainerStatusSummaryCardProps {
	/** Aggregated container status data used for visualization. */
	status: ContainerStatusDTO | null | undefined;
	/** Maximum allowed weight for the container. */
	maxWeight: number;
	/** Maximum allowed capacity (volume). */
	maxCapacity: number;
	/** Display unit for weight values. Defaults to `kg`. */
	weightUnit?: string;
	/** Display unit for capacity values. Defaults to `L`. */
	capacityUnit?: string;
	/** Optional card title. */
	title?: string;
	className?: string;
}

/**
 * High-level summary card for container packing status.
 *
 * @description
 * Provides a consistent card layout with a title and delegates
 * all visualization logic to {@link ContainerStatusPanel}.
 *
 * @remarks
 * Accepts nullable `status` to support loading or empty states.
 * Rendering behavior for such cases is handled by the panel.
 */
const ContainerStatusSummaryCard = ({
	status,
	maxWeight,
	maxCapacity,
	weightUnit = 'kg',
	capacityUnit = 'L',
	title = 'Packing status',
	className,
}: ContainerStatusSummaryCardProps) => (
	<Card className={cn('overflow-hidden', className)}>
		<CardHeader className="pb-3">
			<CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
				<HugeiconsIcon icon={BarChart} className="h-4 w-4" />
				{title}
			</CardTitle>
		</CardHeader>
		<CardContent>
			<ContainerStatusPanel
				status={status}
				maxWeight={maxWeight}
				maxCapacity={maxCapacity}
				weightUnit={weightUnit}
				capacityUnit={capacityUnit}
				variant="full"
				showBadge
				showMetrics
			/>
		</CardContent>
	</Card>
);

export default ContainerStatusSummaryCard;
