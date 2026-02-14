import {
	useCreateUserMutation,
	useUpdateUserProfileMutation,
	useUpdateUserStatusMutation,
	useChangeUserRoleMutation,
	useDeleteUserByIdMutation,
	useDeleteUsersMutation,
} from '../users.api';

import type {
	CreateUserInput,
	EditProfileInput,
	UpdateStatusInput,
	ChangeRoleInput,
	UserFilterInput,
} from '@beggy/shared/types';

/**
 * Infrastructure-level mutation layer for user operations.
 *
 * This hook wraps RTK Query mutation hooks and:
 * - Normalizes argument signatures
 * - Groups related mutation states
 * - Provides a single access point for user mutations
 *
 * Intended to be consumed by domain hooks (e.g. useUserActions),
 * not directly by UI components.
 */
const useUserMutations = () => {
	const [createUser, createState] = useCreateUserMutation();
	const [updateProfile, updateProfileState] = useUpdateUserProfileMutation();
	const [updateStatus, updateStatusState] = useUpdateUserStatusMutation();
	const [changeRole, changeRoleState] = useChangeUserRoleMutation();
	const [deleteUser, deleteUserState] = useDeleteUserByIdMutation();
	const [deleteUsers, deleteUsersState] = useDeleteUsersMutation();

	return {
		//* Actions */

		/**
		 * Creates a new user.
		 */
		createUser: (body: CreateUserInput) => createUser(body),

		/**
		 * Updates user profile information.
		 */
		updateProfile: (id: string, body: EditProfileInput) =>
			updateProfile({ id, body }),

		/**
		 * Updates user active status.
		 */
		updateStatus: (id: string, body: UpdateStatusInput) =>
			updateStatus({ id, body }),

		/**
		 * Changes user role.
		 */
		changeRole: (id: string, body: ChangeRoleInput) =>
			changeRole({ id, body }),

		/**
		 * Deletes a single user by identifier.
		 */
		deleteUser: (id: string) => deleteUser(id),

		/**
		 * Deletes multiple users using filter criteria.
		 */
		deleteUsers: (filters: UserFilterInput) => deleteUsers(filters),

		//* Mutation States */

		/**
		 * Grouped mutation state objects for UI or domain consumption.
		 */
		states: {
			create: createState,
			updateProfile: updateProfileState,
			updateStatus: updateStatusState,
			changeRole: changeRoleState,
			deleteUser: deleteUserState,
			deleteUsers: deleteUsersState,
		},
	};
};

export default useUserMutations;
