'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, Backpack01Icon } from '@hugeicons/core-free-icons';
import { Button } from '@shadcn-ui/button';
import { useAppDispatch } from '@shared/store/hooks';
import { usePackingContext } from '@features/packing/hooks';
import { clearPackingContext } from '@features/packing/store';
import { ContainerDetailPage } from '@features/container/pages';
import { ContainerType } from '@beggy/shared/constants';

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
			<p className="text-muted-foreground text-sm max-w-xs">
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
	const dispatch = useAppDispatch();
	const context = usePackingContext();

	// ── Clear context on unmount ─────────────────────────────────────────────
	// Prevents stale context if user uses the browser back button and
	// then navigates to a different bag's packing page.
	useEffect(() => {
		return () => {
			dispatch(clearPackingContext());
		};
	}, [dispatch]);

	// ── Context mismatch guard ───────────────────────────────────────────────
	// The URL containerId and the store context containerId must match.
	// If they don't, the user probably navigated directly or the store
	// was cleared — show the fallback.
	const isContextValid =
		context !== null && context.containerId === containerId;

	if (!isContextValid) {
		return <DirectNavFallback onBack={() => router.push('/bags')} />;
	}

	// ── Build back href ──────────────────────────────────────────────────────
	// We know the source because ContainerType is in the context.
	const isBag = context.containerType === ContainerType.BAG;
	const backHref = `/${isBag ? 'bags' : 'suitcases'}/${context.sourceId}`;

	return (
		<ContainerDetailPage
			containerId={containerId}
			containerName={context.containerName}
			containerType={context.containerType}
			maxWeight={context.maxWeight}
			maxCapacity={context.maxCapacity}
			weightUnit={context.weightUnit}
			capacityUnit={context.capacityUnit}
			backHref={backHref}
		/>
	);
};

export default PackingPage;
