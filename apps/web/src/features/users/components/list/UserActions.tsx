import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from '@shadcn-ui/dropdown-menu';

import { Button } from '@shadcn-ui/button';
import {
	MoreVertical,
	Pencil,
	Trash2,
	Eye,
	Shield,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import type { AdminUserDTO } from '@beggy/shared/types';
import useUserActions from '../../hooks/useUserActions';

type UserActionsProps = {
	user: AdminUserDTO;
	onView?: (id: string) => void;
	onEdit?: (id: string) => void;
};

const UserActions = ({ user, onView, onEdit }: UserActionsProps) => {
	const { updateStatus, deleteUser } = useUserActions();

	const handleToggleStatus = () => {
		updateStatus(user.id, { isActive: !user.isActive });
	};

	const handleDelete = () => {
		deleteUser(user.id);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="h-8 w-8">
					<HugeiconsIcon icon={MoreVertical} className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" className="w-44">
				{/* View */}
				<DropdownMenuItem onClick={() => onView?.(user.id)}>
					<HugeiconsIcon icon={Eye} className="mr-2 h-4 w-4" />
					View
				</DropdownMenuItem>

				{/* Edit */}
				<DropdownMenuItem onClick={() => onEdit?.(user.id)}>
					<HugeiconsIcon icon={Pencil} className="mr-2 h-4 w-4" />
					Edit
				</DropdownMenuItem>

				<DropdownMenuSeparator />

				{/* Activate / Deactivate */}
				<DropdownMenuItem onClick={handleToggleStatus}>
					<HugeiconsIcon icon={Shield} className="mr-2 h-4 w-4" />
					{user.isActive ? 'Deactivate' : 'Activate'}
				</DropdownMenuItem>

				<DropdownMenuSeparator />

				{/* Delete */}
				<DropdownMenuItem
					onClick={handleDelete}
					className="text-red-600 focus:text-red-600"
				>
					<HugeiconsIcon icon={Trash2} className="mr-2 h-4 w-4" />
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default UserActions;
