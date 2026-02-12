import { Input } from '@shadcn-ui/input';
import { Label } from '@shadcn-ui/label';

/**
 * Value shape for a date range filter.
 *
 * @remarks
 * - Matches `dateRangeSchema` exactly
 * - Both boundaries are optional
 * - `undefined` represents an unbounded side
 */
type DateRangeValue = {
	/**
	 * Start date (inclusive).
	 */
	from?: Date;

	/**
	 * End date (inclusive).
	 */
	to?: Date;
};

/**
 * Props for the DateRangeFilter component.
 *
 * @remarks
 * - Designed to be schema-driven (Zod-compatible)
 * - Emits `undefined` when the filter is effectively empty
 * - Error messaging is handled externally (form-level validation)
 */
type DateRangeFilterProps = {
	/**
	 * Visible label for the filter.
	 */
	label: string;

	/**
	 * Current value of the date range.
	 *
	 * @remarks
	 * - `undefined` means no filter applied
	 * - Partial ranges are allowed (from-only / to-only)
	 */
	value?: DateRangeValue;

	/**
	 * Change handler.
	 *
	 * @remarks
	 * - Receives `undefined` when both dates are cleared
	 * - Keeps query params and form state clean
	 */
	onChange: (value?: DateRangeValue) => void;

	/**
	 * Optional helper text shown below the inputs.
	 */
	description?: string;

	/**
	 * Optional validation error message.
	 *
	 * @remarks
	 * - Typically populated from Zod / server-side validation
	 * - Displayed under the description for clear hierarchy
	 */
	error?: string;
};

/**
 * Converts a Date object into a YYYY-MM-DD string
 * suitable for native `<input type="date" />`.
 *
 * @param date - Optional Date value
 */
const toInputValue = (date?: Date) =>
	date ? date.toISOString().slice(0, 10) : '';

/**
 * Date range filter component.
 *
 * @remarks
 * - UI representation of `dateRangeSchema`
 * - Uses native date inputs for accessibility & mobile UX
 * - Prevents emitting empty objects by normalizing to `undefined`
 *
 * @example
 * ```tsx
 * <DateRangeFilter
 *   label="Created At"
 *   value={filters.createdAt}
 *   onChange={(val) => setFilters({ ...filters, createdAt: val })}
 * />
 * ```
 */
const DateRangeFilter = ({
	label,
	value,
	onChange,
	description,
	error,
}: DateRangeFilterProps) => {
	const from = value?.from;
	const to = value?.to;

	/**
	 * Normalizes outgoing values.
	 *
	 * @remarks
	 * - If both dates are cleared, emit `undefined`
	 * - Keeps query params minimal and avoids empty objects
	 */
	const update = (next: DateRangeValue) => {
		if (!next.from && !next.to) {
			onChange(undefined);
		} else {
			onChange(next);
		}
	};

	return (
		<div className="space-y-1">
			<Label className="text-sm">{label}</Label>

			{/* Date inputs laid out side-by-side for quick comparison */}
			<div className="grid grid-cols-2 gap-2">
				<Input
					type="date"
					aria-label="Start date"
					value={toInputValue(from)}
					onChange={(e) =>
						update({
							from: e.target.value
								? new Date(e.target.value)
								: undefined,
							to,
						})
					}
				/>

				<Input
					type="date"
					aria-label="End date"
					value={toInputValue(to)}
					onChange={(e) =>
						update({
							from,
							to: e.target.value
								? new Date(e.target.value)
								: undefined,
						})
					}
				/>
			</div>

			{/* Helper text */}
			{description && (
				<p className="text-xs text-muted-foreground">{description}</p>
			)}

			{/* Validation error */}
			{error && <p className="text-xs text-destructive">{error}</p>}
		</div>
	);
};

export default DateRangeFilter;
