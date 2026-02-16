import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from '@shadcn-ui/dropdown-menu';

import { Button } from '@shadcn-ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { MoreVertical } from '@hugeicons/core-free-icons';
import { Fragment, type ReactNode } from 'react';
import { cn } from '@shared/lib/utils';

/**
 * Represents a single action inside the `ActionsMenu`.
 */
export type ActionsMenuItem = {
	/** Unique identifier for stable rendering. */
	id: string;

	/** Display label for the action. */
	label: string;

	/** Optional icon rendered before the label. */
	icon?: ReactNode;

	/** Invoked when the action is selected. */
	onSelect: () => void;

	/** Visual intent of the action. */
	variant?: 'default' | 'destructive';

	/** Whether to render a separator before this item. */
	showSeparatorBefore?: boolean;

	/** Disables the action. */
	disabled?: boolean;

	/** Indicates loading state (disables interaction). */
	loading?: boolean;
};

export type ActionsMenuProps = {
	/** List of actions rendered in the menu. */
	items: ActionsMenuItem[];
};

/**
 * Generic contextual actions dropdown.
 *
 * Presentation-only component that renders a standardized
 * “more actions” menu using shadcn primitives.
 *
 * Designed to be reusable across domains (users, posts, etc.)
 * while keeping business logic outside the component.
 */
const ActionsMenu = ({ items }: ActionsMenuProps) => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8"
					aria-label="Open actions menu"
				>
					<HugeiconsIcon icon={MoreVertical} className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" className="w-44">
				{items.map((item) => (
					<Fragment key={item.id}>
						{item.showSeparatorBefore && <DropdownMenuSeparator />}

						<DropdownMenuItem
							disabled={item.disabled || item.loading}
							onSelect={(e) => {
								e.preventDefault();
								item.onSelect();
							}}
							className={cn(
								item.variant === 'destructive' &&
									'text-destructive data-[highlighted]:bg-destructive/10'
							)}
						>
							{item.icon && (
								<span className="mr-2 h-4 w-4">
									{item.icon}
								</span>
							)}
							{item.label}
						</DropdownMenuItem>
					</Fragment>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default ActionsMenu;
