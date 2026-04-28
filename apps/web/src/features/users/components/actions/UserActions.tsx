import {
	Delete02Icon,
	UserCheck01Icon,
	UserMinus01Icon,
	ArrowBigRight,
} from '@hugeicons/core-free-icons';

import { type ActionsMenuItem, ActionsMenu } from '@shared/ui/actions';
import type { AdminUserDTO } from '@beggy/shared/types';

/**
 * Props for `UserActions`.
 */
export type UserActionsProps = {
	user: AdminUserDTO;

	/** Indicates whether the row represents the authenticated user. */
	isCurrentUser?: boolean;
	isUpdatingStatus?: boolean;
	isDeleting?: boolean;

	/** Optional edit handler. When provided, the edit action is displayed. */
	onSelect: (user: AdminUserDTO) => void;
	onToggleStatus: (user: AdminUserDTO) => void;
	onDelete: (user: AdminUserDTO) => void;
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
	user,
	onSelect,
	onToggleStatus,
	onDelete,
	isCurrentUser = false,
	isUpdatingStatus = false,
	isDeleting = false,
}: UserActionsProps) => {
	const items: ActionsMenuItem[] = [
		{
			id: 'open',
			label: 'Open user',
			icon: ArrowBigRight,
			onSelect: () => onSelect(user),
			disabled: isUpdatingStatus || isDeleting,
		},
		{
			id: 'toggle-status',
			label: user.isActive ? 'Deactivate user' : 'Activate user',
			icon: user.isActive ? UserMinus01Icon : UserCheck01Icon,
			onSelect: () => onToggleStatus(user),
			loading: isUpdatingStatus,
			disabled: isCurrentUser || isDeleting,
		},
		{
			id: 'delete',
			label: 'Delete user',
			icon: Delete02Icon,
			onSelect: () => onDelete(user),
			variant: 'destructive',
			showSeparatorBefore: true,
			disabled: isCurrentUser || isUpdatingStatus,
			loading: isDeleting,
		},
	];

	return <ActionsMenu items={items} />;
};

export default UserActions;
