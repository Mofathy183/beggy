/**
 * ticket.primitives.tsx
 *
 * Shared visual primitives for the boarding pass design language
 * used across ErrorState, NotFoundState, and ForbiddenState.
 *
 * Rules:
 * - No business logic here — purely presentational
 * - No imports from @beggy/shared — zero coupling to domain
 * - Consumed by all three state components
 */

import { Separator } from '@/shared/components/ui/separator';

// ---------------------------------------------------------------------------
// TearLine
// Classic boarding pass perforation divider.
// The notch circles must match the parent background color.
// ---------------------------------------------------------------------------

interface TearLineProps {
	/** Background color class of the parent container. Defaults to bg-background. */
	notchColor?: string;
}

export function TearLine({ notchColor = 'bg-background' }: TearLineProps) {
	return (
		<div className="relative my-0 flex items-center" aria-hidden="true">
			{/* Left notch */}
			<div
				className={`absolute -left-[1.65rem] h-8 w-8 rounded-full ${notchColor}`}
			/>
			<Separator className="flex-1 border-dashed border-border" />
			{/* Right notch */}
			<div
				className={`absolute -right-[1.65rem] h-8 w-8 rounded-full ${notchColor}`}
			/>
		</div>
	);
}

// ---------------------------------------------------------------------------
// TicketField
// Label + value layout mimicking a travel document field.
// ---------------------------------------------------------------------------

interface TicketFieldProps {
	label: string;
	value: React.ReactNode;
	className?: string;
}

export function TicketField({
	label,
	value,
	className = '',
}: TicketFieldProps) {
	return (
		<div className={`flex flex-col gap-0.5 ${className}`}>
			<span className="text-[0.625rem] font-semibold uppercase tracking-widest text-muted-foreground/70">
				{label}
			</span>
			<div className="text-sm font-medium text-foreground">{value}</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// TicketCodeValue
// Consistent monospace code block used inside TicketField values.
// ---------------------------------------------------------------------------

interface TicketCodeValueProps {
	children: React.ReactNode;
}

export function TicketCodeValue({ children }: TicketCodeValueProps) {
	return (
		<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
			{children}
		</code>
	);
}
