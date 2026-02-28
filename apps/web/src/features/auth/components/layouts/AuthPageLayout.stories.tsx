import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import AuthPageLayout from './AuthPageLayout';
import { Button } from '@shadcn-ui/button';
import { Input } from '@shadcn-ui/input';
import { Label } from '@shadcn-ui/label';

const meta: Meta<typeof AuthPageLayout> = {
	title: 'Features/Auth/Layouts/AuthPageLayout',
	component: AuthPageLayout,
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component: `
**AuthPageLayout** is the reusable two-column layout used across all authentication flows.

---

## What it is
A responsive layout that pairs a desktop-only brand panel with a centered form container.

## When to use it
Use for:
- Login
- Signup
- Password reset
- Email verification
- Any unauthenticated entry flow

## When not to use it
Do not use inside authenticated dashboards or onboarding flows.

---

## Interaction model
- Desktop (lg+): Brand panel (52%) + form panel (48%)
- Mobile: Single-column form layout
- Mobile logo appears when brand panel is hidden
- Footer slot supports navigation switching (login ↔ signup)

---

## Constraints
- Form container max width: 360px
- Brand panel hidden on small screens
- Layout owns spacing, not form components
- No business logic inside layout

---

## Accessibility guarantees
- Semantic heading hierarchy (h1)
- Mobile logo is a focusable link
- Focus-visible ring tokens used
- Content remains readable in both columns

---

## Design-system notes
- Token-based spacing and colors
- No hardcoded values
- Responsive via Tailwind breakpoints
- Brand panel uses semantic primary tokens
- Dark-mode compatible
`,
			},
		},
	},
	argTypes: {
		children: { table: { disable: true } },
		footer: { table: { disable: true } },
		title: {
			control: 'text',
			description: 'Primary heading displayed above the form.',
			table: { type: { summary: 'string' } },
		},
		subtitle: {
			control: 'text',
			description: 'Supporting description below the heading.',
			table: { type: { summary: 'string' } },
		},
	},
};

export default meta;

type Story = StoryObj<typeof AuthPageLayout>;

/* -------------------------------------------------------------------------- */
/* Mock Form Content                                                          */
/* -------------------------------------------------------------------------- */

const MockLoginForm = (
	<>
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-1.5">
				<Label>Email</Label>
				<Input type="email" placeholder="you@example.com" />
			</div>

			<div className="flex flex-col gap-1.5">
				<Label>Password</Label>
				<Input type="password" placeholder="••••••••" />
			</div>

			<Button className="w-full">Continue</Button>
		</div>
	</>
);

/* -------------------------------------------------------------------------- */
/* Stories                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Login page layout.
 *
 * Represents the standard login experience.
 * Brand panel visible on desktop.
 * Form panel centered with constrained width.
 */
export const Login: Story = {
	args: {
		title: 'Welcome back',
		subtitle: 'Sign in to continue to your packing dashboard.',
		children: MockLoginForm,
		footer: (
			<>
				Don’t have an account?{' '}
				<a
					href="#"
					className="font-medium text-primary hover:underline"
				>
					Create one
				</a>
			</>
		),
	},
	parameters: {
		docs: {
			description: {
				story: 'Standard login layout pairing brand messaging with credential form.',
			},
		},
	},
};

/**
 * Signup layout variant.
 *
 * Used during account creation.
 * Demonstrates longer subtitle handling and footer switch.
 */
export const Signup: Story = {
	args: {
		title: 'Create your account',
		subtitle:
			'Start building smarter packing lists tailored to your trips.',
		children: MockLoginForm,
		footer: (
			<>
				Already have an account?{' '}
				<a
					href="#"
					className="font-medium text-primary hover:underline"
				>
					Sign in
				</a>
			</>
		),
	},
	parameters: {
		docs: {
			description: {
				story: 'Signup layout showing alternate heading and navigation intent.',
			},
		},
	},
};

/**
 * Dark mode verification.
 *
 * Ensures:
 * - Brand panel primary contrast
 * - Muted foreground legibility
 * - Separator visibility
 * - Token integrity
 */
export const DarkMode: Story = {
	args: {
		title: 'Welcome back',
		subtitle: 'Sign in to continue to your packing dashboard.',
		children: MockLoginForm,
		footer: (
			<>
				Don’t have an account?{' '}
				<a
					href="#"
					className="font-medium text-primary hover:underline"
				>
					Create one
				</a>
			</>
		),
	},
	parameters: {
		layout: 'fullscreen',
		themes: {
			default: 'dark',
		},
		docs: {
			description: {
				story: 'Verifies token contrast, brand panel depth, and readability in dark mode.',
			},
		},
	},
};
