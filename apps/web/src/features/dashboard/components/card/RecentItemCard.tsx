'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { PencilEdit01Icon, Delete01Icon } from '@hugeicons/core-free-icons';
import { Button } from '@shadcn-ui/button';
import { Card, CardContent } from '@shadcn-ui/card';
import type { RecentItemDto } from '@beggy/shared/types';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@shadcn-lib';
import { ItemCategoryBadge } from '@features/items/components/badges';
import { ITEM_CATEGORY_OPTIONS } from '@shared-ui/mappers';

interface RecentItemCardProps {
	/**
	 * Item data used to render the card.
	 */
	item: RecentItemDto;

	/**
	 * Triggered when the user requests to edit the item.
	 */
	onEdit: (id: string) => void;

	/**
	 * Triggered when the user requests to delete the item.
	 */
	onDelete: (id: string) => void;
}

/**
 * @description
 * Displays a recent item with its category, creation time, and quick actions.
 *
 * @remarks
 * - Designed for dense layouts (e.g. dashboard grids).
 * - Action buttons are visually hidden until hover to reduce noise.
 * - Gracefully handles unknown categories by omitting the icon.
 */
const RecentItemCard = ({ item, onEdit, onDelete }: RecentItemCardProps) => {
	const relativeDate = formatDistanceToNow(new Date(item.createdAt), {
		addSuffix: true,
	});

	const categoryOption = ITEM_CATEGORY_OPTIONS.find(
		(o) => o.value === item.category
	);

	return (
		<Card
			className={cn(
				'group transition-colors duration-150',
				'hover:border-border/60 hover:bg-accent/20'
			)}
		>
			<CardContent className="flex flex-col p-3">
				{/* Category thumbnail */}
				<div
					className="bg-muted mb-3 flex aspect-square w-full items-center justify-center rounded-md"
					aria-hidden
				>
					{categoryOption?.icon && (
						<HugeiconsIcon
							icon={categoryOption.icon}
							className="text-muted-foreground h-7 w-7"
						/>
					)}
				</div>

				{/* Name */}
				<p className="text-foreground truncate text-sm font-medium">
					{item.name}
				</p>

				{/* Category badge */}
				<div className="mt-1.5">
					<ItemCategoryBadge category={item.category} size="sm" />
				</div>

				{/* Date */}
				<p className="text-muted-foreground mt-1.5 text-[11px]">
					Added {relativeDate}
				</p>

				{/* Quick actions — revealed on hover */}
				<div
					className={cn(
						'mt-2 flex justify-end gap-1',
						'opacity-0 transition-opacity duration-150',
						'group-hover:opacity-100'
					)}
				>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => onEdit(item.id)}
						aria-label={`Edit ${item.name}`}
						className={cn(
							'h-6 w-6',
							'text-muted-foreground hover:text-foreground hover:bg-accent'
						)}
					>
						<HugeiconsIcon
							icon={PencilEdit01Icon}
							className="h-3 w-3"
						/>
					</Button>

					<Button
						variant="ghost"
						size="icon"
						onClick={() => onDelete(item.id)}
						aria-label={`Delete ${item.name}`}
						className={cn(
							'h-6 w-6',
							'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
						)}
					>
						<HugeiconsIcon
							icon={Delete01Icon}
							className="h-3 w-3"
						/>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};

export default RecentItemCard;
