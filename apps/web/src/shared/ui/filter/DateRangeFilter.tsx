'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';

import { cn } from '@shadcn-lib';
import { CalendarIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Label } from '@shadcn-ui/label';
import { Button } from '@shadcn-ui/button';
import { Badge } from '@shadcn-ui/badge';
import { Separator } from '@shadcn-ui/separator';
import { Calendar } from '@shadcn-ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@shadcn-ui/popover';

/**
 * Represents a selectable date range.
 *
 * @remarks
 * - Both boundaries are optional.
 * - `undefined` represents an unbounded side.
 * - If both `from` and `to` are undefined, the filter is considered inactive.
 */
type DateRangeValue = {
	/**
	 * Start date (inclusive).
	 */
	from: Date | undefined;

	/**
	 * End date (inclusive).
	 */
	to?: Date;
};

/**
 * Props for {@link DateRangeFilter}.
 *
 * @remarks
 * A controlled component designed for filtering data by date range.
 *
 * - Fully controlled via `value` and `onChange`
 * - Emits `undefined` when cleared
 * - Supports partial ranges
 * - Designed for schema-driven forms (Zod-compatible)
 *
 * @example
 * ```tsx
 * <DateRangeFilter
 *   label="Created Between"
 *   value={filters.createdAt}
 *   onChange={(v) => setFilters({ ...filters, createdAt: v })}
 * />
 * ```
 */
interface DateRangeFilterProps {
	/**
	 * Accessible label displayed above the control.
	 */
	label: string;

	/**
	 * Currently selected range.
	 *
	 * @remarks
	 * - `undefined` means no filter applied
	 * - Partial ranges are allowed
	 */
	value?: DateRangeValue;

	/**
	 * Called whenever the selection changes.
	 *
	 * @param value - The selected date range or `undefined` if cleared.
	 */
	onChange: (value?: DateRangeValue) => void;

	/**
	 * Helper text displayed below the control.
	 */
	description?: string;

	/**
	 * Validation error message.
	 */
	error?: string;

	/**
	 * Disables user interaction.
	 */
	disabled?: boolean;

	/**
	 * Additional container classes.
	 */
	className?: string;
}

const MIN_DATE = new Date('1900-01-01');
const MAX_DATE = new Date();

/**
 * DateRangeFilter
 *
 * @description
 * A reusable popover-based date range selector with:
 * - Active state styling
 * - Selected range preview
 * - Clear & apply controls
 * - Accessible behavior
 */
const DateRangeFilter = ({
	label,
	value,
	onChange,
	description,
	error,
	disabled,
	className,
}: DateRangeFilterProps) => {
	const [open, setOpen] = useState(false);

	/**
	 * Whether the filter is currently active.
	 */
	const isActive = Boolean(value?.from || value?.to);

	/**
	 * Formats the button label based on selected dates.
	 */
	const formattedLabel = useMemo(() => {
		if (!value?.from && !value?.to) return label;

		if (value.from && !value.to)
			return `From ${format(value.from, 'MMM dd, yyyy')}`;

		if (!value.from && value.to)
			return `Until ${format(value.to, 'MMM dd, yyyy')}`;

		return `${format(value.from!, 'MMM dd')} – ${format(
			value.to!,
			'MMM dd, yyyy'
		)}`;
	}, [value, label]);

	/**
	 * Handles calendar selection changes.
	 * Automatically closes when full range is selected.
	 */
	const handleSelect = (range: DateRangeValue | undefined) => {
		if (!range?.from && !range?.to) {
			onChange(undefined);
			return;
		}

		onChange(range);

		// Auto-close when both dates are selected
		if (range?.from && range?.to) {
			setOpen(false);
		}
	};

	/**
	 * Clears the filter.
	 */
	const handleClear = () => {
		onChange(undefined);
		setOpen(false);
	};

	return (
		<div className={cn('space-y-2', className)}>
			<Label>{label}</Label>

			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger>
					<Button
						type="button"
						variant={isActive ? 'secondary' : 'outline'}
						disabled={disabled}
						aria-expanded={open}
						className="w-full justify-between text-left font-normal"
					>
						<span className="flex items-center gap-2 truncate">
							<HugeiconsIcon
								icon={CalendarIcon}
								className="h-4 w-4"
							/>
							{formattedLabel}
						</span>
					</Button>
				</PopoverTrigger>

				<PopoverContent className="w-auto p-4 space-y-4">
					{/* Selected Preview */}
					{isActive && (
						<div className="flex flex-wrap items-center gap-2">
							{value?.from && (
								<Badge variant="secondary">
									From: {format(value.from, 'MMM dd, yyyy')}
								</Badge>
							)}
							{value?.to && (
								<Badge variant="secondary">
									To: {format(value.to, 'MMM dd, yyyy')}
								</Badge>
							)}
						</div>
					)}

					{isActive && <Separator />}

					{/* Calendar */}
					<Calendar
						mode="range"
						selected={value}
						onSelect={handleSelect}
						disabled={(date) => date < MIN_DATE || date > MAX_DATE}
					/>

					<Separator />

					{/* Footer Actions */}
					<div className="flex items-center justify-between">
						<Button
							variant="ghost"
							size="sm"
							onClick={handleClear}
							disabled={!isActive}
						>
							Clear
						</Button>

						<Button size="sm" onClick={() => setOpen(false)}>
							Apply
						</Button>
					</div>
				</PopoverContent>
			</Popover>

			{description && !error && (
				<p className="text-sm text-muted-foreground">{description}</p>
			)}

			{error && <p className="text-sm text-destructive">{error}</p>}
		</div>
	);
};

export default DateRangeFilter;
