'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@shadcn-lib';
import { Badge } from '@shadcn-ui/badge';
import { ContainerStatus } from '@beggy/shared/constants';

const metricBadgeVariants = cva(
	'inline-flex items-center gap-1 font-medium tabular-nums leading-none',
	{
		variants: {
			size: {
				sm: 'px-1.5 py-0.5 text-[10px]',
				md: 'px-2 py-1 text-xs',
			},
			intent: {
				neutral: ['border-border bg-muted text-muted-foreground'],
				success: [
					'border-success/30 bg-success/10 text-success',
					'dark:bg-success/20',
				],
				warning: [
					'border-warning/30 bg-warning/10 text-warning-foreground',
					'dark:bg-warning/20 dark:text-warning',
				],
				destructive: [
					'border-destructive/30 bg-destructive/10 text-destructive',
					'dark:bg-destructive/25 dark:text-destructive-foreground',
				],
			},
		},
		defaultVariants: { size: 'md', intent: 'neutral' },
	}
);

export interface ContainerMetricBadgeProps extends VariantProps<
	typeof metricBadgeVariants
> {
	/** Numeric value to display (formatted to 1 decimal place). */
	value: number;
	/** Unit label (e.g., kg, L, %). */
	unit: string;
	/** Domain status used to derive visual intent. */
	status?: ContainerStatus | null;
	className?: string;
}

/**
 * Maps domain-level container status to UI intent.
 *
 * @remarks
 * Acts as a boundary between domain semantics and presentation styling.
 * Defaults to `neutral` for unknown or missing statuses to avoid misleading signals.
 */
const intentFromStatus = (
	status?: ContainerStatus | null
): 'neutral' | 'success' | 'warning' | 'destructive' => {
	if (!status) return 'neutral';

	const intentMap: Record<
		ContainerStatus,
		'neutral' | 'success' | 'warning' | 'destructive'
	> = {
		[ContainerStatus.OK]: 'success',
		[ContainerStatus.FULL]: 'warning',
		[ContainerStatus.OVERWEIGHT]: 'destructive',
		[ContainerStatus.OVER_CAPACITY]: 'destructive',
		[ContainerStatus.EMPTY]: 'neutral',
	};

	return intentMap[status] ?? 'neutral';
};

/**
 * Displays a formatted container metric with contextual visual intent.
 *
 * @description
 * Combines a numeric value and its unit into a compact badge.
 * Visual styling reflects container status (e.g., warning, destructive).
 */
const ContainerMetricBadge = ({
	value,
	unit,
	status,
	size,
	className,
}: ContainerMetricBadgeProps) => (
	<Badge
		role="img"
		aria-label={`${value.toFixed(1)} ${unit}`}
		className={cn(
			metricBadgeVariants({ size, intent: intentFromStatus(status) }),
			className
		)}
	>
		<span className="font-semibold">{value.toFixed(1)}</span>
		<span className="text-[9px] font-medium uppercase tracking-wide opacity-50 leading-none">
			{unit}
		</span>
	</Badge>
);

export default ContainerMetricBadge;
