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

// ─── Route constants ───────────────────────────────────────────────────────────
// All dashboard routes are prefixed with /dashboard — matches the
// (protected)/(dashboard)/ route group in the App Router.

const ROUTES = {
	items: '/dashboard/items',
	itemDetail: (id: string) => `/dashboard/items/${id}`,
} as const;

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
	 * Navigates to the items page.
	 *
	 * @remarks
	 * Update to a dedicated /dashboard/items/new route once
	 * the creation flow is moved to its own page.
	 */
	const onAddItem = useCallback(() => {
		router.push(ROUTES.items);
	}, [router]);

	/**
	 * Navigates to the item detail / edit page.
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
	 * Delegates to {@link useItemActions.remove}.
	 * Error handling and user feedback are handled by the caller.
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
