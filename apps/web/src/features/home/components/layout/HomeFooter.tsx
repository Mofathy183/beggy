import { HugeiconsIcon } from '@hugeicons/react';
import { Luggage01Icon } from '@hugeicons/core-free-icons';
import { Separator } from '@shadcn-ui/separator';
import { cn } from '@shadcn-lib';

// ─── Data ─────────────────────────────────────────────────────────────────────

const FOOTER_LINKS = [
	{
		group: 'Product',
		links: [
			{ label: 'How it works', href: '#how-it-works' },
			{ label: 'Features', href: '#features' },
			{ label: 'Sign up free', href: '/signup' },
		],
	},
	{
		group: 'Account',
		links: [
			{ label: 'Log in', href: '/login' },
			{ label: 'Dashboard', href: '/dashboard' },
		],
	},
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * HomeFooter — public homepage footer.
 * Pure Server Component — no hooks, no interactivity.
 * Uses shadcn Separator for the divider. RTL-safe.
 */
const HomeFooter = ({ className }: { className?: string }) => (
	<footer
		aria-label="Site footer"
		className={cn(
			'border-t border-border bg-muted/30',
			'px-4 py-12 md:px-6',
			className
		)}
	>
		<div className="mx-auto max-w-5xl">
			<div className="grid grid-cols-2 gap-8 md:grid-cols-4">
				{/* Brand column */}
				<div className="col-span-2 flex flex-col gap-3 md:col-span-2">
					<a
						href="/"
						aria-label="Beggy — home"
						className="flex w-fit items-center gap-2.5 text-foreground no-underline transition-opacity hover:opacity-75"
					>
						<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
							<HugeiconsIcon
								icon={Luggage01Icon}
								className="h-4 w-4"
							/>
						</span>
						<span className="text-base font-semibold tracking-tight">
							Beggy
						</span>
					</a>
					<p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
						Your AI-powered travel packing assistant. Pack smarter,
						travel lighter, arrive happier.
					</p>
				</div>

				{/* Link columns */}
				{FOOTER_LINKS.map((group) => (
					<div key={group.group} className="flex flex-col gap-3">
						<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
							{group.group}
						</p>
						<ul className="flex flex-col gap-2">
							{group.links.map((link) => (
								<li key={link.href}>
									<a
										href={link.href}
										className={cn(
											'text-sm text-muted-foreground',
											'transition-colors hover:text-foreground',
											'focus-visible:rounded-sm focus-visible:outline-2',
											'focus-visible:outline-ring focus-visible:outline-offset-1'
										)}
									>
										{link.label}
									</a>
								</li>
							))}
						</ul>
					</div>
				))}
			</div>

			<Separator className="my-8" />

			{/* Bottom bar */}
			<div className="flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground md:flex-row">
				<p>© {new Date().getFullYear()} Beggy. Built for travellers.</p>
				<p>MIT License · Mohamed Fathy. Owl inc.</p>
			</div>
		</div>
	</footer>
);

export default HomeFooter;
