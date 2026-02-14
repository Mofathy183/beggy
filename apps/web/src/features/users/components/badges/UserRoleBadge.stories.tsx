import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import UserRoleBadge from './UserRoleBadge';
import { Role } from '@beggy/shared/constants';

const meta: Meta<typeof UserRoleBadge> = {
	title: 'Features/Users/UserRoleBadge',
	component: UserRoleBadge,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
UserRoleBadge visually communicates a user's system role.

It provides a consistent, token-driven representation of hierarchy levels
across the application.

### When to use
- User tables
- Profile headers
- Administrative panels
- Audit logs

### When not to use
- As a permission control mechanism
- As the only communication of access level
- Inside editable role selection inputs

### Visual Hierarchy
- ADMIN uses strongest semantic emphasis
- MODERATOR indicates elevated privileges
- MEMBER represents registered participation
- USER represents baseline access

### Accessibility
- Role text is always visible (not color-only)
- Contrast adapts to light/dark mode
- Uses semantic badge markup

### Design-System Notes
- Token-driven color usage
- Outline variant for subtle UI presence
- Uppercase formatting ensures consistency
- Chromatic-safe (no dynamic state)
        `,
			},
		},
	},
	argTypes: {
		role: {
			description: 'System role assigned to the user.',
			control: { type: 'select' },
			options: Object.values(Role),
			table: {
				type: { summary: 'Role' },
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof UserRoleBadge>;

/**
 * Represents highest system-level authority.
 *
 * Used for users with full administrative privileges.
 */
export const Admin: Story = {
	args: {
		role: Role.ADMIN,
	},
	parameters: {
		docs: {
			description: {
				story: 'Strongest semantic emphasis indicating full administrative access.',
			},
		},
	},
};

/**
 * Represents elevated moderation privileges.
 */
export const Moderator: Story = {
	args: {
		role: Role.MODERATOR,
	},
};

/**
 * Represents a registered participant within the system.
 */
export const Member: Story = {
	args: {
		role: Role.MEMBER,
	},
};

/**
 * Represents baseline system access.
 *
 * Uses neutral token styling.
 */
export const User: Story = {
	args: {
		role: Role.USER,
	},
};

/**
 * Verifies color contrast and hierarchy in dark mode.
 */
export const DarkMode: Story = {
	args: {
		role: Role.ADMIN,
	},
	parameters: {
		themes: {
			default: 'dark',
		},
		docs: {
			description: {
				story: 'Ensures semantic color contrast and readability in dark mode.',
			},
		},
	},
};

export const AllRolesOverview: Story = {
	render: () => (
		<div className="flex gap-3">
			<UserRoleBadge role={Role.ADMIN} />
			<UserRoleBadge role={Role.MODERATOR} />
			<UserRoleBadge role={Role.MEMBER} />
			<UserRoleBadge role={Role.USER} />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Side-by-side visual comparison of all role variants.',
			},
		},
	},
};
