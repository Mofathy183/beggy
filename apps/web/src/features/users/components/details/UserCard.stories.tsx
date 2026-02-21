import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import UserCard from './UserCard';
import type { AdminUserDTO } from '@beggy/shared/types';
import { Role } from '@beggy/shared/constants';

const fixedDate = '2024-01-15T12:00:00.000Z';

const baseUser: AdminUserDTO = {
	id: 'user-1',
	email: 'jane.doe@example.com',
	role: Role.ADMIN,
	isActive: true,
	isEmailVerified: true,
	createdAt: fixedDate,
	updatedAt: new Date().toISOString(),
};

const meta: Meta<typeof UserCard> = {
	title: 'Features/Users/Details/UserCard',
	component: UserCard,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
A domain-level card component displaying a summarized user profile.

### What it is
A compositional card used in user management views to present key identity, role, status, and verification metadata.

### When to use it
- In user grids
- In admin dashboards
- In management interfaces where user state must be quickly scanned

### When not to use it
- For detailed profile pages
- For editable forms
- For minimal inline user references

### Interaction model
- Hover elevates the card
- Contextual actions appear in the header (if enabled)
- Badges visually communicate role and status
- Non-interactive informational sections remain static

### Constraints
- Designed for grid layout usage
- Email is primary identity label
- Dates are formatted consistently
- Actions visibility controlled externally

### Accessibility guarantees
- Semantic text for all status indicators
- Action menu is keyboard accessible
- Does not rely on color alone for meaning
- Maintains readable contrast in dark mode

### Design-system notes
- Composes badge primitives
- Token-driven spacing and typography
- Hover shadow transition
- Deterministic date rendering for visual stability
        `,
			},
		},
	},
	argTypes: {
		user: {
			control: false,
			table: {
				type: { summary: 'AdminUserDTO' },
			},
			description: 'User entity displayed inside the card.',
		},
		isCurrentUser: {
			control: 'boolean',
			description:
				'Indicates whether the rendered user represents the authenticated user.',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},
		showActions: {
			control: 'boolean',
			description:
				'Controls whether contextual user actions are displayed.',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'true' },
			},
		},
		onEdit: {
			control: false,
			table: {
				type: { summary: '() => void' },
			},
			description: 'Optional edit handler for contextual actions.',
		},
	},
};

export default meta;
type Story = StoryObj<typeof UserCard>;

/**
 * Standard active administrative user.
 *
 * Represents a verified, active account
 * with full contextual actions available.
 */
export const Default: Story = {
	args: {
		user: baseUser,
	},
	parameters: {
		docs: {
			description: {
				story: 'Displays a fully active administrative user with actions enabled.',
			},
		},
	},
};

/**
 * Represents a user account that has been deactivated.
 *
 * Status badge reflects inactive state.
 */
export const InactiveUser: Story = {
	args: {
		user: {
			...baseUser,
			isActive: false,
		},
	},
	parameters: {
		docs: {
			description: {
				story: 'Shows how the card communicates inactive account status.',
			},
		},
	},
};

/**
 * Represents a newly registered user
 * whose email has not yet been verified.
 */
export const UnverifiedEmail: Story = {
	args: {
		user: {
			...baseUser,
			isEmailVerified: false,
		},
	},
	parameters: {
		docs: {
			description: {
				story: 'Demonstrates the warning state for unverified email addresses.',
			},
		},
	},
};

/**
 * Represents the currently authenticated user.
 *
 * Some destructive or restricted actions
 * may be limited depending on permission logic.
 */
export const CurrentUser: Story = {
	args: {
		user: baseUser,
		isCurrentUser: true,
	},
	parameters: {
		docs: {
			description: {
				story: 'Simulates rendering the authenticated user card with potential action restrictions.',
			},
		},
	},
};

/**
 * Represents a read-only context,
 * such as public or restricted administrative views.
 */
export const WithoutActions: Story = {
	args: {
		user: baseUser,
		showActions: false,
	},
	parameters: {
		docs: {
			description: {
				story: 'Displays the card without contextual actions in read-only scenarios.',
			},
		},
	},
};

/**
 * Validates visual hierarchy, badge contrast,
 * and hover elevation in dark theme.
 */
export const DarkMode: Story = {
	args: {
		user: baseUser,
	},
	parameters: {
		themes: {
			default: 'dark',
		},
		docs: {
			description: {
				story: 'Dark mode verification ensuring proper contrast and badge clarity.',
			},
		},
	},
};
