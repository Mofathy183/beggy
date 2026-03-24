import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import SocialProofBar from './SocialProofBar';

const meta: Meta<typeof SocialProofBar> = {
	title: 'Features/Home/Sections/SocialProofBar',
	component: SocialProofBar,
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component: `
A compact social proof strip used to reinforce credibility and trust through key metrics.

---

### What it is
A horizontal bar displaying high-level product statistics with icons and labels.

### When to use it
- Below the hero section
- Before deeper content sections
- To build immediate trust with users

### When not to use it
- As a primary content section
- When real metrics are unavailable
- Inside application dashboards

### Interaction model
- No interaction
- Purely informational and scannable
- Designed for quick visual consumption

### Constraints
- Limited number of stats (ideally 3–4)
- Must remain concise and readable
- Dividers only appear on medium+ screens

### Accessibility guarantees
- Clear text hierarchy (value → label)
- Semantic grouping of stat items
- Sufficient contrast using tokens

### Design-system notes
- Uses Separator for dividers
- Responsive layout (stack → horizontal)
- Icon + value pairing for quick scanning
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
type Story = StoryObj<typeof SocialProofBar>;

/**
 * Default social proof bar.
 *
 * Displays all stats in a horizontal layout with dividers on desktop.
 */
export const Default: Story = {
	args: {},
	parameters: {
		docs: {
			description: {
				story: 'Primary usage showing all key metrics in a clean, horizontally distributed layout.',
			},
		},
	},
};

/**
 * Narrow container layout.
 *
 * Tests stacking behavior and readability in constrained environments.
 */
export const NarrowContainer: Story = {
	render: (args) => (
		<div className="max-w-2xl mx-auto">
			<SocialProofBar {...args} />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Validates vertical stacking and spacing when horizontal layout is not available.',
			},
		},
	},
};

/**
 * Content stress test.
 *
 * Ensures layout stability with longer stat values.
 */
export const ContentStress: Story = {
	render: (args) => (
		<div className="[& span]:tracking-wide">
			<SocialProofBar {...args} />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Simulates longer values to verify spacing, alignment, and readability.',
			},
		},
	},
};

/**
 * Dark mode validation.
 *
 * Ensures contrast, icon visibility, and divider clarity.
 */
export const DarkMode: Story = {
	args: {},
	globals: {
		theme: 'dark',
	},
	parameters: {
		docs: {
			description: {
				story: 'Validates contrast, icon visibility, and divider clarity in dark mode.',
			},
		},
	},
};
