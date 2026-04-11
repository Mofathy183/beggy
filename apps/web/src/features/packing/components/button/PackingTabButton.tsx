'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { Backpack01Icon, Luggage01Icon } from '@hugeicons/core-free-icons';
import { Button } from '@shadcn-ui/button';
import { cn } from '@shadcn-lib';
import { useAppDispatch } from '@shared/store/hooks';
import {
	setPackingContext,
	type PackingContext,
} from '@features/packing/store';
import { ContainerType } from '@beggy/shared/constants';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type PackingTabButtonProps = {
	/**
	 * The container ID — links to /packing/[containerId].
	 * Must be present on BagDTO / SuitcaseDTO.
	 * Add `containerId: bag.containerId` to your bag and suitcase mappers.
	 */
	containerId: string;

	/** Display name shown in the packing page header */
	containerName: string;

	/** BAG or SUITCASE */
	containerType: ContainerType;

	/** The bag or suitcase's own ID — used for the back-link */
	sourceId: string;

	/** From BagDTO.maxWeight or SuitcaseDTO.maxWeight */
	maxWeight: number;

	/** From BagDTO.maxCapacity or SuitcaseDTO.maxCapacity */
	maxCapacity: number;

	weightUnit?: string;
	capacityUnit?: string;

	onNavigateToPacking: () => void;

	/** Optional — render as a tab-style button (detail page tabs) or a plain action button */
	variant?: 'tab' | 'action';

	className?: string;
};

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * PackingTabButton
 *
 * @description
 * Universal entry point for the packing workspace.
 * Works on both BagDetailsPage and SuitcaseDetailsPage.
 *
 * On click:
 * 1. Dispatches `setPackingContext` to the Redux store —
 *    stores containerName, maxWeight, maxCapacity, etc.
 * 2. Navigates to /packing/[containerId].
 *
 * The packing page reads from the store instead of URL params.
 *
 * @example — BagDetailsPage (action button variant)
 * <PackingTabButton
 *   containerId={bag.containerId}
 *   containerName={bag.name}
 *   containerType={ContainerType.BAG}
 *   sourceId={bag.id}
 *   maxWeight={bag.maxWeight}
 *   maxCapacity={bag.maxCapacity}
 *   variant="action"
 * />
 *
 * @example — Detail page tab row (tab variant)
 * <PackingTabButton
 *   containerId={bag.containerId}
 *   containerName={bag.name}
 *   containerType={ContainerType.BAG}
 *   sourceId={bag.id}
 *   maxWeight={bag.maxWeight}
 *   maxCapacity={bag.maxCapacity}
 *   variant="tab"
 * />
 */
const PackingTabButton = ({
	containerId,
	onNavigateToPacking,
	containerName,
	containerType,
	sourceId,
	maxWeight,
	maxCapacity,
	weightUnit = 'kg',
	capacityUnit = 'L',
	variant = 'action',
	className,
}: PackingTabButtonProps) => {
	const dispatch = useAppDispatch();

	const isBag = containerType === ContainerType.BAG;

	const handleClick = () => {
		const context: PackingContext = {
			containerId,
			containerName,
			containerType,
			sourceId,
			maxWeight,
			maxCapacity,
			weightUnit,
			capacityUnit,
		};

		// Store context in Redux before navigating.
		// The packing page reads from here — no URL params needed.
		dispatch(setPackingContext(context));
		onNavigateToPacking();
	};

	// ── Tab variant — used inside a tab row on the detail page ──────────────
	if (variant === 'tab') {
		return (
			<button
				type="button"
				onClick={handleClick}
				className={cn(
					'inline-flex items-center gap-2 rounded-md px-3 py-1.5',
					'text-sm font-medium transition-colors',
					'text-muted-foreground hover:text-foreground',
					'hover:bg-accent',
					className
				)}
			>
				<HugeiconsIcon
					icon={isBag ? Backpack01Icon : Luggage01Icon}
					className="h-4 w-4"
					aria-hidden="true"
				/>
				Pack
			</button>
		);
	}

	// ── Action variant — used in the header actions row ─────────────────────
	return (
		<Button
			variant="outline"
			size="sm"
			onClick={handleClick}
			className={className}
		>
			<HugeiconsIcon
				icon={isBag ? Backpack01Icon : Luggage01Icon}
				className="me-2 h-4 w-4"
				aria-hidden="true"
			/>
			Pack
		</Button>
	);
};

export default PackingTabButton;
