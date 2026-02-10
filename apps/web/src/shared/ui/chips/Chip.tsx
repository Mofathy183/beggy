import { cn } from '@shadcn-lib';
import { ButtonHTMLAttributes } from 'react';

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	label: string;
	selected?: boolean;
};

const Chip = ({
	label,
	selected,
	disabled,
	className,
	...props
}: ChipProps) => {
	return (
		<button
			type="button"
			disabled={disabled}
			aria-pressed={selected}
			className={cn(
				'inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors',
				'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
				disabled && 'cursor-not-allowed opacity-50',
				selected
					? 'border-primary bg-primary text-primary-foreground'
					: 'border-border bg-background hover:bg-muted',
				className
			)}
			{...props}
		>
			{label}
		</button>
	);
};

export default Chip;
