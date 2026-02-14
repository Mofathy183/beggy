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

export type ActionsMenuItem = {
	id: string;
	label: string;
	icon?: ReactNode;
	onSelect: () => void;
	variant?: 'default' | 'destructive';
	showSeparatorBefore?: boolean;
	disabled?: boolean;
	loading?: boolean;
};

type ActionsMenuProps = {
	items: ActionsMenuItem[];
};

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
