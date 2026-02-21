import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import SidebarUI, { NAV_ITEMS } from './SidebarUI';

const noop = () => {};

const meta: Meta<typeof SidebarUI> = {
	title: 'UI/Layouts/SidebarUI',
	component: SidebarUI,
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component: `
## SidebarUI

### What it is
The persistent dashboard navigation sidebar for the Beggy app shell.

### When to use it
- Inside authenticated dashboard layouts.
- Alongside HeaderUI in the main application shell.

### When NOT to use it
- On marketing pages.
- In modal layouts.
- In embedded widgets.

### Interaction model
- Clicking a nav item navigates to its route.
- Active state reflects currentPath.
- Collapse toggle switches between expanded and icon-only modes.
- Admin group renders only when items exist.

### Constraints
- Width transitions between 240px (expanded) and 64px (collapsed).
- Uses sidebar-specific design tokens only.
- Group labels hidden when collapsed.
- No internal permission logic.

### Accessibility guarantees
- <aside> landmark with aria-label.
- aria-current="page" for active link.
- Collapse button exposes aria-expanded.
- Keyboard navigable.
- Focus ring uses sidebar-ring token.

### Design-system notes
- Sidebar tokens only (bg-sidebar, bg-sidebar-primary, etc.).
- Active state must remain distinguishable in dark mode.
- Collapsed state must preserve icon clarity.
        `,
			},
		},
	},
	argTypes: {
		navItems: {
			description: 'Permission-filtered navigation items to render.',
			table: { type: { summary: 'NavItem[]' } },
			control: false,
		},
		currentPath: {
			description: 'Current route path used to derive active state.',
			table: { type: { summary: 'string' } },
			control: false,
		},
		isCollapsed: {
			description: 'Whether sidebar is in icon-only collapsed state.',
			table: { type: { summary: 'boolean' } },
			control: false,
		},
		onToggleCollapse: {
			description: 'Fires when collapse/expand button is clicked.',
			table: { type: { summary: '() => void' } },
			control: false,
		},
		className: {
			description: 'Optional styling override.',
			table: { type: { summary: 'string' } },
			control: false,
		},
	},
};

export default meta;
type Story = StoryObj<typeof SidebarUI>;

/**
 * Standard expanded dashboard sidebar.
 *
 * Occurs when:
 * - Desktop layout
 * - Default navigation mode
 *
 * User experience:
 * - Group labels visible.
 * - Icons + labels visible.
 * - Active route clearly highlighted.
 */
export const Expanded: Story = {
	args: {
		navItems: NAV_ITEMS,
		currentPath: '/dashboard/bags',
		isCollapsed: false,
		onToggleCollapse: noop,
	},
	parameters: {
		docs: {
			description: {
				story: 'Expanded sidebar with full labels and active state highlighting.',
			},
		},
	},
};

/**
 * Collapsed sidebar state.
 *
 * Occurs when:
 * - User toggles collapse.
 * - Narrow viewport layout.
 *
 * User experience:
 * - Icons remain visible.
 * - Labels hidden.
 * - Group labels replaced with divider lines.
 */
export const Collapsed: Story = {
	render: (args) => {
		const [collapsed, setCollapsed] = useState(true);

		return (
			<SidebarUI
				{...args}
				isCollapsed={collapsed}
				onToggleCollapse={() => setCollapsed((v) => !v)}
			/>
		);
	},
	args: {
		navItems: NAV_ITEMS,
		currentPath: '/dashboard/bags',
	},
	parameters: {
		docs: {
			description: {
				story: 'Icon-only collapsed sidebar with preserved active state visibility.',
			},
		},
	},
};

/**
 * Dashboard root active state.
 *
 * Ensures:
 * - Exact match does not highlight all dashboard routes.
 * - Only /dashboard activates the Dashboard item.
 */
export const DashboardRootActive: Story = {
	args: {
		navItems: NAV_ITEMS,
		currentPath: '/dashboard',
		isCollapsed: false,
		onToggleCollapse: noop,
	},
	parameters: {
		docs: {
			description: {
				story: 'Validates exact-match behavior for the Dashboard root route.',
			},
		},
	},
};

/**
 * No admin group visible.
 *
 * Occurs when:
 * - Current user lacks USER read permission.
 *
 * User experience:
 * - Admin section removed entirely.
 * - Layout remains stable.
 */
export const WithoutAdmin: Story = {
	args: {
		navItems: NAV_ITEMS.filter((i) => i.key !== 'users'),
		currentPath: '/dashboard/items',
		isCollapsed: false,
		onToggleCollapse: noop,
	},
	parameters: {
		docs: {
			description: {
				story: 'Permission-filtered state where admin navigation is absent.',
			},
		},
	},
};

/**
 * Dark mode parity verification.
 *
 * Ensures:
 * - Sidebar-primary contrast remains accessible.
 * - Active state distinguishable.
 * - Hover tokens render correctly.
 */
export const DarkMode: Story = {
	args: {
		navItems: NAV_ITEMS,
		currentPath: '/dashboard/items',
		isCollapsed: false,
		onToggleCollapse: noop,
	},
	parameters: {
		themes: { default: 'dark' },
		docs: {
			description: {
				story: 'Dark mode validation for sidebar token integrity and contrast.',
			},
		},
	},
};
