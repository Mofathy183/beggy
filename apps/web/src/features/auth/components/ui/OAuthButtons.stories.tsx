import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import OAuthButtons from './OAuthButtons';

const meta: Meta<typeof OAuthButtons> = {
	title: 'Features/Auth/Components/OAuthButtons',
	component: OAuthButtons,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
**OAuthButtons** provides third-party authentication entry points using full-page redirects.

---

### What it is
A vertical stack of OAuth provider buttons (Google, Facebook).

### When to use it
Use alongside login or signup forms to offer social authentication alternatives.

### When not to use it
Do not use inside authenticated areas or profile settings.
Not intended for account linking flows.

---

### Interaction model
- Clicking a button performs a full-page navigation via \`<a href>\`
- No client-side mutation is triggered
- Backend owns OAuth handshake and session issuance
- After redirect, session hydration occurs outside this component

---

### UX constraints
- Buttons are always full-width
- Provider icons are decorative (aria-hidden)
- Button copy adapts to page intent (login vs signup)
- No loading state — redirect is immediate

---

### Accessibility guarantees
- Anchor element ensures proper navigation semantics
- Clear aria-label communicates intent
- Icons are aria-hidden
- Fully keyboard navigable
- Focus state visible via design tokens

---

### Design-system notes
- Uses shadcn Button (outline variant)
- Token-driven hover states (accent / accent-foreground)
- No hardcoded colors
- Dark-mode compatible
`,
			},
		},
	},
	argTypes: {
		mode: {
			control: 'radio',
			options: ['login', 'signup'],
			description: 'Determines button copy to align with page intent.',
			table: {
				type: { summary: `'login' | 'signup'` },
				defaultValue: { summary: 'login' },
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof OAuthButtons>;

/* -------------------------------------------------------------------------- */
/* Stories                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Default login state.
 *
 * Used on the login page to offer social sign-in.
 * Copy communicates continuation of existing account.
 */
export const LoginMode: Story = {
	args: {
		mode: 'login',
	},
	parameters: {
		docs: {
			description: {
				story: 'Displayed on login page. Communicates continuation of an existing account.',
			},
		},
	},
};

/**
 * Signup state.
 *
 * Used on the registration page.
 * Copy communicates account creation via provider.
 */
export const SignupMode: Story = {
	args: {
		mode: 'signup',
	},
	parameters: {
		docs: {
			description: {
				story: 'Displayed on signup page. Communicates account creation via OAuth provider.',
			},
		},
	},
};

/**
 * Dark mode verification.
 *
 * Ensures outline contrast, hover tokens,
 * and icon visibility remain accessible.
 */
export const DarkMode: Story = {
	args: {
		mode: 'login',
	},
	parameters: {
		themes: {
			default: 'dark',
		},
		docs: {
			description: {
				story: 'Verifies token contrast and hover states in dark mode.',
			},
		},
	},
};
