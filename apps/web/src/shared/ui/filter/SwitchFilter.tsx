import { Switch } from '@shadcn-ui/switch';
import { Label } from '@shadcn-ui/label';
import { Button } from '@shadcn-ui/button';
import { cn } from '@shadcn-lib';

/**
 * Props for the SwitchFilter component.
 *
 * @remarks
 * - Represents a tri-state boolean filter
 * - Designed for query semantics (`true | false | undefined`)
 * - Uses a switch for primary intent and buttons for secondary intent
 */
type SwitchFilterProps = {
	/**
	 * Visible label for the filter.
	 *
	 * @example "Active users"
	 * @example "Fragile items"
	 */
	label: string;

	/**
	 * Current filter value.
	 *
	 * @remarks
	 * - `true`      → explicitly include matching items
	 * - `false`     → explicitly exclude matching items
	 * - `undefined` → filter not applied
	 */
	value?: boolean;

	/**
	 * Change handler.
	 *
	 * @remarks
	 * - Emits `true`, `false`, or `undefined`
	 * - `undefined` resets the filter
	 */
	onChange: (value?: boolean) => void;

	/**
	 * Label shown when the switch is ON.
	 *
	 * @defaultValue "Yes"
	 */
	trueLabel?: string;

	/**
	 * Label shown when the switch is OFF / excluded.
	 *
	 * @defaultValue "No"
	 */
	falseLabel?: string;

	/**
	 * Optional helper text shown below the control.
	 */
	description?: string;

	/**
	 * Optional validation or query error message.
	 */
	error?: string;
};

/**
 * Boolean switch filter with explicit exclude and reset states.
 *
 * @remarks
 * ### UX model
 * - Switch ON  → include (`true`)
 * - Exclude    → explicitly exclude (`false`)
 * - Clear      → reset filter (`undefined`)
 *
 * ### Why this exists
 * - Prevents ambiguous boolean filtering
 * - Makes exclusion a deliberate, visible action
 * - Avoids hidden default behavior
 *
 * @example
 * ```tsx
 * <SwitchFilter
 *   label="Email verified"
 *   value={filters.isEmailVerified}
 *   onChange={(val) =>
 *     setFilters({ ...filters, isEmailVerified: val })
 *   }
 * />
 * ```
 */
const SwitchFilter = ({
	label,
	value,
	onChange,
	trueLabel = 'Yes',
	falseLabel = 'No',
	description,
	error,
}: SwitchFilterProps) => {
	/**
	 * Derived states.
	 *
	 * @remarks
	 * - `isOn` reflects the switch position
	 * - `isExcluded` indicates explicit exclusion
	 */
	const isOn = value === true;
	const isExcluded = value === false;

	return (
		<div className="space-y-1">
			<div className="flex items-center justify-between">
				<Label className="text-sm">{label}</Label>

				<div className="flex items-center gap-2">
					{/* Dynamic state label */}
					<span className="text-xs text-muted-foreground">
						{isExcluded ? falseLabel : trueLabel}
					</span>

					{/* Primary include toggle */}
					<Switch
						checked={isOn}
						onCheckedChange={(checked) =>
							// Switch controls only inclusion.
							// Exclusion is a deliberate secondary action.
							onChange(checked ? true : undefined)
						}
					/>
				</div>
			</div>

			{/* Secondary actions appear only when the filter is active */}
			{isOn && (
				<div className="flex gap-2 pt-1">
					<Button
						type="button"
						variant="outline"
						size="xs"
						onClick={() => onChange(false)}
						className={cn(
							// Visually reinforce exclusion state
							isExcluded && 'border-primary text-primary'
						)}
					>
						Exclude ({falseLabel})
					</Button>

					<Button
						type="button"
						variant="ghost"
						size="xs"
						onClick={() => onChange(undefined)}
					>
						Clear
					</Button>
				</div>
			)}

			{/* Helper text */}
			{description && (
				<p className="text-xs text-muted-foreground">{description}</p>
			)}

			{/* Validation error */}
			{error && <p className="text-xs text-destructive">{error}</p>}
		</div>
	);
};

export default SwitchFilter;
