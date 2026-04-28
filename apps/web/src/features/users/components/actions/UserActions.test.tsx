import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import type { AdminUserDTO } from '@beggy/shared/types';
import { Role } from '@beggy/shared/constants';

const mockActionsMenu = vi.fn();

vi.mock('@shared/ui/actions', () => ({
	ActionsMenu: (props: any) => {
		mockActionsMenu(props);
		return null;
	},
}));

import UserActions from './UserActions';

const mockUser = (override: Partial<AdminUserDTO> = {}): AdminUserDTO => ({
	id: 'user-1',
	email: 'user@email.com',
	role: Role.USER,
	isActive: true,
	isEmailVerified: true,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
	...override,
});

describe('UserActions', () => {
	const onSelect = vi.fn();
	const onToggleStatus = vi.fn();
	const onDelete = vi.fn();

	const renderComponent = (
		props?: Partial<React.ComponentProps<typeof UserActions>>
	) => {
		const user = mockUser(props?.user);

		render(
			<UserActions
				user={user}
				onSelect={onSelect}
				onToggleStatus={onToggleStatus}
				onDelete={onDelete}
				isCurrentUser={false}
				isUpdatingStatus={false}
				isDeleting={false}
				{...props}
			/>
		);

		return (mockActionsMenu.mock as any).calls.at(-1)[0];
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders the correct menu items', () => {
		const { items } = renderComponent();

		expect(items.map((i: any) => i.id)).toEqual([
			'open',
			'toggle-status',
			'delete',
		]);
	});

	it('calls onSelect when open action is triggered', async () => {
		const user = mockUser();
		const { items } = renderComponent({ user });

		const openItem = items.find((i: any) => i.id === 'open');

		await openItem.onSelect();

		expect(onSelect).toHaveBeenCalledWith(user);
	});

	it('calls onToggleStatus when toggling active user', async () => {
		const user = mockUser({ isActive: true });

		const { items } = renderComponent({ user });

		const toggleItem = items.find((i: any) => i.id === 'toggle-status');

		await toggleItem.onSelect();

		expect(onToggleStatus).toHaveBeenCalledWith(user);
	});

	it('calls onToggleStatus when toggling inactive user', async () => {
		const user = mockUser({ isActive: false });

		const { items } = renderComponent({ user });

		const toggleItem = items.find((i: any) => i.id === 'toggle-status');

		await toggleItem.onSelect();

		expect(onToggleStatus).toHaveBeenCalledWith(user);
	});

	it('calls onDelete when delete action is selected', async () => {
		const user = mockUser();

		const { items } = renderComponent({ user });

		const deleteItem = items.find((i: any) => i.id === 'delete');

		await deleteItem.onSelect();

		expect(onDelete).toHaveBeenCalledWith(user);
	});

	it('renders deactivate label when user is active', () => {
		const { items } = renderComponent({
			user: mockUser({ isActive: true }),
		});

		const toggleItem = items.find((i: any) => i.id === 'toggle-status');

		expect(toggleItem.label).toBe('Deactivate user');
	});

	it('renders activate label when user is inactive', () => {
		const { items } = renderComponent({
			user: mockUser({ isActive: false }),
		});

		const toggleItem = items.find((i: any) => i.id === 'toggle-status');

		expect(toggleItem.label).toBe('Activate user');
	});

	it('disables delete when user is current user', () => {
		const { items } = renderComponent({ isCurrentUser: true });

		const deleteItem = items.find((i: any) => i.id === 'delete');

		expect(deleteItem.disabled).toBe(true);
	});

	it('disables toggle when user is current user', () => {
		const { items } = renderComponent({ isCurrentUser: true });

		const toggleItem = items.find((i: any) => i.id === 'toggle-status');

		expect(toggleItem.disabled).toBe(true);
	});

	it('applies loading states correctly', () => {
		const { items } = renderComponent({
			isUpdatingStatus: true,
			isDeleting: true,
		});

		const toggleItem = items.find((i: any) => i.id === 'toggle-status');
		const deleteItem = items.find((i: any) => i.id === 'delete');

		expect(toggleItem.loading).toBe(true);
		expect(deleteItem.loading).toBe(true);
	});

	it('disables actions correctly during loading states', () => {
		const { items } = renderComponent({
			isUpdatingStatus: true,
			isDeleting: true,
		});

		const openItem = items.find((i: any) => i.id === 'open');
		const toggleItem = items.find((i: any) => i.id === 'toggle-status');
		const deleteItem = items.find((i: any) => i.id === 'delete');

		expect(openItem.disabled).toBe(true);
		expect(toggleItem.disabled).toBe(true);
		expect(deleteItem.disabled).toBe(true);
	});
});
