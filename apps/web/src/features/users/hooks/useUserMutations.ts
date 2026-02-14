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

const useUserMutations = () => {
	const [createUser, createState] = useCreateUserMutation();
	const [updateProfile, updateProfileState] = useUpdateUserProfileMutation();
	const [updateStatus, updateStatusState] = useUpdateUserStatusMutation();
	const [changeRole, changeRoleState] = useChangeUserRoleMutation();
	const [deleteUser, deleteUserState] = useDeleteUserByIdMutation();
	const [deleteUsers, deleteUsersState] = useDeleteUsersMutation();

	return {
		//* actions
		createUser: (body: CreateUserInput) => createUser(body),

		updateProfile: (id: string, body: EditProfileInput) =>
			updateProfile({ id, body }),

		updateStatus: (id: string, body: UpdateStatusInput) =>
			updateStatus({ id, body }),

		changeRole: (id: string, body: ChangeRoleInput) =>
			changeRole({ id, body }),

		deleteUser: (id: string) => deleteUser(id),

		deleteUsers: (filters: UserFilterInput) => deleteUsers(filters),

		//* states
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
