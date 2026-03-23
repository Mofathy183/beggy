import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import useItemActions from '@features/items/hooks/useItemActions';

export interface UseRecentItemActionsResult {
	onViewAll: () => void;
	onAddItem: () => void;
	onEdit: (id: string) => void;
	onDelete: (id: string) => void;
	isDeleting: boolean;
}

const ROUTES = {
	items: '/items',
	itemDetail: (id: string) => `/items/${id}`,
};

/**
 * @description
 * Provides navigation and mutation handlers for the Recent Items dashboard section.
 *
 * @remarks
 * - Centralizes routing targets to avoid duplication across components.
 * - Delegates mutations to {@link useItemActions}.
 * - Intentionally excludes side effects (e.g. notifications), which remain the responsibility of the UI layer.
 */
const useRecentItemActions = (): UseRecentItemActionsResult => {
	const router = useRouter();
	const { remove, isDeleting } = useItemActions();

	/**
	 * Navigates to the full items list.
	 */
	const onViewAll = useCallback(() => {
		router.push(ROUTES.items);
	}, [router]);

	/**
	 * Navigates to the item creation flow.
	 *
	 * @remarks
	 * Currently routes to the items page; assumes creation is handled there.
	 */
	const onAddItem = useCallback(() => {
		router.push(ROUTES.items);
	}, [router]);

	/**
	 * Navigates to the item detail/edit page.
	 */
	const onEdit = useCallback(
		(id: string) => {
			router.push(ROUTES.itemDetail(id));
		},
		[router]
	);

	/**
	 * Triggers item deletion.
	 *
	 * @remarks
	 * - Delegates to {@link useItemActions.remove}.
	 * - Error handling and user feedback must be handled by the caller.
	 */
	const onDelete = useCallback((id: string) => remove(id), [remove]);

	return {
		onViewAll,
		onAddItem,
		onEdit,
		onDelete,
		isDeleting,
	};
};

export default useRecentItemActions;
