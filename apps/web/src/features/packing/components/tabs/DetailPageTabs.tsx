'use client';

import { cn } from '@shadcn-lib';
import { HugeiconsIcon } from '@hugeicons/react';
import { InformationCircleIcon } from '@hugeicons/core-free-icons';
import { ContainerType } from '@beggy/shared/constants';
import { PackingTabButton } from '@features/packing/components/button';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type DetailPageTab = 'info' | 'packing';

type DetailPageTabsProps = {
	activeTab: DetailPageTab;
	onTabChange: (tab: DetailPageTab) => void;
	onNavigateToPacking: () => void;

	/** Required for wiring PackingTabButton */
	containerId: string;
	containerName: string;
	containerType: ContainerType;
	sourceId: string;
	maxWeight: number;
	maxCapacity: number;
	weightUnit?: string;
	capacityUnit?: string;

	className?: string;
};

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * DetailPageTabs
 *
 * @description
 * Reusable tab row for both BagDetailsPage and SuitcaseDetailsPage.
 *
 * Tabs:
 * - Info tab → stays on the detail page, controlled by parent's activeTab state
 * - Pack tab → dispatches Redux context and navigates to /packing/[containerId]
 *
 * The Pack tab uses PackingTabButton internally so the navigation
 * and context-setting logic is always consistent regardless of which
 * detail page uses this component.
 *
 * @example — BagDetailsPage
 * const [activeTab, setActiveTab] = useState<DetailPageTab>('info');
 *
 * <DetailPageTabs
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 *   containerId={bag.containerId}
 *   containerName={bag.name}
 *   containerType={ContainerType.BAG}
 *   sourceId={bag.id}
 *   maxWeight={bag.maxWeight}
 *   maxCapacity={bag.maxCapacity}
 * />
 */
const DetailPageTabs = ({
	activeTab,
	onTabChange,
	onNavigateToPacking,
	containerId,
	containerName,
	containerType,
	sourceId,
	maxWeight,
	maxCapacity,
	weightUnit,
	capacityUnit,
	className,
}: DetailPageTabsProps) => {
	return (
		<div
			role="tablist"
			aria-label="Detail page sections"
			className={cn(
				'flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1',
				className
			)}
		>
			{/* ── Info tab ───────────────────────────────────────────────── */}
			<button
				type="button"
				role="tab"
				aria-selected={activeTab === 'info'}
				onClick={() => onTabChange('info')}
				className={cn(
					'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5',
					'text-sm font-medium transition-colors',
					activeTab === 'info'
						? 'bg-background text-foreground shadow-sm'
						: 'text-muted-foreground hover:text-foreground hover:bg-background/60'
				)}
			>
				<HugeiconsIcon
					icon={InformationCircleIcon}
					className="h-4 w-4"
					aria-hidden="true"
				/>
				Info
			</button>

			{/* ── Pack tab — navigates away, sets Redux context ──────────── */}
			{/*
			 * PackingTabButton handles its own click logic:
			 * dispatch(setPackingContext) → router.push('/packing/[id]')
			 * We use variant="tab" so it matches the tab pill styling.
			 *
			 * Note: this tab does NOT set activeTab to 'packing' because
			 * it navigates to a different page — there's no "active" state
			 * to show on the detail page once the user has left.
			 */}
			<PackingTabButton
				containerId={containerId}
				onNavigateToPacking={onNavigateToPacking}
				containerName={containerName}
				containerType={containerType}
				sourceId={sourceId}
				maxWeight={maxWeight}
				maxCapacity={maxCapacity}
				weightUnit={weightUnit}
				capacityUnit={capacityUnit}
				variant="tab"
			/>
		</div>
	);
};

export default DetailPageTabs;
