import { HugeiconsIcon } from '@hugeicons/react';
import {
	Location01Icon,
	AiGenerativeIcon,
	Luggage01Icon,
	ArrowRight01Icon,
} from '@hugeicons/core-free-icons';
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn-ui/card';
import { cn } from '@shadcn-lib';

// ─── Data ─────────────────────────────────────────────────────────────────────

const STEPS = [
	{
		step: '01',
		icon: Location01Icon,
		title: 'Enter your destination',
		description:
			"Tell Beggy where you're going and for how long. That's all it needs to get started.",
	},
	{
		step: '02',
		icon: AiGenerativeIcon,
		title: 'AI + weather analysis',
		description:
			'Beggy fetches live weather forecasts and runs your trip through its AI to build a personalised packing list.',
	},
	{
		step: '03',
		icon: Luggage01Icon,
		title: 'Pack smarter',
		description:
			'Review your list, check off items as you pack, and land at your destination knowing you have exactly what you need.',
	},
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * HowItWorksSection — 3-step explainer section.
 *
 * Pure Server Component — no interactivity, no hooks.
 * Uses shadcn Card for each step.
 * The connector arrows between cards are hidden on mobile.
 */
const HowItWorksSection = ({ className }: { className?: string }) => (
	<section
		id="how-it-works"
		aria-labelledby="how-it-works-heading"
		className={cn('px-4 py-20 md:px-6 md:py-28', className)}
	>
		<div className="mx-auto max-w-5xl">
			{/* Section header */}
			<div className="mb-12 text-center">
				<p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
					How it works
				</p>
				<h2
					id="how-it-works-heading"
					className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
				>
					From destination to packed bag
					<br className="hidden md:block" /> in three steps
				</h2>
				<p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
					No more guessing, no more overpacking, no more forgetting
					the one thing you actually needed.
				</p>
			</div>

			{/* Steps grid */}
			<div className="relative grid grid-cols-1 gap-6 md:grid-cols-3">
				{STEPS.map((step, i) => (
					<div
						key={step.step}
						className="relative flex items-stretch gap-4"
					>
						{/* Step card — shadcn Card */}
						<Card
							className={cn(
								'flex flex-1 flex-col',
								'transition-colors hover:border-primary/30'
							)}
						>
							<CardHeader className="pb-3">
								{/* Step number + icon row */}
								<div className="mb-3 flex items-center justify-between">
									<span className="text-xs font-semibold tabular-nums text-muted-foreground/60">
										{step.step}
									</span>
									<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
										<HugeiconsIcon
											icon={step.icon}
											className="h-5 w-5 text-primary"
										/>
									</span>
								</div>
								<CardTitle className="text-base font-semibold text-foreground">
									{step.title}
								</CardTitle>
							</CardHeader>
							<CardContent className="pt-0">
								<p className="text-sm leading-relaxed text-muted-foreground">
									{step.description}
								</p>
							</CardContent>
						</Card>

						{/* Connector arrow between cards — md only, not after last */}
						{i < STEPS.length - 1 && (
							<div className="absolute -end-5 top-1/2 z-10 hidden -translate-y-1/2 md:flex">
								<span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background">
									<HugeiconsIcon
										icon={ArrowRight01Icon}
										className="h-3.5 w-3.5 text-muted-foreground"
									/>
								</span>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	</section>
);

export default HowItWorksSection;
