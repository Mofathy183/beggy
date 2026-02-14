import { HugeiconsIcon } from '@hugeicons/react';
import { Pencil, UserCheck, UserX, Trash2 } from '@hugeicons/core-free-icons';

import { type ActionsMenuItem, ActionsMenu } from '@shared/ui/actions';
import { useUserActions } from '@features/users';

type UserActionsProps = {
	userId: string;
	isActive: boolean;
	isCurrentUser?: boolean;
	onEdit?: () => void;
};

const UserActions = ({
	userId,
	isActive,
	isCurrentUser = false,
	onEdit,
}: UserActionsProps) => {
	const { activate, deactivate, remove, isUpdatingStatus, isDeleting } =
		useUserActions();

	const handleToggleStatus = async () => {
		if (isActive) {
			await deactivate(userId);
		} else {
			await activate(userId);
		}
	};

	const handleDelete = async () => {
		await remove(userId);
	};

	const items: ActionsMenuItem[] = [
		...(onEdit
			? [
					{
						id: 'edit',
						label: 'Edit',
						icon: (
							<HugeiconsIcon icon={Pencil} className="h-4 w-4" />
						),
						onSelect: onEdit,
					},
				]
			: []),

		{
			id: 'toggle-status',
			label: isActive ? 'Deactivate' : 'Activate',
			icon: (
				<HugeiconsIcon
					icon={isActive ? UserX : UserCheck}
					className="h-4 w-4"
				/>
			),
			onSelect: handleToggleStatus,
			loading: isUpdatingStatus,
		},

		{
			id: 'delete',
			label: 'Delete',
			icon: <HugeiconsIcon icon={Trash2} className="h-4 w-4" />,
			onSelect: handleDelete,
			variant: 'destructive',
			showSeparatorBefore: true,
			disabled: isCurrentUser,
			loading: isDeleting,
		},
	];

	return <ActionsMenu items={items} />;
};

export default UserActions;
