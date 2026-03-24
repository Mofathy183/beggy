import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import HowItWorksSection from './HowItWorksSection';

const meta: Meta<typeof HowItWorksSection> = {
	title: 'Features/Home/Sections/HowItWorksSection',
	component: HowItWorksSection,
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component: `
A step-by-step explainer section that communicates how the product works through a clear, linear flow.

---

### What it is
A 3-step instructional layout using cards to guide users from input to outcome.

### When to use it
- After introducing product value (post-hero)
- When onboarding needs to be simplified
- To reduce perceived complexity

### When not to use it
- For detailed tutorials or documentation
- Inside authenticated app flows
- When steps exceed 3–4 items

### Interaction model
- No direct interaction
- Content is sequential and scannable
- Visual connectors reinforce flow direction (desktop only)

### Constraints
- Limited to a small number of steps (ideally 3)
- Must maintain clear progression
- Arrows only visible on medium+ screens

### Accessibility guarantees
- Semantic <section> with aria-labelledby
- Logical heading hierarchy
- Readable contrast using design tokens

### Design-system notes
- Uses Card primitives for each step
- Responsive grid (stacked → horizontal)
- Visual connectors enhance flow without breaking layout
- Fully token-driven and dark-mode safe
`,
			},
		},
	},
	argTypes: {
		className: {
			control: false,
			table: { disable: true },
		},
	},
};

export default meta;
type Story = StoryObj<typeof HowItWorksSection>;

/**
 * Default step flow.
 *
 * Displays the full 3-step process with cards and connector arrows on desktop.
 */
export const Default: Story = {
	args: {},
	parameters: {
		docs: {
			description: {
				story: 'Primary usage showing the full step-by-step flow with responsive behavior.',
			},
		},
	},
};

/**
 * Narrow container layout.
 *
 * Tests vertical stacking and readability in constrained environments.
 */
export const NarrowContainer: Story = {
	render: (args) => (
		<div className="max-w-2xl mx-auto">
			<HowItWorksSection {...args} />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Validates vertical stacking of steps and spacing when horizontal layout is not available.',
			},
		},
	},
};

/**
 * Content stress test.
 *
 * Ensures layout holds with longer descriptions.
 */
export const ContentStress: Story = {
	render: (args) => (
		<div className="[& p]:max-w-md">
			<HowItWorksSection {...args} />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Simulates longer descriptions to verify wrapping, spacing, and step clarity.',
			},
		},
	},
};

/**
 * Dark mode validation.
 *
 * Ensures cards, connectors, and icons remain visible and clear.
 */
export const DarkMode: Story = {
	args: {},
	globals: {
		theme: 'dark',
	},
	parameters: {
		docs: {
			description: {
				story: 'Validates contrast, connector visibility, and card surfaces in dark mode.',
			},
		},
	},
};
