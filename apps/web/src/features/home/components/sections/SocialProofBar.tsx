import { HugeiconsIcon } from '@hugeicons/react';
import {
	Luggage01Icon,
	AiGenerativeIcon,
	CloudSun,
} from '@hugeicons/core-free-icons';
import { Separator } from '@shadcn-ui/separator';
import { cn } from '@shadcn-lib';

// ─── Data ─────────────────────────────────────────────────────────────────────

const STATS = [
	{
		icon: Luggage01Icon,
		value: '12,000+',
		label: 'trips packed',
	},
	{
		icon: AiGenerativeIcon,
		value: '98%',
		label: 'packing accuracy',
	},
	{
		icon: CloudSun,
		value: '50+',
		label: 'weather patterns covered',
	},
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * SocialProofBar — horizontal stat strip between hero and how-it-works.
 *
 * Pure Server Component — no interactivity, no hooks.
 * Uses shadcn Separator for the dividers.
 * Collapses to a single-column stack on mobile.
 */
const SocialProofBar = ({ className }: { className?: string }) => (
	<div
		className={cn(
			'border-y border-border bg-muted/30',
			'px-4 py-8 md:px-6',
			className
		)}
	>
		<div className="mx-auto max-w-4xl">
			<div className="flex flex-col items-center gap-6 md:flex-row md:gap-0">
				{STATS.map((stat, i) => (
					<div
						key={stat.label}
						className="flex items-center md:flex-1"
					>
						{/* Stat item */}
						<div className="flex flex-1 flex-col items-center gap-1 text-center">
							<div className="flex items-center gap-2">
								<HugeiconsIcon
									icon={stat.icon}
									className="h-4 w-4 text-primary"
								/>
								<span className="text-2xl font-semibold text-foreground">
									{stat.value}
								</span>
							</div>
							<span className="text-sm text-muted-foreground">
								{stat.label}
							</span>
						</div>

						{/* Divider between items — hidden on last */}
						{i < STATS.length - 1 && (
							<Separator
								orientation="vertical"
								className="hidden h-10 md:block"
							/>
						)}
					</div>
				))}
			</div>
		</div>
	</div>
);

export default SocialProofBar;
