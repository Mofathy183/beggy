import { HugeiconsIcon } from '@hugeicons/react';
import { Pencil, UserCheck, UserX, Trash2 } from '@hugeicons/core-free-icons';

import { type ActionsMenuItem, ActionsMenu } from '@shared/ui/actions';
import { useUserActions } from '@features/users';

/**
 * Props for `UserActions`.
 */
export type UserActionsProps = {
	/** Target user identifier. */
	userId: string;

	/** Current active status of the user. */
	isActive: boolean;

	/** Indicates whether the row represents the authenticated user. */
	isCurrentUser?: boolean;

	/** Optional edit handler. When provided, the edit action is displayed. */
	onEdit?: () => void;
};

/**
 * Users domain actions menu.
 *
 * Composes shared `ActionsMenu` with user-specific operations
 * such as edit, activate/deactivate, and delete.
 *
 * Delegates mutation logic to `useUserActions` and enforces
 * UI-level constraints (e.g., preventing self-deletion).
 */
const UserActions = ({
	userId,
	isActive,
	isCurrentUser = false,
	onEdit,
}: UserActionsProps) => {
	const { activate, deactivate, remove, isUpdatingStatus, isDeleting } =
		useUserActions();

	/**
	 * Toggles the user's active status.
	 */
	const handleToggleStatus = async () => {
		if (isActive) {
			await deactivate(userId);
		} else {
			await activate(userId);
		}
	};

	/**
	 * Deletes the user.
	 */
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
