import Link from 'next/link';
import {
	Luggage01Icon,
	Weather,
	AiMagicIcon,
	CheckmarkSquare01Icon,
	AlertCircleIcon,
} from '@hugeicons/core-free-icons';
import { ErrorCode, ErrorMessages } from '@beggy/shared/constants';
import { HugeiconsIcon } from '@hugeicons/react';
import { Badge } from '@shadcn-ui/badge';
import { Card, CardContent } from '@shadcn-ui/card';
import { Separator } from '@shadcn-ui/separator';
import { Alert, AlertDescription } from '@shadcn-ui/alert';
import { cn } from '@shared/lib/utils';

// ─── Props ────────────────────────────────────────────────────────────────────

type AuthPageLayoutProps = {
	/** Main form content (OAuth buttons, divider, form, etc.) */
	children: React.ReactNode;
	/** Primary heading displayed above the form */
	title: string;
	/** Supporting description below the heading */
	subtitle: string;
	/** Footer navigation (e.g., login ↔ signup switch link) */
	footer: React.ReactNode;

	isOauthError: boolean;
};

// ─── Brand features data ──────────────────────────────────────────────────────

/**
 * Static brand feature metadata rendered inside the brand panel.
 *
 * @remarks
 * Declared as `const` to preserve literal types and prevent mutation.
 */
const BRAND_FEATURES = [
	{
		icon: Weather,
		label: 'Weather-aware packing',
		description: 'Lists tailored to your destination forecast',
	},
	{
		icon: AiMagicIcon,
		label: 'AI recommendations',
		description: 'Powered by Gemini for smarter suggestions',
	},
	{
		icon: CheckmarkSquare01Icon,
		label: 'Organized by bag',
		description: 'Suitcases, carry-ons, and bags in one place',
	},
] as const;

// ─── BrandPanel ───────────────────────────────────────────────────────────────

/**
 * Brand-side marketing panel.
 *
 * @description
 * Desktop-only visual identity section displayed on auth pages.
 * Encapsulates brand messaging, feature highlights, and visual depth elements.
 *
 * @remarks
 * - Hidden on mobile.
 * - Purely presentational (no state, no routing, no side effects).
 * - Uses semantic design tokens only.
 */
