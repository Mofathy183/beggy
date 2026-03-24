import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import CtaSection from './CtaSection';

const meta: Meta<typeof CtaSection> = {
	title: 'Features/Home/Sections/CtaSectionUI',
	component: CtaSection,
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component: `
A pure UI call-to-action section responsible for driving user conversion at the end of a marketing page.

---

### What it is
A visually focused conversion block combining a headline, supporting text, trust signals, and primary/secondary actions.

### When to use it
- At the end of landing pages
- After product value and feature explanation
- Before footer navigation

### When not to use it
- Mid-page interruptions
- Inside authenticated application flows
- As a repeated section within the same page

### Interaction model
- Primary CTA triggers the main conversion action (sign up)
- Secondary CTA supports returning users (login)
- No inline forms or complex interaction patterns

### Constraints
- Must remain visually distinct and centered
- Requires clear hierarchy (headline → actions)
- Content width should remain readable (not too wide)

### Accessibility guarantees
- Semantic <section> with aria-labelledby
- Buttons are keyboard accessible
- Focus states are visible and consistent

### Design-system notes
- Built using Card + Button primitives
- Token-driven styling (no hardcoded values)
- Responsive layout with wrapping CTAs
- Fully dark-mode compatible
`,
			},
		},
	},
	argTypes: {
		onSignUp: {
			action: 'sign up clicked',
			description: 'Triggered when the primary CTA is activated.',
			table: {
				type: { summary: '() => void' },
			},
		},
		onLogin: {
			action: 'login clicked',
			description: 'Triggered when the secondary CTA is activated.',
			table: {
				type: { summary: '() => void' },
			},
		},
		className: {
			control: false,
			table: { disable: true },
		},
	},
};

export default meta;
type Story = StoryObj<typeof CtaSection>;

/**
 * Default conversion state.
 *
 * Displays the CTA section with both actions available and balanced layout.
 */
export const Default: Story = {
	args: {},
	parameters: {
		docs: {
			description: {
				story: 'Primary usage showing the full CTA layout with both actions and trust messaging.',
			},
		},
	},
};

/**
 * Narrow container layout.
 *
 * Tests readability and layout behavior in constrained environments.
 */
export const NarrowContainer: Story = {
	render: (args) => (
		<div className="max-w-2xl mx-auto">
			<CtaSection {...args} />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Validates wrapping behavior, spacing, and CTA alignment under constrained width.',
			},
		},
	},
};

/**
 * Content stress test.
 *
 * Ensures layout stability with longer text content.
 */
export const ContentStress: Story = {
	render: (args) => (
		<div className="[& h2]:max-w-xl [& p]:max-w-md">
			<CtaSection {...args} />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Simulates longer content to verify wrapping, hierarchy, and spacing stability.',
			},
		},
	},
};

/**
 * Dark mode validation.
 *
 * Ensures contrast, visibility, and visual clarity in dark theme.
 */
export const DarkMode: Story = {
	args: {},
	globals: {
		theme: 'dark',
	},
	parameters: {
		docs: {
			description: {
				story: 'Validates contrast, button prominence, and card surface separation in dark mode.',
			},
		},
	},
};
