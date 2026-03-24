import { HugeiconsIcon } from '@hugeicons/react';
import {
	CloudSun,
	AiGenerativeIcon,
	Luggage01Icon,
	CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons';
import { Card, CardContent } from '@shadcn-ui/card';
import { Badge } from '@shadcn-ui/badge';
import { cn } from '@/shared/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FeaturesSectionProps {
	id?: string;
	className?: string;
}

interface Feature {
	badge: string;
	icon: Parameters<typeof HugeiconsIcon>[0]['icon'];
	title: string;
	description: string;
	bullets: string[];
	visual: React.ReactNode;
	flipped?: boolean;
}

// ─── Feature Visuals ──────────────────────────────────────────────────────────

const WeatherVisual = () => (
	<Card className="w-full overflow-hidden">
		<CardContent className="p-0">
			<div className="flex items-center justify-between border-b border-border px-4 py-3">
				<div>
					<p className="text-sm font-semibold text-foreground">
						Paris, France
					</p>
					<p className="text-xs text-muted-foreground">
						5-day forecast
					</p>
				</div>
				<HugeiconsIcon
					icon={CloudSun}
					className="h-6 w-6 text-warning"
				/>
			</div>
			{[
				{ day: 'Mon', hi: '21°', lo: '14°', rain: false },
				{ day: 'Tue', hi: '23°', lo: '15°', rain: false },
				{ day: 'Wed', hi: '18°', lo: '11°', rain: true },
				{ day: 'Thu', hi: '16°', lo: '10°', rain: true },
				{ day: 'Fri', hi: '20°', lo: '13°', rain: false },
			].map((row) => (
				<div
					key={row.day}
					className="flex items-center gap-3 border-b border-border/50 px-4 py-2.5 last:border-0"
				>
					<span className="w-8 text-xs text-muted-foreground">
						{row.day}
					</span>
					<HugeiconsIcon
						icon={CloudSun}
						className={cn(
							'h-4 w-4',
							row.rain ? 'text-primary' : 'text-warning'
						)}
					/>
					<div className="ms-auto flex gap-3 text-xs">
						<span className="font-medium text-foreground">
							{row.hi}
						</span>
						<span className="text-muted-foreground">{row.lo}</span>
					</div>
				</div>
			))}
			<div className="flex items-start gap-2 bg-primary/5 px-4 py-3">
				<HugeiconsIcon
					icon={AiGenerativeIcon}
					className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
				/>
				<p className="text-xs text-muted-foreground">
					<span className="font-medium text-foreground">Tip:</span>{' '}
					Rain expected Wednesday — pack a waterproof layer.
				</p>
			</div>
		</CardContent>
	</Card>
);

const AiVisual = () => (
	<Card className="w-full overflow-hidden">
		<CardContent className="p-0">
			<div className="flex items-center gap-2 border-b border-border px-4 py-3">
				<span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
					<HugeiconsIcon
						icon={AiGenerativeIcon}
						className="h-3.5 w-3.5 text-primary"
					/>
				</span>
				<span className="text-sm font-semibold text-foreground">
					AI packing list
				</span>
				<Badge className="ms-auto rounded-full bg-success/12 px-2 py-0.5 text-xs font-medium text-success hover:bg-success/20">
					Generated
				</Badge>
			</div>
			{[
				{
					label: 'Lightweight rain jacket',
					category: 'Clothing',
					ai: true,
				},
				{
					label: 'Travel adapter (Type E)',
					category: 'Electronics',
					ai: true,
				},
				{
					label: 'Comfortable walking shoes',
					category: 'Clothing',
					ai: false,
				},
				{
					label: 'Sunscreen SPF 30',
					category: 'Toiletries',
					ai: false,
				},
				{
					label: 'Compact umbrella',
					category: 'Accessories',
					ai: true,
				},
			].map((item) => (
				<div
					key={item.label}
					className="flex items-center gap-3 border-b border-border/50 px-4 py-2.5 last:border-0"
				>
					<HugeiconsIcon
						icon={CheckmarkCircle02Icon}
						className="h-4 w-4 shrink-0 text-muted-foreground/40"
					/>
					<span className="flex-1 text-sm text-foreground">
						{item.label}
					</span>
					<div className="flex items-center gap-1.5">
						{item.ai && (
							<Badge className="rounded-full bg-primary/10 px-1.5 py-0 text-[10px] text-primary hover:bg-primary/15">
								AI pick
							</Badge>
						)}
						<span className="text-xs text-muted-foreground/60">
							{item.category}
						</span>
					</div>
				</div>
			))}
		</CardContent>
	</Card>
);

