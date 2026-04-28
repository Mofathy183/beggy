'use client';

import { cn } from '@shadcn-lib';

export interface ContainerStatCellProps {
	/**
	 * Metric label displayed above the value.
	 * Always rendered uppercase + tracked — e.g. "Current weight".
	 */
	label: string;

	/**
	 * Pre-formatted numeric string — caller owns the precision.
	 * Example: "12.4", "0.0"
	 */
	value: string;

	/**
	 * Unit appended inline after the value.
	 * Example: "kg", "L"
	 */
	unit: string;

	/**
	 * Semantic emphasis — drives both text color and cell background tint.
	 *
	 * - `'destructive'` — over limit (overweight / over capacity / zero remaining)
	 * - `'warning'`     — near limit (≥ 95% utilization)
	 * - `undefined`     — within safe range
	 */
	emphasis?: 'warning' | 'destructive';

	/**
	 * When true, renders the value at `text-xl` — for primary metrics
	 * (current weight, used capacity) that answer "where am I now?".
	 *
	 * When false (default), renders at `text-sm` — for secondary metrics
	 * (remaining weight, remaining capacity) that give supporting context.
	 *
	 * @defaultValue false
	 */
	primary?: boolean;

	className?: string;
}

/**
 * ContainerStatCell
 *
 * ## Dark mode fix
 * The card surface in dark mode is oklch(0.216) — near-black warm tone.
 * Low-opacity backgrounds (5%, 30%) become invisible against it.
 * Dark overrides boost opacity so tinted cells remain distinguishable:
 *
 * | state       | light bg          | dark bg               |
 * |-------------|-------------------|-----------------------|
 * | neutral     | bg-muted/30       | dark:bg-muted/60      |
 * | destructive | bg-destructive/5  | dark:bg-destructive/15|
 * | warning     | bg-warning/5      | dark:bg-warning/10    |
 *
 * Border opacity also increases in dark mode for the same reason —
 * dark borders at /30 alpha disappear against the near-black card.
 */
const ContainerStatCell = ({
	label,
	value,
	unit,
	emphasis,
	primary = false,
	className,
}: ContainerStatCellProps) => (
	<div
		className={cn(
			'flex flex-col gap-1 rounded-lg border p-3 transition-colors',
			// ── Neutral ───────────────────────────────────────────────────────
			!emphasis && ['border-border bg-muted/30', 'dark:bg-muted/60'],
			// ── Destructive ───────────────────────────────────────────────────
			// Light: faint rose tint — visible on white card
			// Dark:  stronger tint + more opaque border — visible on near-black card
			emphasis === 'destructive' && [
				'border-destructive/30 bg-destructive/5',
				'dark:border-destructive/50 dark:bg-destructive/15',
			],
			// ── Warning ───────────────────────────────────────────────────────
			// Light: faint amber tint — visible on white card
			// Dark:  stronger tint + more opaque border — visible on near-black card
			emphasis === 'warning' && [
				'border-warning/30 bg-warning/5',
				'dark:border-warning/40 dark:bg-warning/10',
			],
			className
		)}
	>
		{/* ── Label ─────────────────────────────────────────────────────────── */}
		<p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
			{label}
		</p>

		{/* ── Value + unit ──────────────────────────────────────────────────── */}
		<p
			className={cn(
				'font-semibold tabular-nums leading-none',
				primary ? 'text-xl' : 'text-sm',
				// ── Text colors ───────────────────────────────────────────────
				// Destructive: token is oklch(0.38) in both modes — dark-ish red.
				// On near-black card it has low contrast, so switch to
				// destructive-foreground (oklch 0.971 — near-white) in dark.
				emphasis === 'destructive' && [
					'text-destructive',
					'dark:text-destructive-foreground',
				],
				// Warning: text-warning-foreground is oklch(0.2) dark brown in
				// both modes — invisible on dark card. Switch to text-warning
				// (oklch 0.82 in dark — bright amber) for legibility.
				emphasis === 'warning' && [
					'text-warning-foreground',
					'dark:text-warning',
				],
				!emphasis && 'text-foreground'
			)}
		>
			{value}
			<span
				className={cn(
					'ms-1 font-normal text-muted-foreground',
					primary ? 'text-sm' : 'text-xs'
				)}
			>
				{unit}
			</span>
		</p>
	</div>
);

export default ContainerStatCell;
