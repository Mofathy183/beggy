import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import NotFoundState from './NotFoundState';
import { ErrorCode } from '@beggy/shared/constants';

const meta: Meta<typeof NotFoundState> = {
	title: 'UI/States/NotFoundState',
	component: NotFoundState,
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
		/**
		 * Mounts the Next.js App Router context before rendering.
		 * Required because NotFoundState calls useRouter() and usePathname().
		 */
		nextjs: {
			appDirectory: true,
		},
		docs: {
			description: {
				component: `
**NotFoundState** is a branded 404 route-level feedback component.

It uses a boarding-pass visual metaphor to communicate a missing destination
while preserving clarity and accessibility.

---

## What it is
A full-page 404 experience for unresolved routes.

## When to use it
- App Router \`not-found.tsx\`
- Invalid dynamic routes
- Deleted resources
- Broken deep links

## When NOT to use it
- API fetch failures (use ErrorState)
- Permission denial
- Inline empty states

## Interaction Model
- Primary “Go home” action always visible
- Optional “Go back” when navigation history exists
- Route path shown for transparency

## Layout Constraints
- Vertically centered container
- Max width constrained (max-w-sm)
- Ticket layout visually stable
- Fully responsive

## Accessibility
- role="main"
- aria-labelledby linking
- Keyboard navigable buttons
- Decorative elements aria-hidden

## Design System
- Token-driven styling
- shadcn primitives
- Dashed borders reinforce ticket metaphor
- Dark mode safe
        `,
			},
		},
	},
	argTypes: {
		title: {
			description: 'Override the main heading.',
			control: 'text',
			table: { type: { summary: 'string' } },
		},
		description: {
			description: 'Override the explanatory message.',
			control: 'text',
			table: { type: { summary: 'string' } },
		},
		errorCode: {
			description:
				'Optional ErrorCode from @beggy/shared/constants. Use when a specific resource 404s (e.g. BAG_NOT_FOUND). Not needed at the app/not-found.tsx shell level.',
			control: false,
			table: { type: { summary: 'ErrorCode' } },
		},
		backLabel: {
			description: 'Label for the secondary back action.',
			control: 'text',
			table: {
				type: { summary: 'string' },
				defaultValue: { summary: 'Go back' },
			},
		},
		homeLabel: {
			description: 'Label for the primary home action.',
			control: 'text',
			table: {
				type: { summary: 'string' },
				defaultValue: { summary: 'Go home' },
			},
		},
		hideBack: {
			description:
				'Hides the back button. Use when no navigation history exists.',
			control: 'boolean',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},
		onBack: {
			description: 'Triggered when back button is clicked.',
			control: false,
			table: { type: { summary: '() => void' } },
		},
		onHome: {
			description: 'Triggered when home button is clicked.',
			control: false,
			table: { type: { summary: '() => void' } },
		},
	},
};

export default meta;
type Story = StoryObj<typeof NotFoundState>;

/**
 * Standard in-app navigation failure.
 * User can go back or return home.
 */
export const Default: Story = {
	args: {
		onBack: () => {},
		onHome: () => {},
	},
};

/**
 * User entered via broken external link.
 * Back button hidden because history may not exist.
 */
export const TopLevelEntry: Story = {
	args: {
		hideBack: true,
		onHome: () => {},
	},
	parameters: {
		docs: {
			description: {
				story: 'Used in app/not-found.tsx — no navigation history guaranteed.',
			},
		},
	},
};

/**
 * Feature-level 404 — a specific resource was not found.
 * errorCode passed from the API response.
 */
export const ResourceNotFound: Story = {
	name: 'Resource-level 404 (with errorCode)',
	args: {
		title: "We can't find that bag.",
		description: 'This bag may have been deleted or the link is stale.',
		errorCode: ErrorCode.BAG_NOT_FOUND,
		homeLabel: 'My bags',
		onBack: () => {},
		onHome: () => {},
	},
	parameters: {
		docs: {
			description: {
				story: 'Used inside a feature page after an API 404 — passes the specific ErrorCode.',
			},
		},
	},
};

export const CustomCopy: Story = {
	args: {
		title: 'This booking has departed.',
		description:
			'The booking you are looking for no longer exists or has been archived.',
		onBack: () => {},
		onHome: () => {},
	},
};

export const LongContent: Story = {
	args: {
		title: 'This destination appears to have been permanently removed from our scheduling system.',
		description:
			'The page you attempted to reach might have been relocated, renamed, or removed entirely due to an update in our route configuration. Please verify the link or return to the homepage to continue browsing.',
		onBack: () => {},
		onHome: () => {},
	},
};

export const DarkMode: Story = {
	args: {
		onBack: () => {},
		onHome: () => {},
	},
	parameters: {
		themes: { default: 'dark' },
		docs: {
			description: {
				story: 'Validates boarding-pass contrast and readability in dark mode.',
			},
		},
	},
};
