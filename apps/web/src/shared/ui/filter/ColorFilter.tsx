'use client';

import { useEffect, useId, useState } from 'react';

import { Input } from '@shadcn-ui/input';
import { Label } from '@shadcn-ui/label';
import { Button } from '@shadcn-ui/button';
import { Badge } from '@shadcn-ui/badge';
import { cn } from '@shadcn-lib';

import { HugeiconsIcon } from '@hugeicons/react';
import { CancelCircleIcon, PaintBucketIcon } from '@hugeicons/core-free-icons';

// ─── Quick-pick swatches ────────────────────────────────────────────────────────

/**
 * Curated common packing colors.
 *
 * @remarks
 * - Values are lowercase strings that match the `color` field in ItemDTO.
 * - `bg` is a raw Tailwind palette class used ONLY for the swatch dot
 *   inside this component — not as a semantic token. The dot is purely
 *   decorative and conveys no state meaning, so this is intentional and
 *   acceptable per the design system rules.
 */
const QUICK_COLORS: { label: string; value: string; bg: string }[] = [
	{ label: 'Black', value: 'black', bg: 'bg-zinc-900' },
	{ label: 'White', value: 'white', bg: 'bg-zinc-100 border border-border' },
	{ label: 'Gray', value: 'gray', bg: 'bg-zinc-400' },
	{ label: 'Red', value: 'red', bg: 'bg-red-500' },
	{ label: 'Blue', value: 'blue', bg: 'bg-blue-500' },
	{ label: 'Green', value: 'green', bg: 'bg-green-500' },
	{ label: 'Yellow', value: 'yellow', bg: 'bg-yellow-400' },
	{ label: 'Brown', value: 'brown', bg: 'bg-amber-800' },
	{ label: 'Pink', value: 'pink', bg: 'bg-pink-400' },
	{ label: 'Navy', value: 'navy', bg: 'bg-blue-900' },
];

// ─── Types ─────────────────────────────────────────────────────────────────────

/**
 * Props for {@link ColorFilter}.
 *
 * @remarks
 * - Controlled component. `value` is the source of truth.
 * - Emits `undefined` when the filter is cleared.
 * - Matches the `color` field in `ItemFilterInput`.
 */
export type ColorFilterProps = {
	/**
	 * Visible label for accessibility and filter panel context.
	 */
	label?: string;

	/**
	 * Current filter value (a color string or `undefined`).
	 *
	 * @remarks
	 * - `undefined` means no filter applied.
	 * - Should match the `color` field format stored in the DB (lowercase string).
	 */
	value?: string;

	/**
	 * Called whenever the selected color changes.
	 *
	 * @remarks
	 * - Emits trimmed lowercase string.
	 * - Emits `undefined` when cleared.
	 */
	onChange: (value?: string) => void;

	/**
	 * Debounce delay for the free-text input in ms.
	 *
	 * @defaultValue 400
	 */
	debounceMs?: number;

	/**
	 * Optional helper text shown below the input.
	 */
	description?: string;

	/**
	 * Validation error message.
	 */
	error?: string;

	/**
	 * Additional wrapper className.
	 */
	className?: string;
};

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * ColorFilter
 *
 * @description
 * A two-mode color filter:
 * 1. **Quick-pick swatches** — one-click selection of common colors.
 * 2. **Free-text input** — debounced typing for custom color names.
 *
 * @remarks
 * - Follows the same controlled + debounced pattern as `SearchInput`.
 * - Swatch selection bypasses debounce and emits immediately.
 * - Selecting an active swatch deselects it (toggle behavior).
 * - The text input and swatches stay in sync via shared `local` state.
 * - Palette colors on swatch dots are intentionally decorative (not semantic tokens).
 *
 * @example
 * ```tsx
 * <ColorFilter
 *   label="Color"
 *   value={filters.color}
 *   onChange={(val) => update({ color: val })}
 * />
 * ```
 */