const BrandPanel = () => (
	<div
		className={cn(
			'relative hidden lg:flex lg:w-[52%]',
			'flex-col justify-between',
			'bg-primary px-14 py-12',
			'overflow-hidden'
		)}
	>
		{/* ── Background depth elements — tokens only ─────────────── */}

		{/* Ghost luggage — texture, not decoration */}
		<div
			aria-hidden="true"
			className="pointer-events-none absolute -bottom-16 -right-16 opacity-[0.06]"
		>
			<HugeiconsIcon
				icon={Luggage01Icon}
				size={400}
				strokeWidth={0.5}
				className="text-primary-foreground"
			/>
		</div>

		{/* ── Logo ────────────────────────────────────────────────── */}
		<div className="relative z-10 flex items-center gap-3">
			<span
				className={cn(
					'flex h-10 w-10 items-center justify-center',
					'rounded-xl bg-primary-foreground/15',
					'ring-1 ring-primary-foreground/20'
				)}
			>
				<HugeiconsIcon
					icon={Luggage01Icon}
					size={20}
					strokeWidth={1.8}
					className="text-primary-foreground"
				/>
			</span>
			<span className="text-xl font-semibold tracking-tight text-primary-foreground">
				Beggy
			</span>
		</div>

		{/* ── Main brand content ──────────────────────────────────── */}
		<div className="relative z-10 flex flex-col gap-10">
			{/* Headline block */}
			<div className="flex flex-col gap-3">
				<Badge
					variant="secondary"
					className="w-fit border-primary-foreground/20 bg-primary-foreground/15 text-primary-foreground/80 hover:bg-primary-foreground/15"
				>
					Smart packing assistant
				</Badge>
				<h2 className="text-4xl font-semibold leading-[1.15] tracking-tight text-primary-foreground">
					Pack smarter.
					<br />
					Travel lighter.
				</h2>
				<p className="max-w-xs text-sm leading-relaxed text-primary-foreground/65">
					AI-powered packing lists tailored to your destination,
					weather, and travel style — so you never overpack again.
				</p>
			</div>

			{/* Feature cards */}
			<div className="flex flex-col gap-3">
				{BRAND_FEATURES.map((feature) => (
					<Card
						key={feature.label}
						className="border-primary-foreground/15 bg-primary-foreground/8 shadow-none"
					>
						<CardContent className="flex items-start gap-3.5 p-4">
							{/* Icon chip */}
							<span
								className={cn(
									'flex h-9 w-9 shrink-0 items-center justify-center',
									'rounded-lg bg-primary-foreground/12'
								)}
								aria-hidden="true"
							>
								<HugeiconsIcon
									icon={feature.icon}
									size={18}
									strokeWidth={1.8}
									className="text-primary-foreground"
								/>
							</span>

							<div className="flex flex-col gap-0.5">
								<span className="text-sm font-medium text-primary-foreground">
									{feature.label}
								</span>
								<span className="text-xs leading-relaxed text-primary-foreground/60">
									{feature.description}
								</span>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>

		{/* ── Bottom quote ────────────────────────────────────────── */}
		<div className="relative z-10 flex flex-col gap-2">
			<Separator className="bg-primary-foreground/15" />
			<p className="pt-2 text-xs italic leading-relaxed text-primary-foreground/50">
				"The secret of getting ahead is getting started."
				<span className="not-italic font-medium text-primary-foreground/60">
					{' '}
					— Mark Twain
				</span>
			</p>
		</div>
	</div>
);

// ─── AuthPageLayout ───────────────────────────────────────────────────────────

/**
 * Authentication page layout.
 *
 * @description
 * Reusable two-column layout used across all authentication flows
 * (login, signup, reset password, etc.).
 *
 * @remarks
 * - Desktop: brand panel (52%) + form panel (48%).
 * - Mobile: single-column form layout.
 * - Layout-only component (no hooks, no business logic).
 */
const AuthPageLayout = ({
	children,
	title,
	subtitle,
	footer,
	isOauthError = false,
}: AuthPageLayoutProps) => (
	<div className="flex min-h-screen bg-background">
		{/* ── Left: Brand panel — desktop only ─────────────────────── */}
		<BrandPanel />

		{/* ── Right: Form panel ─────────────────────────────────────── */}
		<div
			className={cn(
				'flex w-full flex-col',
				'lg:w-[48%]',
				'items-center justify-center',
				'px-6 py-12 md:px-12'
			)}
		>
			{/* Mobile logo — hidden on lg where BrandPanel shows it */}
			<Link
				href="/"
				aria-label="Beggy home"
				className={cn(
					'mb-10 flex items-center gap-2.5 self-start lg:hidden',
					'text-foreground no-underline',
					'transition-opacity hover:opacity-70',
					'focus-visible:rounded-md focus-visible:outline-2',
					'focus-visible:outline-ring focus-visible:outline-offset-2'
				)}
			>
				<span
					className={cn(
						'flex h-8 w-8 items-center justify-center',
						'rounded-lg bg-primary text-primary-foreground',
						'shadow-sm'
					)}
				>
					<HugeiconsIcon
						icon={Luggage01Icon}
						size={17}
						strokeWidth={1.8}
					/>
				</span>
				<span className="text-lg font-semibold tracking-tight text-foreground">
					Beggy
				</span>
			</Link>

			{/* ── Form container ────────────────────────────────────── */}
			<div className="w-full max-w-[360px]">
				{/* Page heading */}
				<div className="mb-7 flex flex-col gap-1.5">
					<h1 className="text-2xl font-semibold tracking-tight text-foreground">
						{title}
					</h1>
					<p className="text-sm leading-relaxed text-muted-foreground">
						{subtitle}
					</p>
				</div>

				{/* OAuth error — only renders when redirected back from failed OAuth */}
				{isOauthError && (
					<Alert variant="destructive">
						<HugeiconsIcon
							icon={AlertCircleIcon}
							className="h-4 w-4"
						/>
						<AlertDescription>
							{ErrorMessages[ErrorCode.OAUTH_FAILED]}
						</AlertDescription>
					</Alert>
				)}

				{/* Injected content — OAuthButtons + AuthDivider + Form */}
				<div className="flex flex-col gap-5">{children}</div>

				{/* Footer nav — login ↔ signup */}
				<p className="mt-7 text-center text-sm text-muted-foreground">
					{footer}
				</p>
			</div>
		</div>
	</div>
);

export default AuthPageLayout;
