import { cn } from '@shadcn-lib';
import { ButtonHTMLAttributes } from 'react';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';

/**
 * Visual style variants for a selected Chip.
 *
 * @remarks
 * Variants only affect the selected state.
 * Unselected chips use neutral styling by design to reduce visual noise.
 */
type ChipVariant = 'default' | 'primary' | 'accent' | 'destructive';

/**
 * Props for the Chip component.
 *
 * @remarks
 * This component extends native button behavior to ensure:
 * - Full keyboard accessibility
 * - Native form compatibility
 * - Predictable interaction patterns
 *
 * The Chip acts as a toggleable filter/tag control,
 * optionally supporting a removable action.
 */
type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	/** Visible label inside the chip */
	label: string;

	/** Whether the chip is in a selected (active) state */
	selected?: boolean;

	/** Visual variant applied when selected */
	variant?: ChipVariant;

	/** Enables a remove (×) action inside the chip */
	removable?: boolean;

	/** Callback fired when remove button is clicked */
	onRemove?: () => void;

	/** Optional leading icon */
	icon?: IconSvgElement;
};

/**
 * Chip Component
 *
 * @description
 * A compact, toggleable UI element used for:
 * - Filters
 * - Tags
 * - Multi-select controls
 * - Category pills
 *
 * @designPrinciples
 * - Built on `<button>` for native accessibility & keyboard support.
 * - Uses `aria-pressed` for toggle semantics.
 * - Uses `aria-checked` for screen reader clarity in selection contexts.
 * - Keeps unselected state visually minimal to reduce cognitive load.
 * - Variants enhance meaning only when selected.
 *
 * @uxConsiderations
 * - Hover states provide subtle affordance.
 * - Focus ring ensures keyboard navigability.
 * - Remove action is visually separated and stops event propagation.
 */
const Chip = ({
	label,
	selected = false,
	variant = 'default',
	removable = false,
	onRemove,
	icon,
	disabled,
	className,
	...props
}: ChipProps) => {
	/**
	 * Handles removal of the chip.
	 *
	 * @remarks
	 * - Stops propagation to prevent triggering parent toggle behavior.
	 * - Only fires `onRemove` if provided.
	 *
	 * Important for UX:
	 * Removing a chip should NOT toggle its selection state.
	 */
	const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		onRemove?.();
	};

	return (
		<button
			/**
			 * Accessibility:
			 * - aria-pressed communicates toggle state
			 * - aria-checked improves clarity in multi-select contexts
			 * - aria-label ensures assistive tech reads state + label
			 */
			aria-checked={selected}
			disabled={disabled}
			aria-pressed={selected}
			aria-label={`${selected ? 'Selected' : 'Not selected'} ${label}`}
			className={cn(
				// Base layout + structure
				// Rounded pill shape reinforces "tag/filter" mental model
				'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-200',

				// Focus styles (keyboard accessibility)
				'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',

				// Disabled state
				// Reduces visual prominence + disables pointer interaction
				disabled && 'cursor-not-allowed opacity-50',

				// Default (unselected) appearance
				// Intentionally neutral to reduce visual clutter in filter groups
				!selected && [
					'border-border bg-background text-foreground',
					'hover:bg-muted hover:border-muted',
				],

				// Selected state variants
				// Stronger visual emphasis communicates active filtering
				selected &&
					variant === 'default' && [
						'border-secondary bg-secondary text-secondary-foreground',
						'shadow-sm',
					],

				selected &&
					variant === 'primary' && [
						'border-primary bg-primary text-primary-foreground',
						'shadow-sm',
					],

				selected &&
					variant === 'accent' && [
						'border-accent bg-accent text-accent-foreground',
						'shadow-sm',
					],

				selected &&
					variant === 'destructive' && [
						// Destructive is visually softer to avoid aggressive UI tone
						'border-destructive bg-destructive/10 text-destructive',
						'shadow-sm',
					],

				className
			)}
			{...props}
		>
			{/* Optional leading icon for semantic reinforcement */}
			{icon && (
				<HugeiconsIcon icon={icon} className="size-4 flex-shrink-0" />
			)}

			{/* Truncated label prevents layout break in dense filter rows */}
			<span className="truncate">{label}</span>

			{/* Optional remove action */}
			{removable && !disabled && (
				<button
					type="button"
					onClick={handleRemove}
					aria-label={`Remove ${label}`}
					className={cn(
						// Small circular hit target
						'ml-0.5 flex-shrink-0 rounded-full p-0.5 transition-colors',

						// Subtle hover affordance
						'hover:bg-foreground/10',

						// Accessible focus style
						'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
					)}
				>
					<HugeiconsIcon icon={Cancel01Icon} className="size-3" />
				</button>
			)}
		</button>
	);
};

export default Chip;
