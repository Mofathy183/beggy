import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import useRecentItemActions from '../useRecentItemActions';

const pushMock = vi.fn();
const removeMock = vi.fn();
const useItemActionsMock = vi.fn();

vi.mock('next/navigation', () => ({
	useRouter: () => ({
		push: pushMock,
	}),
}));

vi.mock('@features/items/hooks/useItemActions', () => ({
	default: () => useItemActionsMock(),
}));

describe('useRecentItemActions', () => {
	beforeEach(() => {
		vi.clearAllMocks();

		useItemActionsMock.mockReturnValue({
			remove: removeMock,
			isDeleting: false,
		});
	});

	it('navigates to items page from view all', () => {
		const { result } = renderHook(() => useRecentItemActions());

		act(() => {
			result.current.onViewAll();
		});

		expect(pushMock).toHaveBeenCalledWith('/dashboard/items');
	});

	it('navigates to items page from add item', () => {
		const { result } = renderHook(() => useRecentItemActions());

		act(() => {
			result.current.onAddItem();
		});

		expect(pushMock).toHaveBeenCalledWith('/dashboard/items');
	});

	it('navigates to item details page', () => {
		const { result } = renderHook(() => useRecentItemActions());

		act(() => {
			result.current.onEdit('123');
		});

		expect(pushMock).toHaveBeenCalledWith('/dashboard/items/123');
	});

	it('calls remove mutation', () => {
		const { result } = renderHook(() => useRecentItemActions());

		act(() => {
			result.current.onDelete('123');
		});

		expect(removeMock).toHaveBeenCalledWith('123');
	});

	it('returns deleting state', () => {
		useItemActionsMock.mockReturnValue({
			remove: removeMock,
			isDeleting: true,
		});

		const { result } = renderHook(() => useRecentItemActions());

		expect(result.current.isDeleting).toBe(true);
	});

	it('does not navigate when deleting item', () => {
		const { result } = renderHook(() => useRecentItemActions());

		act(() => {
			result.current.onDelete('123');
		});

		expect(pushMock).not.toHaveBeenCalled();
	});
});
