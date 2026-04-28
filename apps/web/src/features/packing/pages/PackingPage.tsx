'use client';

import { useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, Backpack01Icon } from '@hugeicons/core-free-icons';
import { Button } from '@shadcn-ui/button';
import { usePackingContext } from '@features/packing/hooks';
import { ContainerDetailPage } from '@features/containers/pages';
import { useGetContainer } from '@features/containers/hooks';
import { ContainerType } from '@beggy/shared/constants';
import { Skeleton } from '@shadcn-ui/skeleton';

// ─── Types ─────────────────────────────────────────────────────────────────────

type PackingPageProps = {
	containerId: string;
};

// ─── Fallback for direct URL navigation ───────────────────────────────────────

/**
 * DirectNavFallback
 *
 * Shown when a user navigates directly to /packing/[containerId]
 * without going through the bag/suitcase detail page.
 *
 * The Redux store has no context in this case.
 * We fetch minimal container state from the API to at least
 * show something useful, but we're missing maxWeight/maxCapacity
 * since those live on BagDTO/SuitcaseDTO, not ContainerStateDTO.
 *
 * Options:
 * A. Redirect to /bags or /suitcases (safest)
 * B. Fetch the bag/suitcase by containerId (requires an API endpoint)
 * C. Show a limited view with a "Go back to set up" prompt
 *
 * We use option A — redirect is the cleanest UX for an edge case.
 */
const DirectNavFallback = ({ onBack }: { onBack: () => void }) => (
	<div className="flex flex-col items-center gap-4 py-20 text-center">
		<div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
			<HugeiconsIcon
				icon={Backpack01Icon}
				className="h-6 w-6 text-muted-foreground"
			/>
		</div>
		<div className="space-y-1">
			<h3 className="text-foreground font-semibold">
				Open this from your bag or suitcase
			</h3>
			<p className="text-muted-foreground max-w-xs text-sm">
				Navigate to a bag or suitcase first, then tap Pack to start
				packing.
			</p>
		</div>
		<Button variant="outline" onClick={onBack}>
			<HugeiconsIcon icon={ArrowLeft01Icon} className="me-2 h-4 w-4" />
			Go to my bags
		</Button>
	</div>
);

// Matches the skeleton in ContainerDetailPage so there's no layout shift
const PackingPageSkeleton = () => (
	<div className="flex flex-col gap-4 p-4">
		<Skeleton className="h-10 w-48 rounded-lg" />
		<Skeleton className="h-40 w-full rounded-xl" />
		<Skeleton className="h-12 w-full rounded-lg" />
		<Skeleton className="h-12 w-full rounded-lg" />
	</div>
);

// ── useSyncExternalStore pattern for client-only guard ───────────────────────
// subscribe is a no-op because this value never changes after mount.
// getServerSnapshot always returns false — server never considers itself mounted.
// getSnapshot returns true — once the client runs JS, it's mounted.
// This is the React-recommended pattern for "is this running on the client?"
// and produces zero ESLint warnings because no setState is called in an effect.
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;
const useIsClient = () =>
	useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * PackingPage
 *
 * @description
 * Client shell for the packing page.
 *
 * Responsibilities:
 * 1. Reads packing context from the Redux store
 *    (set by PackingTabButton before navigation)
 * 2. If no context → shows DirectNavFallback
 * 3. If context exists → renders ContainerDetailPage with all needed props
 * 4. Clears packing context from Redux on unmount
 *
 * The `containerId` from the URL param is also passed as a safety check —
 * if the URL param doesn't match the store context, we treat it as stale.
 */
const PackingPage = ({ containerId }: PackingPageProps) => {
	const router = useRouter();
	const context = usePackingContext();
	const isClient = useIsClient();

	const skipFetch = !isClient || context?.containerId === containerId;

	const { container, isLoading } = useGetContainer(containerId, skipFetch);

	if (!isClient) return <PackingPageSkeleton />;

	// Fast path — Redux context is valid
	if (context?.containerId === containerId) {
		const isBag = context.containerType === ContainerType.BAG;
		return (
			<ContainerDetailPage
				containerId={containerId}
				containerName={context.containerName}
				containerType={context.containerType}
				maxWeight={context.maxWeight}
				maxCapacity={context.maxCapacity}
				weightUnit={context.weightUnit}
				capacityUnit={context.capacityUnit}
				backHref={`/${isBag ? 'bags' : 'suitcases'}/${context.sourceId}`}
			/>
		);
	}

	// Fallback path — waiting for API
	if (isLoading) return <PackingPageSkeleton />;

	// Fallback path — API data ready (discriminated union)
	if (container) {
		const isBag = container.type === ContainerType.BAG;
		const dto = container.data; // BagDTO | SuitcaseDTO
		return (
			<ContainerDetailPage
				containerId={containerId}
				containerName={dto.name}
				containerType={container.type}
				maxWeight={dto.maxWeight}
				maxCapacity={dto.maxCapacity}
				backHref={`/${isBag ? 'bags' : 'suitcases'}/${dto.id}`}
			/>
		);
	}

	// True fallback — not found
	return <DirectNavFallback onBack={() => router.push('/bags')} />;
};

export default PackingPage;
