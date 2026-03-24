import { HugeiconsIcon } from '@hugeicons/react';
import {
	ArrowRight01Icon,
	Luggage01Icon,
	AiGenerativeIcon,
	CloudSun,
} from '@hugeicons/core-free-icons';
import { Button } from '@shadcn-ui/button';
import { Card, CardContent } from '@shadcn-ui/card';
import { cn } from '@shadcn-lib';

// ─── Mini feature items ───────────────────────────────────────────────────────

const MINI_FEATURES = [
	{ icon: CloudSun, label: 'Weather-aware packing' },
	{ icon: AiGenerativeIcon, label: 'AI recommendations' },
	{ icon: Luggage01Icon, label: 'Weight limit tracking' },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

interface CtaSectionUIProps {
	onSignUp: () => void;
	onLogin: () => void;
	className?: string;
}

/**
 * CtaSection — final conversion section at the bottom of the homepage.
 *
 * Uses 'use client' because it owns the router navigation for the CTA buttons.
 * Uses shadcn Card for the contained CTA block.
 */
const CtaSection = ({ onSignUp, onLogin, className }: CtaSectionUIProps) => {
	return (
		<section
			aria-labelledby="cta-heading"
			className={cn('px-4 py-20 md:px-6 md:py-28', className)}
		>
			<div className="mx-auto max-w-3xl">
				<Card className="overflow-hidden text-center">
					<CardContent className="flex flex-col items-center gap-6 px-8 py-12 md:px-16">
						{/* Brand mark */}
						<span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
							<HugeiconsIcon
								icon={Luggage01Icon}
								className="h-6 w-6"
							/>
						</span>

						{/* Headline */}
						<div className="flex flex-col gap-3">
							<h2
								id="cta-heading"
								className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl"
							>
								Ready to pack smarter?
							</h2>
							<p className="mx-auto max-w-sm text-base text-muted-foreground">
								Join thousands of travellers who land at their
								destination with exactly what they need.
							</p>
						</div>

						{/* Mini feature row */}
						<div className="flex flex-wrap justify-center gap-4">
							{MINI_FEATURES.map((f) => (
								<div
									key={f.label}
									className="flex items-center gap-1.5 text-sm text-muted-foreground"
								>
									<HugeiconsIcon
										icon={f.icon}
										className="h-4 w-4 text-primary"
									/>
									{f.label}
								</div>
							))}
						</div>

						{/* CTAs — shadcn Button */}
						<div className="flex flex-wrap justify-center gap-3">
							<Button
								size="lg"
								onClick={onSignUp}
								className="gap-2 px-8"
							>
								Start packing free
								<HugeiconsIcon
									icon={ArrowRight01Icon}
									className="h-4 w-4"
								/>
							</Button>
							<Button
								variant="outline"
								size="lg"
								onClick={onLogin}
								className="px-6"
							>
								Sign in
							</Button>
						</div>

						{/* No credit card note */}
						<p className="text-xs text-muted-foreground/70">
							No credit card required · Free to start
						</p>
					</CardContent>
				</Card>
			</div>
		</section>
	);
};

export default CtaSection;