const ColorFilter = ({
	label = 'Color',
	value,
	onChange,
	debounceMs = 400,
	description,
	error,
	className,
}: ColorFilterProps) => {
	const id = useId();

	/**
	 * Local text state for smooth typing.
	 * Mirrors the controlled `value` prop on external changes.
	 */
	const [local, setLocal] = useState(value ?? '');

	/**
	 * Whether a quick-pick swatch is actively selected.
	 * Derived from local state to avoid a separate boolean flag.
	 */
	const activeQuick = QUICK_COLORS.find(
		(c) => c.value === local.trim().toLowerCase()
	);

	// ── Sync external resets ─────────────────────────────────────────────────

	/**
	 * Sync local state when parent resets the value
	 * (e.g. "Clear all filters" clears `value` to undefined).
	 */
	useEffect(() => {
		setLocal(value ?? '');
	}, [value]);

	// ── Debounced free-text emit ─────────────────────────────────────────────

	/**
	 * Debounce propagation for manual text input only.
	 * Swatch clicks bypass this via `emitImmediate`.
	 */
	useEffect(() => {
		// Skip debounce if local matches a quick-pick (swatch click already emitted)
		if (activeQuick) return;

		const handler = setTimeout(() => {
			const trimmed = local.trim().toLowerCase();
			onChange(trimmed === '' ? undefined : trimmed);
		}, debounceMs);

		return () => clearTimeout(handler);
	}, [local, debounceMs, onChange, activeQuick]);

	// ── Handlers ─────────────────────────────────────────────────────────────

	/**
	 * Immediate emit for swatch clicks — no debounce needed.
	 */
	const emitImmediate = (val: string) => {
		onChange(val === '' ? undefined : val);
	};

	const handleSwatchClick = (colorValue: string) => {
		// Toggle: clicking the active swatch deselects it
		const next = local === colorValue ? '' : colorValue;
		setLocal(next);
		emitImmediate(next);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setLocal(e.target.value);
		// Debounce effect handles the emit
	};

	const handleClear = () => {
		setLocal('');
		emitImmediate('');
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Escape') handleClear();
	};

	// ── Render ───────────────────────────────────────────────────────────────

	return (
		<div className={cn('flex flex-col gap-2', className)}>
			{/* Label */}
			<Label
				htmlFor={id}
				className="text-muted-foreground text-xs font-medium uppercase tracking-wide"
			>
				{label}
			</Label>

			{/* Free-text input */}
			<div className="relative">
				{/* Leading icon */}
				<HugeiconsIcon
					icon={PaintBucketIcon}
					className="text-foreground/50 pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
				/>

				<Input
					id={id}
					value={local}
					placeholder="e.g. black, navy, olive…"
					aria-invalid={!!error}
					aria-describedby={
						error
							? `${id}-error`
							: description
								? `${id}-description`
								: undefined
					}
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
					className={cn(
						'pl-9 pr-9',
						error &&
							'border-destructive focus-visible:ring-destructive'
					)}
				/>

				{/* Clear button — only visible when there's a value */}
				{local && (
					<Button
						type="button"
						variant="ghost"
						size="icon"
						aria-label="Clear color filter"
						onClick={handleClear}
						className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full"
					>
						<HugeiconsIcon
							icon={CancelCircleIcon}
							className="text-foreground/50 hover:text-foreground h-4 w-4"
						/>
					</Button>
				)}
			</div>

			{/* Quick-pick swatch row */}
			<div
				role="group"
				aria-label="Quick color picks"
				className="flex flex-wrap gap-1.5"
			>
				{QUICK_COLORS.map((color) => {
					const isActive = activeQuick?.value === color.value;

					return (
						<button
							key={color.value}
							type="button"
							aria-label={color.label}
							aria-pressed={isActive}
							title={color.label}
							onClick={() => handleSwatchClick(color.value)}
							className={cn(
								'flex items-center gap-1.5 rounded-full px-2 py-1',
								'border text-xs font-medium transition-colors',
								'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
								isActive
									? 'bg-accent text-accent-foreground border-primary'
									: 'bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground'
							)}
						>
							{/* Decorative swatch dot — palette color is intentional here */}
							<span
								className={cn(
									'h-2.5 w-2.5 rounded-full flex-shrink-0',
									color.bg
								)}
								aria-hidden="true"
							/>
							{color.label}
						</button>
					);
				})}
			</div>

			{/* Active filter badge */}
			{local && !activeQuick && (
				<div className="flex items-center gap-1.5">
					<span className="text-muted-foreground text-xs">
						Filtering by:
					</span>
					<Badge variant="secondary" className="text-xs">
						{local.trim()}
					</Badge>
				</div>
			)}

			{/* Description */}
			{description && !error && (
				<p
					id={`${id}-description`}
					className="text-muted-foreground text-xs"
				>
					{description}
				</p>
			)}

			{/* Error */}
			{error && (
				<p id={`${id}-error`} className="text-destructive text-xs">
					{error}
				</p>
			)}
		</div>
	);
};

export default ColorFilter;
