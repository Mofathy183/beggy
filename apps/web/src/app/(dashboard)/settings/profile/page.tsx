import { Suspense } from 'react';
import { Separator } from '@shared/components/ui/separator';
import { Skeleton } from '@shared/components/ui/skeleton';
import ProfileSettings from '@features/profiles/components/settings/ProfileSettings';

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProfileSettingsPageSkeleton() {
	return (
		<div className="space-y-6">
			{/* Tab triggers */}
			<div className="flex gap-2">
				<Skeleton className="h-9 w-32 rounded-md" />
				<Skeleton className="h-9 w-32 rounded-md" />
			</div>
			{/* Card placeholder */}
			<div className="space-y-4 rounded-xl border border-border bg-card p-6">
				<div className="flex items-start gap-4">
					<Skeleton className="h-20 w-20 rounded-full shrink-0" />
					<div className="flex-1 space-y-2 pt-1">
						<Skeleton className="h-5 w-40" />
						<Skeleton className="h-3.5 w-24" />
						<Skeleton className="h-5 w-16 rounded-full" />
					</div>
				</div>
				<Separator />
				<div className="space-y-3.5">
					{[72, 56, 48].map((w, i) => (
						<div key={i} className="flex items-center gap-3">
							<Skeleton className="h-8 w-8 rounded-lg shrink-0" />
							<div className="space-y-1.5">
								<Skeleton className="h-2.5 w-12" />
								<Skeleton className={`h-3.5 w-${w}`} />
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

/**
 * ProfileSettingsPage
 *
 * Route: /(dashboard)/settings/profile
 *
 * Renders a page header and the ProfileSettingsView tabs component.
 * This page is a Server Component — all client logic lives inside
 * ProfileSettingsView and its children.
 *
 * Intentionally has no logic of its own — it's a layout container.
 */
export default function ProfileSettingsPage() {
	return (
		<div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-8 sm:px-6">
			{/* ── Page header ───────────────────────────────────────────── */}
			<div className="space-y-1">
				<h1 className="text-2xl font-semibold tracking-tight text-foreground">
					Profile
				</h1>
				<p className="text-sm text-muted-foreground">
					Manage your personal details and how you appear to others.
				</p>
			</div>

			<Separator />

			{/* ── Tabs ──────────────────────────────────────────────────── */}
			<Suspense fallback={<ProfileSettingsPageSkeleton />}>
				<ProfileSettings />
			</Suspense>
		</div>
	);
}
