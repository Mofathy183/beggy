'use client';

import { ToggleGroup, ToggleGroupItem } from '@shadcn-ui/toggle-group';
import { Label } from '@shadcn-ui/label';
import { Check, X, List } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from '@shadcn-lib';

/**
 * Boolean filter value.
 *
 * @remarks
 * - `true` → filter by true values
 * - `false` → filter by false values
 * - `undefined` → no filtering (represents "All")
 *
 * This mirrors backend query schema fields like:
 * `isActive?: boolean`
 *
 * Using `boolean | undefined` ensures alignment with
 * API contracts and avoids string-based domain modeling.
 */
export type ToggleFilterValue = boolean | undefined;

/**
 * Props for {@link ToggleFilter}.
 *
 * @remarks
 * - Designed for tri-state boolean filtering
 * - Domain-driven: exposes `boolean | undefined`
 * - Internally mapped to string values for ToggleGroup
 */
interface ToggleFilterProps {
	/**
	 * Optional label displayed above the toggle group.
	 */
	label?: string;

	/**
	 * Current filter value.
	 *
	 * - `true` → Yes
	 * - `false` → No
	 * - `undefined` → All
	 */
	value: ToggleFilterValue;

	/**
	 * Called when filter value changes.
	 *
	 * @param value Updated boolean filter value
	 */
	onChange: (value: ToggleFilterValue) => void;

	/**
	 * Optional additional class names.
	 */
	className?: string;

	/**
	 * Show small icons inside toggle items.
	 * Recommended for dashboard/admin use.
	 */
	showIcons?: boolean;
}

/**
 * Maps domain value to ToggleGroup string value.
 *
 * @remarks
 * ToggleGroup requires string values. This function
 * ensures internal UI compatibility without leaking
 * string types to the component API.
 */
const mapToString = (value: ToggleFilterValue): string => {
	if (value === undefined) return 'all';
	return value ? 'true' : 'false';
};

/**
 * Maps ToggleGroup string value back to domain value.
 *
 * @remarks
 * Converts UI state into `boolean | undefined`
 * to maintain backend alignment.
 */
const mapToBoolean = (value: string): ToggleFilterValue => {
	if (value === 'all') return undefined;
	return value === 'true';
};

/**
 * ToggleFilter
 *
 * @description
 * A tri-state segmented toggle component for boolean filtering.
 *
 * @remarks
 * - Built using shadcn `ToggleGroup`
 * - Designed for admin and data-heavy interfaces
 * - Aligns with backend schemas expecting `boolean | undefined`
 * - Represents: All / Yes / No
 *
 * @example
 * ```tsx
 * const [isActive, setIsActive] = useState<boolean | undefined>();
 *
 * <ToggleFilter
 *   label="Active Status"
 *   value={isActive}
 *   onChange={setIsActive}
 * />
 * ```
 */
const ToggleFilter = ({
	label,
	value,
	onChange,
	className,
	showIcons = false,
}: ToggleFilterProps) => {
	return (
		<div
			className={cn('flex items-center justify-between gap-4', className)}
		>
			{label && (
				<Label className="text-sm font-medium text-foreground leading-none">
					{label}
				</Label>
			)}

			<ToggleGroup
				type="single"
				value={mapToString(value)}
				onValueChange={(val) => {
					if (!val) return;
					onChange(mapToBoolean(val));
				}}
				className="inline-flex items-center rounded-full bg-muted/60 p-1 shadow-sm backdrop-blur-sm"
			>
				<ToggleGroupItem
					value="all"
					className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
				>
					{showIcons && (
						<HugeiconsIcon icon={List} className="h-3 w-3" />
					)}
					All
				</ToggleGroupItem>

				<ToggleGroupItem
					value="true"
					className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
				>
					{showIcons && (
						<HugeiconsIcon icon={Check} className="h-3 w-3" />
					)}
					Yes
				</ToggleGroupItem>

				<ToggleGroupItem
					value="false"
					className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
				>
					{showIcons && (
						<HugeiconsIcon icon={X} className="h-3 w-3" />
					)}
					No
				</ToggleGroupItem>
			</ToggleGroup>
		</div>
	);
};

export default ToggleFilter;
