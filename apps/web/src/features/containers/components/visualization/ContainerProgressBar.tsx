'use client';

import { Progress } from '@shadcn-ui/progress';
import { cn } from '@shadcn-lib';
import { ContainerStatus } from '@beggy/shared/constants';
import { CONTAINER_STATUS_PROGRESS_CLASS } from '@shared/ui/mappers';

export interface ContainerProgressBarProps {
	/**
	 * Numeric percentage value from `ContainerMetrics`.
	 *
	 * Sourced from `metrics.weightPercentage` or `metrics.capacityPercentage`.
	 * Values above 100 are clamped visually but the bar switches to the
	 * destructive color to communicate the overflow.
	 *
	 * @remarks
	 * `calculateWeightPercentage` and `calculateCapacityPercentage` already
	 * return values rounded to 1 decimal — no further rounding needed here
	 * beyond the display integer.
	 */
	percentage: number;

	/**
	 * Human-readable axis label (e.g. "Weight", "Capacity").
	 */
	label: string;

	/**
	 * Pre-formatted current value string built by the parent.
	 * Example: "12.4 kg", "18.0 L"
	 *
	 * The parent owns formatting because it knows the unit preference.
	 */
	current: string;

	/**
	 * Pre-formatted maximum value string built by the parent.
	 * Example: "20 kg", "30 L"
	 *
	 * Must be the real limit, not a placeholder.
	 * Sourced from `BagDTO.maxWeight` / `BagDTO.maxCapacity` by the parent —
	 * NOT from `ContainerMetrics` (metrics only has the current/remaining,
	 * not the original hard limit).
	 */
	max: string;

	/**
	 * Container status — drives the progress indicator color via
	 * `CONTAINER_STATUS_PROGRESS_CLASS`. The bar color is a direct semantic
	 * signal aligned with `ContainerStatusBadge` — same source map, same intent.
	 *
	 * Omit (or pass null) to fall back to the primary color.
	 */
	status?: ContainerStatus | null;

	className?: string;
}

/**
 * ContainerProgressBar
 *
 * @description
 * A single labeled progress bar for one container metric dimension
 * (weight OR capacity — never both in the same instance).
 *
 * ## Dark mode notes
 *
 * **Track visibility** — shadcn Progress uses `bg-secondary` for the unfilled
 * track. In dark mode `--secondary` is `oklch(0.274)`, very close to the card
 * surface `oklch(0.216)` — the track nearly disappears. Override with
 * `dark:[&>*:first-child]:bg-muted/80` which targets the track element directly
 * and boosts it to the warmer muted token at higher opacity.
 *
 * **Destructive percentage text** — `text-destructive` is `oklch(0.38)` in both
 * modes. On a white card it reads as a mid red. On the dark card `oklch(0.216)`
 * it has very low contrast. Switch to `dark:text-destructive-foreground`
 * (`oklch(0.971)` near-white) for readable contrast on the dark surface.
 *
 * **Warning percentage text** — `text-warning-foreground` is `oklch(0.2)` dark
 * brown in both modes — invisible on dark card. Switch to `text-warning`
 * (`oklch(0.82)` bright amber) in dark. Same fix as ContainerStatCell.
 */
const ContainerProgressBar = ({
	percentage,
	label,
	current,
	max,
	status,
	className,
}: ContainerProgressBarProps) => {
	// Clamp visual fill — the color communicates the overflow, not the bar width
	const clampedValue = Math.min(100, Math.max(0, percentage));

	// Display integer — percentage values come pre-rounded to 1 decimal from
	// the shared calculation functions
	const displayPercentage = Math.round(percentage);

	// Resolve indicator color from the canonical status → color map.
	// Falls back to primary when status is absent or unmapped.
	const indicatorClass =
		status && status in CONTAINER_STATUS_PROGRESS_CLASS
			? CONTAINER_STATUS_PROGRESS_CLASS[status]
			: '[&>div]:bg-primary';

	// Percentage text color mirrors the semantic intent of the bar.
	// Dark mode overrides follow the same reasoning as ContainerStatCell:
	// destructive token is too dark on near-black card → switch to foreground.
	// warning-foreground is dark brown → switch to warning (bright amber).
	const percentageTextClass =
		status === ContainerStatus.OVERWEIGHT ||
		status === ContainerStatus.OVER_CAPACITY
			? 'text-destructive dark:text-destructive-foreground'
			: status === ContainerStatus.FULL
				? 'text-warning-foreground dark:text-warning'
				: 'text-muted-foreground';

	return (
		<div className={cn('flex flex-col gap-1.5', className)}>
			{/* ── Label + current/max row ──────────────────────────────────── */}
			<div className="flex items-center justify-between gap-2">
				<p className="text-xs font-medium text-foreground">{label}</p>
				<p className="text-xs text-muted-foreground tabular-nums">
					{current}
					<span className="mx-1 opacity-40">/</span>
					{max}
				</p>
			</div>

			{/* ── shadcn Progress ───────────────────────────────────────────── */}
			{/*
			 * Track override: targets the first child of Progress (the track
			 * element) and bumps it to bg-muted/80 in dark mode so it stays
			 * visible against the near-black card surface.
			 * The indicator child ([&>div]) is handled by indicatorClass.
			 */}
			<Progress
				value={clampedValue}
				className={cn(
					'h-1.5',
					'dark:[&>*:first-child]:bg-muted/80',
					indicatorClass
				)}
				aria-label={`${label}: ${displayPercentage}%`}
				aria-valuenow={clampedValue}
				aria-valuemin={0}
				aria-valuemax={100}
			/>

			{/* ── Percentage readout — inherits semantic color ─────────────── */}
			<p
				className={cn('text-[11px] tabular-nums', percentageTextClass)}
				aria-hidden="true"
			>
				{displayPercentage}%
				{percentage > 100 && (
					<span className="ms-1 opacity-70">
						(+{Math.round(percentage - 100)}% over)
					</span>
				)}
			</p>
		</div>
	);
};

export default ContainerProgressBar;
