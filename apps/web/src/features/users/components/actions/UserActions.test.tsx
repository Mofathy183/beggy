import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

vi.mock('@features/users/hooks/useUserActions', () => ({
	default: vi.fn(),
}));

// 👇 mock ActionsMenu properly
const mockActionsMenu = vi.fn();

vi.mock('@shared/ui/actions', () => ({
	ActionsMenu: (props: any) => {
		mockActionsMenu(props);
		return null;
	},
}));

import useUserActions from '@features/users/hooks/useUserActions';
import UserActions from './UserActions';

describe('UserActions', () => {
	const activate = vi.fn();
	const deactivate = vi.fn();
	const remove = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		(useUserActions as any).mockReturnValue({
			activate,
			deactivate,
			remove,
			isUpdatingStatus: false,
			isDeleting: false,
		});
	});

	it('renders edit action when onEdit is provided', () => {
		render(<UserActions userId="user-1" isActive onEdit={vi.fn()} />);

		const { items } = (mockActionsMenu as any).mock.calls[0][0];

		const editItem = items.find((i: any) => i.id === 'edit');

		expect(editItem).toBeDefined();
		expect(editItem.label).toBe('Edit');
	});

	it('does not render edit action when onEdit is not provided', () => {
		render(<UserActions userId="user-1" isActive />);

		const { items } = (mockActionsMenu as any).mock.calls[0][0];

		const editItem = items.find((i: any) => i.id === 'edit');

		expect(editItem).toBeUndefined();
	});

	it('renders deactivate when user is active', () => {
		render(<UserActions userId="user-1" isActive />);

		const { items } = (mockActionsMenu as any).mock.calls[0][0];

		const toggleItem = items.find((i: any) => i.id === 'toggle-status');

		expect(toggleItem.label).toBe('Deactivate');
	});

	it('renders activate when user is inactive', () => {
		render(<UserActions userId="user-1" isActive={false} />);

		const { items } = (mockActionsMenu as any).mock.calls[0][0];

		const toggleItem = items.find((i: any) => i.id === 'toggle-status');

		expect(toggleItem.label).toBe('Activate');
	});

	it('calls deactivate when toggling active user', async () => {
		render(<UserActions userId="user-1" isActive />);

		const { items } = (mockActionsMenu as any).mock.calls[0][0];

		const toggleItem = items.find((i: any) => i.id === 'toggle-status');

		await toggleItem.onSelect();

		expect(deactivate).toHaveBeenCalledWith('user-1');
	});

	it('calls activate when toggling inactive user', async () => {
		render(<UserActions userId="user-1" isActive={false} />);

		const { items } = (mockActionsMenu as any).mock.calls[0][0];

		const toggleItem = items.find((i: any) => i.id === 'toggle-status');

		await toggleItem.onSelect();

		expect(activate).toHaveBeenCalledWith('user-1');
	});

	it('calls remove when delete action is selected', async () => {
		render(<UserActions userId="user-1" isActive />);

		const { items } = (mockActionsMenu as any).mock.calls[0][0];

		const deleteItem = items.find((i: any) => i.id === 'delete');

		await deleteItem.onSelect();

		expect(remove).toHaveBeenCalledWith('user-1');
	});

	it('disables delete when user is current user', () => {
		render(<UserActions userId="user-1" isActive isCurrentUser />);

		const { items } = (mockActionsMenu as any).mock.calls[0][0];

		const deleteItem = items.find((i: any) => i.id === 'delete');

		expect(deleteItem.disabled).toBe(true);
	});

	it('passes loading state to toggle and delete actions', () => {
		(useUserActions as any).mockReturnValue({
			activate,
			deactivate,
			remove,
			isUpdatingStatus: true,
			isDeleting: true,
		});

		render(<UserActions userId="user-1" isActive />);

		const { items } = (mockActionsMenu as any).mock.calls[0][0];

		const toggleItem = items.find((i: any) => i.id === 'toggle-status');
		const deleteItem = items.find((i: any) => i.id === 'delete');

		expect(toggleItem.loading).toBe(true);
		expect(deleteItem.loading).toBe(true);
	});
});
