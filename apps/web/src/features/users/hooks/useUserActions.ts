import useUserMutations from './useUserMutations';

const useUserActions = () => {
	const { updateStatus, deleteUser, states } = useUserMutations();

	const activate = async (id: string) => {
		return updateStatus(id, { isActive: true }).unwrap();
	};

	const deactivate = async (id: string) => {
		return updateStatus(id, { isActive: false }).unwrap();
	};

	const remove = async (id: string) => {
		return deleteUser(id).unwrap();
	};

	return {
		activate,
		deactivate,
		remove,

		isUpdatingStatus: states.updateStatus.isLoading,
		isDeleting: states.deleteUser.isLoading,
	};
};

export default useUserActions;
