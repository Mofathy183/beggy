import useUserMutations from './useUserMutations';

/**
 * Domain-level user actions built on top of mutation hooks.
 *
 * This hook acts as an abstraction layer between UI components
 * and API mutations, providing business-oriented operations.
 *
 * @returns User action handlers and related loading states.
 */
const useUserActions = () => {
	const { updateStatus, deleteUser, states } = useUserMutations();

	/**
	 * Activates a user.
	 * @param id - Unique user identifier.
	 */
	const activate = (id: string) =>
		updateStatus(id, { isActive: true }).unwrap();

	/**
	 * Deactivates a user.
	 * @param id - Unique user identifier.
	 */
	const deactivate = (id: string) =>
		updateStatus(id, { isActive: false }).unwrap();

	/**
	 * Deletes a user permanently.
	 * @param id - Unique user identifier.
	 */
	const remove = (id: string) => deleteUser(id).unwrap();

	return {
		activate,
		deactivate,
		remove,
		isUpdatingStatus: states.updateStatus.isLoading,
		isDeleting: states.deleteUser.isLoading,
	};
};

export default useUserActions;
