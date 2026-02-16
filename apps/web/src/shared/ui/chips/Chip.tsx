import { cn } from '@shadcn-lib';
import { ButtonHTMLAttributes } from 'react';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';

type ChipVariant = 'default' | 'primary' | 'accent' | 'destructive';

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	label: string;
	selected?: boolean;
	variant?: ChipVariant;
	removable?: boolean;
	onRemove?: () => void;
	icon?: IconSvgElement;
};

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
	const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		onRemove?.();
	};

	return (
		<button
			aria-checked={selected}
			disabled={disabled}
			aria-pressed={selected}
			aria-label={`${selected ? 'Selected' : 'Not selected'} ${label}`}
			className={cn(
				// Base styles
				'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-200',
				// Focus styles
				'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
				// Disabled state
				disabled && 'cursor-not-allowed opacity-50',
				// 🔧 FIXED: Better unselected hover state
				!selected && [
					'border-border bg-background text-foreground',
					'hover:bg-muted hover:border-muted',
				],
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
						'border-destructive bg-destructive/10 text-destructive',
						'shadow-sm',
					],
				className
			)}
			{...props}
		>
			{icon && (
				<HugeiconsIcon icon={icon} className="size-4 flex-shrink-0" />
			)}
			<span className="truncate">{label}</span>
			{removable && !disabled && (
				<button
					type="button"
					onClick={handleRemove}
					aria-label={`Remove ${label}`}
					className={cn(
						'ml-0.5 flex-shrink-0 rounded-full p-0.5 transition-colors',
						'hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
					)}
				>
					<HugeiconsIcon icon={Cancel01Icon} className="size-3" />
				</button>
			)}
		</button>
	);
};

export default Chip;
