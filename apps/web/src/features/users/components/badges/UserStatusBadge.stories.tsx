import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import UserStatusBadge from './UserStatusBadge';

const meta: Meta<typeof UserStatusBadge> = {
	title: 'Features/Users/Badges/UserStatusBadge',
	component: UserStatusBadge,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
UserStatusBadge visually communicates whether a user account is active.

It provides a lightweight semantic indicator that appears across user lists,
profile views, and administrative dashboards.

### When to use
- User tables
- Profile headers
- Administrative overviews
- Audit logs

### When not to use
- As a toggle or interactive control
- As a permission indicator
- As the only explanation of restricted access

### Visual Meaning
- Active uses success semantic tokens
- Inactive uses neutral-muted tokens
- Outline styling keeps it subtle and non-dominant

### Accessibility
- Text always communicates state
- Not color-dependent
- Dark mode contrast preserved
- No motion or animation

### Design-System Notes
- Token-driven color usage
- Chromatic-stable
- Dark mode supported
- Small density footprint
        `,
			},
		},
	},
	argTypes: {
		isActive: {
			description: 'Determines whether the user account is active.',
			control: 'boolean',
			table: {
				type: { summary: 'boolean' },
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof UserStatusBadge>;

/**
 * Represents a currently active user account.
 *
 * Indicates the account is enabled and operational.
 */
export const Active: Story = {
	args: {
		isActive: true,
	},
	parameters: {
		docs: {
			description: {
				story: 'Displays the success semantic styling to indicate an active account.',
			},
		},
	},
};

/**
 * Represents a disabled or inactive user account.
 *
 * Indicates limited or restricted access.
 */
export const Inactive: Story = {
	args: {
		isActive: false,
	},
	parameters: {
		docs: {
			description: {
				story: 'Uses neutral styling to indicate the account is not currently active.',
			},
		},
	},
};

/**
 * Ensures semantic contrast and readability in dark mode.
 */
export const DarkMode: Story = {
	args: {
		isActive: true,
	},
	parameters: {
		themes: {
			default: 'dark',
		},
		docs: {
			description: {
				story: 'Validates success and muted tokens under dark theme conditions.',
			},
		},
	},
};

export const Overview: Story = {
	render: () => (
		<div className="flex gap-3">
			<UserStatusBadge isActive />
			<UserStatusBadge isActive={false} />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Visual comparison of both status states for hierarchy validation.',
			},
		},
	},
};
