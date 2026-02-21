import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import HeaderUI from './HeaderUI';

const noop = () => {};

const mockProfile = {
	id: 'user-1',
	firstName: 'Mohamed',
	lastName: 'Fathy',
	displayName: 'Mohamed Fathy',
	avatarUrl: '',
	city: 'Cairo',
	country: 'Egypt',
};

const meta: Meta<typeof HeaderUI> = {
	title: 'UI/Layouts/HeaderUI',
	component: HeaderUI,
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component: `
## HeaderUI

### What it is
The persistent application header used across the Beggy app shell.
It provides identity context, global navigation access, and theme control.

### When to use it
- At the top of authenticated app pages.
- On entry points where user identity state must be visible.

### When NOT to use it
- Inside embedded widgets.
- Inside modals or drawers.
- In print-only layouts.

### Interaction model
- Logo navigates to dashboard.
- Theme toggle switches visual theme (injected slot).
- Authenticated users open an avatar-triggered dropdown.
- Guests see “Log in” and “Sign up” CTAs.

### Constraints
- Fixed height (h-16).
- Sticky positioning.
- Frosted glass background.
- Dropdown width constrained for readability.
- Requires injected themeToggle slot.

### Accessibility guarantees
- role="banner"
- Keyboard-navigable dropdown menu
- Visible focus states
- Semantic destructive action styling
- No color-only communication

### Design-system notes
- Token-driven styling only (no hardcoded colors).
- Uses background, border, accent, destructive, and primary tokens.
- Fully dark-mode compatible.
        `,
			},
		},
	},
	argTypes: {
		profile: {
			description:
				'Authenticated user profile. Null renders guest mode with Log in and Sign up.',
			table: {
				type: { summary: 'PublicProfileDTO | null' },
			},
			control: false,
		},
		themeToggle: {
			description:
				'Injected theme toggle component. Header remains presentation-only.',
			table: {
				type: { summary: 'ReactNode' },
			},
			control: false,
		},
		onProfileClick: {
			description: 'Fires when "My Profile" is selected.',
			table: { type: { summary: '() => void' } },
			control: false,
		},
		onSettingsClick: {
			description: 'Fires when "Settings" is selected.',
			table: { type: { summary: '() => void' } },
			control: false,
		},
		onLogout: {
			description: 'Fires when "Log out" is selected.',
			table: { type: { summary: '() => void' } },
			control: false,
		},
		onLoginClick: {
			description: 'Fires when guest clicks Log in.',
			table: { type: { summary: '() => void' } },
			control: false,
		},
		onSignUpClick: {
			description: 'Fires when guest clicks Sign up.',
			table: { type: { summary: '() => void' } },
			control: false,
		},
		className: {
			description: 'Optional additional styling.',
			table: { type: { summary: 'string' } },
			control: false,
		},
	},
};

export default meta;
type Story = StoryObj<typeof HeaderUI>;

/**
 * Authenticated application state.
 *
 * Occurs when:
 * - A valid user session exists.
 *
 * User experience:
 * - Avatar trigger visible.
 * - Name visible on md+.
 * - Dropdown exposes account navigation and logout.
 */
export const Authenticated: Story = {
	args: {
		profile: mockProfile,
		themeToggle: <div className="px-2 text-sm">Theme</div>,
		onProfileClick: noop,
		onSettingsClick: noop,
		onLogout: noop,
	},
	parameters: {
		docs: {
			description: {
				story: 'Standard authenticated header with identity dropdown and account actions.',
			},
		},
	},
};

/**
 * Guest mode.
 *
 * Occurs when:
 * - No active session exists.
 *
 * User experience:
 * - No avatar menu.
 * - Log in (secondary emphasis).
 * - Sign up (primary emphasis).
 */
export const Guest: Story = {
	args: {
		profile: null,
		themeToggle: <div className="px-2 text-sm">Theme</div>,
		onLoginClick: noop,
		onSignUpClick: noop,
	},
	parameters: {
		docs: {
			description: {
				story: 'Guest header state with authentication entry CTAs and clear visual hierarchy.',
			},
		},
	},
};

/**
 * Authenticated state without location metadata.
 *
 * Occurs when:
 * - City or country is missing.
 *
 * User experience:
 * - Identity remains stable.
 * - Location line is omitted without layout shift.
 */
export const AuthenticatedNoLocation: Story = {
	args: {
		profile: {
			...mockProfile,
			city: '',
			country: '',
		},
		themeToggle: <div className="px-2 text-sm">Theme</div>,
		onProfileClick: noop,
		onSettingsClick: noop,
		onLogout: noop,
	},
	parameters: {
		docs: {
			description: {
				story: 'Authenticated header where optional location metadata is absent.',
			},
		},
	},
};

/**
 * Dark mode parity validation.
 *
 * Ensures:
 * - Frosted glass contrast
 * - Border visibility
 * - Primary chip accessibility
 * - Destructive logout clarity
 */
export const DarkMode: Story = {
	args: {
		profile: mockProfile,
		themeToggle: <div className="px-2 text-sm">Theme</div>,
		onProfileClick: noop,
		onSettingsClick: noop,
		onLogout: noop,
	},
	parameters: {
		themes: {
			default: 'dark',
		},
		docs: {
			description: {
				story: 'Dark mode verification ensuring token-based contrast and visual parity.',
			},
		},
	},
};
