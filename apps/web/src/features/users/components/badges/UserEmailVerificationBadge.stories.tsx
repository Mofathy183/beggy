import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import UserEmailVerificationBadge from './UserEmailVerificationBadge';

const meta: Meta<typeof UserEmailVerificationBadge> = {
	title: 'Features/Users/Badges/UserEmailVerificationBadge',
	component: UserEmailVerificationBadge,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
A contextual status badge indicating whether a user's email address is verified.

### What it is
A compact visual indicator used to communicate email verification status in user lists, profile headers, or admin dashboards.

### When to use it
- In user tables or cards
- In profile overview sections
- Anywhere verification status affects trust or account completeness

### When not to use it
- As a call-to-action
- As a primary notification
- For temporary loading states

### Interaction model
This component is non-interactive.
It communicates state visually and textually.

### Constraints
- Compact size (text-xs)
- Designed for inline usage
- Must remain readable in dense layouts

### Accessibility guarantees
- Status is communicated via text, not color alone
- Sufficient contrast in both light and dark themes
- Does not override semantic structure

### Design-system notes
- Uses outline badge variant
- Token-driven contextual color mapping
- Dark mode color adjustments included
- Deterministic and Chromatic-safe
        `,
			},
		},
	},
	argTypes: {
		isEmailVerified: {
			control: 'boolean',
			description:
				'Indicates whether the user’s email address has been verified.',
			table: {
				type: { summary: 'boolean' },
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof UserEmailVerificationBadge>;

/**
 * Represents a user whose email has been successfully verified.
 *
 * Typically shown after registration confirmation
 * or when viewing an active, trusted account.
 */
export const Verified: Story = {
	args: {
		isEmailVerified: true,
	},
	parameters: {
		docs: {
			description: {
				story: 'Displays the verified status using a success contextual color.',
			},
		},
	},
};

/**
 * Represents a user who has not verified their email address.
 *
 * Common in newly registered accounts or accounts
 * pending confirmation.
 */
export const Unverified: Story = {
	args: {
		isEmailVerified: false,
	},
	parameters: {
		docs: {
			description: {
				story: 'Displays the unverified status using a warning contextual color.',
			},
		},
	},
};

/**
 * Validates token-driven color mapping and contrast
 * in dark theme environments.
 */
export const DarkMode: Story = {
	args: {
		isEmailVerified: true,
	},
	parameters: {
		themes: {
			default: 'dark',
		},
		docs: {
			description: {
				story: 'Dark mode verification ensuring status contrast and readability.',
			},
		},
	},
};
