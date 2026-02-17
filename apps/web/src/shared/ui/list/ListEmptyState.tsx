import { Card, CardContent } from '@shadcn-ui/card';
import { Button } from '@shadcn-ui/button';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { InboxIcon } from '@hugeicons/core-free-icons';
import { cn } from '@shadcn-lib';

type ListEmptyStateProps = {
	/**
	 * Title shown in the empty state.
	 */
	title: string;

	/**
	 * Optional description below title.
	 */
	description?: string;

	/**
	 * Optional custom icon.
	 * Defaults to InboxIcon.
	 */
	icon?: IconSvgElement;

	/**
	 * Optional action (reset filters, create item, etc.)
	 */
	action?: {
		label: string;
		onClick: () => void;
	};

	/**
	 * Optional additional class names.
	 */
	className?: string;
};

const ListEmptyState = ({
	title,
	description,
	icon = InboxIcon,
	action,
	className,
}: ListEmptyStateProps) => {
	return (
		<Card className={cn('w-full', className)}>
			<CardContent className="flex flex-col items-center gap-4 py-12 text-center">
				<div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
					<HugeiconsIcon
						icon={icon}
						className="h-6 w-6 text-muted-foreground"
					/>
				</div>

				<div className="space-y-1">
					<h3 className="text-lg font-semibold">{title}</h3>

					{description && (
						<p className="text-sm text-muted-foreground">
							{description}
						</p>
					)}
				</div>

				{action && (
					<Button variant="outline" onClick={action.onClick}>
						{action.label}
					</Button>
				)}
			</CardContent>
		</Card>
	);
};

export default ListEmptyState;