const ContainerVisual = () => (
	<Card className="w-full overflow-hidden">
		<CardContent className="p-0">
			<div className="border-b border-border px-4 py-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<HugeiconsIcon
							icon={Luggage01Icon}
							className="h-4 w-4 text-primary"
						/>
						<span className="text-sm font-semibold text-foreground">
							Cabin bag · 10 kg limit
						</span>
					</div>
					<Badge className="rounded-full bg-warning/12 text-xs font-medium text-warning-foreground hover:bg-warning/20">
						8.2 / 10 kg
					</Badge>
				</div>
				{/* Weight progress bar — semantic tokens only */}
				<div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
					<div className="h-full w-[82%] rounded-full bg-warning transition-all" />
				</div>
			</div>
			{[
				{ label: 'Clothes (3 days)', weight: '1.8 kg' },
				{ label: 'Laptop + charger', weight: '2.1 kg' },
				{ label: 'Toiletries bag', weight: '0.9 kg' },
				{ label: 'Shoes (1 pair)', weight: '1.2 kg' },
				{ label: 'Books & misc', weight: '2.2 kg' },
			].map((item) => (
				<div
					key={item.label}
					className="flex items-center justify-between border-b border-border/50 px-4 py-2.5 last:border-0"
				>
					<span className="text-sm text-foreground">
						{item.label}
					</span>
					<span className="text-xs tabular-nums text-muted-foreground">
						{item.weight}
					</span>
				</div>
			))}
		</CardContent>
	</Card>
);

// ─── Features data ────────────────────────────────────────────────────────────

const FEATURES: Feature[] = [
	{
		badge: 'Weather-aware',
		icon: CloudSun,
		title: 'Packing that adapts to the forecast',
		description:
			'Stop guessing whether to pack a coat. Beggy pulls live weather data for your exact destination and trip dates, then maps every condition to the right clothing and gear.',
		bullets: [
			'Live 5-day forecast integration',
			'Temperature, rain, and UV-aware suggestions',
			'Automatically updates if weather changes',
		],
		visual: <WeatherVisual />,
		flipped: false,
	},
	{
		badge: 'AI-powered',
		icon: AiGenerativeIcon,
		title: 'A list as smart as a seasoned traveller',
		description:
			"Beggy's AI knows what experienced travellers always bring — and what first-timers always forget. Every suggestion is tuned to your destination, duration, and travel style.",
		bullets: [
			'Destination-specific item suggestions',
			'Learns from your past trips over time',
			'Flags commonly forgotten items',
		],
		visual: <AiVisual />,
		flipped: true,
	},
	{
		badge: 'Container management',
		icon: Luggage01Icon,
		title: 'Never exceed your weight limit again',
		description:
			'Assign items to specific bags or suitcases. Beggy tracks weight and volume against airline limits in real-time, so you know before you reach the check-in desk.',
		bullets: [
			'Per-bag weight and volume tracking',
			'Airline carry-on limit presets',
			'Visual weight distribution overview',
		],
		visual: <ContainerVisual />,
		flipped: false,
	},
];

// ─── FeatureRow ───────────────────────────────────────────────────────────────

const FeatureRow = ({ feature }: { feature: Feature }) => (
	<div
		className={cn(
			'grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16',
			feature.flipped && 'md:[&>*:first-child]:order-2'
		)}
	>
		{/* Copy */}
		<div className="flex flex-col gap-5">
			<Badge
				variant="outline"
				className="w-fit gap-1.5 rounded-full border-primary/25 bg-primary/8 px-3 py-1 text-xs font-medium text-primary"
			>
				<HugeiconsIcon icon={feature.icon} className="h-3.5 w-3.5" />
				{feature.badge}
			</Badge>

			<h3 className="text-2xl font-semibold leading-snug tracking-tight text-foreground md:text-3xl">
				{feature.title}
			</h3>

			<p className="text-base leading-relaxed text-muted-foreground">
				{feature.description}
			</p>

			<ul className="flex flex-col gap-2.5">
				{feature.bullets.map((bullet) => (
					<li key={bullet} className="flex items-start gap-2.5">
						<HugeiconsIcon
							icon={CheckmarkCircle02Icon}
							className="mt-0.5 h-4 w-4 shrink-0 text-success"
						/>
						<span className="text-sm text-muted-foreground">
							{bullet}
						</span>
					</li>
				))}
			</ul>
		</div>

		{/* Visual */}
		<div>{feature.visual}</div>
	</div>
);

// ─── FeaturesSection ──────────────────────────────────────────────────────────

/**
 * FeaturesSection — alternating copy + visual layout for each key feature.
 *
 * Pure Server Component. Uses shadcn Card + Badge throughout.
 * Accepts `id` so HomePage can set id="features" for anchor navigation.
 */
const FeaturesSection = ({ id, className }: FeaturesSectionProps) => (
	<section
		id={id}
		aria-labelledby="features-heading"
		className={cn(
			'border-t border-border bg-muted/20 px-4 py-20 md:px-6 md:py-28',
			className
		)}
	>
		<div className="mx-auto max-w-5xl">
			<div className="mb-16 text-center">
				<p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
					Features
				</p>
				<h2
					id="features-heading"
					className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
				>
					Everything you need to pack perfectly
				</h2>
				<p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
					Built for travellers who are tired of arriving underprepared
					— or paying excess baggage fees.
				</p>
			</div>

			<div className="flex flex-col gap-20 md:gap-28">
				{FEATURES.map((feature) => (
					<FeatureRow key={feature.badge} feature={feature} />
				))}
			</div>
		</div>
	</section>
);

export default FeaturesSection;
