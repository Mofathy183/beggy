import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react';
import {
	ArrowRight01Icon,
	Luggage01Icon,
	CloudSun,
	SparklesIcon,
} from '@hugeicons/core-free-icons';
import { Button } from '@shadcn-ui/button';
import { cn } from '@shadcn-lib';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface HeroUIProps {
	/** Fires when the primary CTA "Start packing free" is clicked. */
	onStartPacking: () => void;

	/** Fires when the secondary CTA "See how it works" is clicked. */
	onSeeHowItWorks: () => void;

	/** Optional className forwarded to the root <section> element. */
	className?: string;
}

// ─── TrustBadge ───────────────────────────────────────────────────────────────

interface TrustBadgeProps {
	icon: IconSvgElement;
	label: string;
}

/**
 * Small pill badge used in the trust badge row.
 * Communicates key product capabilities at a glance below the headline.
 */
const TrustBadge = ({ icon, label }: TrustBadgeProps) => (
	<span
		className={cn(
			'inline-flex items-center gap-1.5',
			'rounded-full border border-border',
			'bg-background/60 backdrop-blur-sm',
			'px-3 py-1.5',
			'text-xs font-medium text-muted-foreground',
			'transition-colors hover:border-primary/30 hover:text-foreground'
		)}
	>
		<HugeiconsIcon icon={icon} className="h-3.5 w-3.5 text-primary" />
		{label}
	</span>
);

// ─── StatPill ─────────────────────────────────────────────────────────────────

interface StatPillProps {
	value: string;
	label: string;
}

/**
 * Floating stat card that overlays the hero visual.
 * Provides social proof / metric without a full testimonials section.
 */
const StatPill = ({ value, label }: StatPillProps) => (
	<div
		className={cn(
			'rounded-xl border border-border',
			'bg-card/90 backdrop-blur-md',
			'px-4 py-3 shadow-sm',
			'flex flex-col gap-0.5'
		)}
	>
		<span className="text-xl font-semibold leading-none text-foreground">
			{value}
		</span>
		<span className="text-xs text-muted-foreground">{label}</span>
	</div>
);

// ─── HeroVisual ───────────────────────────────────────────────────────────────

/**
 * The decorative right-side visual of the hero.
 *
 * Renders a stylised packing dashboard mockup built entirely from
 * semantic tokens — no hardcoded colors, dark-mode safe.
 *
 * This is a pure presentational SVG-based component.
 * It has zero interactivity and zero props.
 */
const HeroVisual = () => (
	<div className="relative flex items-center justify-center">
		{/* Ambient background glow — uses token-safe opacity modifiers */}
		<div
			aria-hidden="true"
			className={cn(
				'absolute inset-0 -z-10',
				'rounded-3xl',
				'bg-primary/5'
			)}
		/>

		{/* Main mockup card */}
		<div
			className={cn(
				'w-full max-w-sm rounded-2xl',
				'border border-border',
				'bg-card shadow-sm',
				'overflow-hidden'
			)}
			aria-hidden="true"
		>
			{/* Mockup header bar */}
			<div className="flex items-center gap-2 border-b border-border px-4 py-3">
				<span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
					<HugeiconsIcon icon={Luggage01Icon} className="h-4 w-4" />
				</span>
				<span className="text-sm font-semibold text-foreground">
					Paris · 5 days
				</span>
				<span className="ms-auto inline-flex items-center gap-1 rounded-full bg-success/12 px-2 py-0.5 text-xs font-medium text-success">
					AI ready
				</span>
			</div>

			{/* Weather strip */}
			<div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
				<HugeiconsIcon
					icon={CloudSun}
					className="h-4 w-4 text-warning"
				/>
				<span className="text-xs text-muted-foreground">
					Partly cloudy · 14–22°C · Pack a light jacket
				</span>
			</div>

			{/* Packing list items */}
			<div className="divide-y divide-border/60">
				{[
					{
						label: 'Light jacket',
						packed: true,
						category: 'Clothing',
					},
					{ label: 'Passport', packed: true, category: 'Documents' },
					{
						label: 'Charger adapter',
						packed: false,
						category: 'Electronics',
					},
					{
						label: 'Sunscreen SPF 50',
						packed: false,
						category: 'Toiletries',
					},
				].map((item) => (
					<div
						key={item.label}
						className="flex items-center gap-3 px-4 py-2.5"
					>
						<span
							className={cn(
								'h-4 w-4 shrink-0 rounded',
								'border',
								item.packed
									? 'border-success bg-success/20'
									: 'border-border bg-background'
							)}
						/>
						<span
							className={cn(
								'flex-1 text-sm',
								item.packed
									? 'text-muted-foreground line-through'
									: 'text-foreground'
							)}
						>
							{item.label}
						</span>
						<span className="text-xs text-muted-foreground/60">
							{item.category}
						</span>
					</div>
				))}
			</div>

			{/* AI suggestion footer */}
			<div
				className={cn(
					'flex items-start gap-2.5',
					'border-t border-border',
					'bg-primary/5 px-4 py-3'
				)}
			>
				<HugeiconsIcon
					icon={SparklesIcon}
					className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
				/>
				<p className="text-xs leading-relaxed text-muted-foreground">
					<span className="font-medium text-foreground">
						AI suggests:
					</span>{' '}
					Rain is forecast on day 3. Add a compact umbrella to your
					suitcase.
				</p>
			</div>
		</div>

		{/* Floating stat overlays */}
		<div className="absolute -start-6 top-8 hidden md:block">
			<StatPill value="2.4 kg" label="under limit" />
		</div>
		<div className="absolute -end-4 bottom-10 hidden md:block">
			<StatPill value="94%" label="packed" />
		</div>
	</div>
);

// ─── HeroUI ───────────────────────────────────────────────────────────────────

/**
 * Pure presentational hero section for the Beggy homepage.
 *
 * ── Zero hooks · Zero Redux · Zero side effects ──
 *
 * Layout (md+): two-column grid — copy left, visual right.
 * Layout (sm):  single column — copy above, visual below.
 *
 * Sections:
 *  - Eyebrow badge (AI-powered label)
 *  - H1 headline
 *  - Subheadline paragraph
 *  - Dual CTA row (primary + secondary)
 *  - Trust badge row (Weather · AI · Containers)
 */
const HeroUI = ({
	onStartPacking,
	onSeeHowItWorks,
	className,
}: HeroUIProps) => (
	<section
		aria-labelledby="hero-heading"
		className={cn(
			'relative overflow-hidden',
			'px-4 pb-20 pt-16 md:px-6 md:pb-28 md:pt-24',
			className
		)}
	>
		{/* Subtle background texture — token-safe */}
		<div
			aria-hidden="true"
			className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.08),transparent)]"
		/>

		<div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16">
			{/* ── Left: Copy ──────────────────────────────────────── */}
			<div className="flex flex-col items-start gap-6">
				{/* Eyebrow badge */}
				<span
					className={cn(
						'inline-flex items-center gap-1.5',
						'rounded-full border border-primary/20',
						'bg-primary/8 px-3 py-1',
						'text-xs font-medium text-primary'
					)}
				>
					<HugeiconsIcon icon={SparklesIcon} className="h-3 w-3" />
					AI-powered packing assistant
				</span>

				{/* Headline */}
				<h1
					id="hero-heading"
					className={cn(
						'text-4xl font-semibold leading-tight tracking-tight',
						'text-foreground',
						'md:text-5xl lg:text-6xl'
					)}
				>
					Pack once. <span className="text-primary">Pack right.</span>
				</h1>

				{/* Subheadline */}
				<p className="max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
					Beggy reads the weather at your destination, learns your
					packing habits, and tells you exactly what to bring — and
					what to leave behind.
				</p>

				{/* CTA row */}
				<div className="flex flex-wrap items-center gap-3">
					<Button
						size="lg"
						onClick={onStartPacking}
						className="gap-2 px-6"
					>
						Start packing free
						<HugeiconsIcon
							icon={ArrowRight01Icon}
							className="h-4 w-4"
						/>
					</Button>

					<Button
						variant="ghost"
						size="lg"
						onClick={onSeeHowItWorks}
						className="gap-2 px-5 text-muted-foreground hover:text-foreground"
					>
						See how it works
					</Button>
				</div>

				{/* Trust badge row */}
				<div className="flex flex-wrap gap-2">
					<TrustBadge icon={CloudSun} label="Weather-aware" />
					<TrustBadge icon={SparklesIcon} label="AI suggestions" />
					<TrustBadge icon={Luggage01Icon} label="Weight limits" />
				</div>
			</div>

			{/* ── Right: Visual ───────────────────────────────────── */}
			<HeroVisual />
		</div>
	</section>
);

export default HeroUI;
