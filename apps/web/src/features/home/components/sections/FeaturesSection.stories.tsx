import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import FeaturesSection from './FeaturesSection';

const meta: Meta<typeof FeaturesSection> = {
	title: 'Features/Home/Sections/FeaturesSection',
	component: FeaturesSection,
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component: `
A marketing section that explains core product capabilities through alternating copy and visual layouts.

---

### What it is
A structured feature breakdown combining descriptive text, bullet points, and supporting visuals.

### When to use it
- On landing pages to explain product value
- After the hero section
- Before conversion sections (CTA)

### When not to use it
- For dense technical documentation
- Inside dashboards or app UI
- For single-feature highlights

### Interaction model
- No direct interaction
- Content is scannable and vertically structured
- Visuals reinforce understanding, not interaction

### Constraints
- Must maintain alternating layout for readability
- Requires balanced text and visuals
- Should not exceed readable width

### Accessibility guarantees
- Semantic <section> with aria-labelledby
- Proper heading hierarchy
- Readable contrast using tokens

### Design-system notes
- Uses Card and Badge primitives
- Alternating grid layout (responsive)
- Token-based spacing and colors
- Supports dark mode
`,
			},
		},
	},
	argTypes: {
		id: {
			control: 'text',
			description: 'Optional anchor id for navigation.',
			table: {
				type: { summary: 'string' },
			},
		},
		className: {
			control: false,
			table: { disable: true },
		},
	},
};

export default meta;
type Story = StoryObj<typeof FeaturesSection>;

/**
 * Default feature section.
 *
 * Displays all features with alternating layout and full visuals.
 */
export const Default: Story = {
	args: {},
	parameters: {
		docs: {
			description: {
				story: 'Primary feature section used on the homepage to explain key capabilities.',
			},
		},
	},
};

/**
 * Narrow container layout.
 *
 * Tests responsiveness and stacking behavior under constrained width.
 */
export const NarrowContainer: Story = {
	render: (args) => (
		<div className="max-w-3xl mx-auto">
			<FeaturesSection {...args} />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Validates layout stacking and readability on smaller containers.',
			},
		},
	},
};

/**
 * Content stress test.
 *
 * Ensures layout remains stable with longer text and dense content.
 */
export const ContentStress: Story = {
	render: (args) => (
		<div className="[& h3]:max-w-xl [& p]:max-w-lg">
			<FeaturesSection {...args} />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Simulates longer content to test wrapping, spacing, and vertical rhythm.',
			},
		},
	},
};

/**
 * Dark mode validation.
 *
 * Ensures visual clarity, contrast, and token correctness in dark theme.
 */
export const DarkMode: Story = {
	args: {},
	globals: {
		theme: 'dark',
	},
	parameters: {
		docs: {
			description: {
				story: 'Validates contrast, card surfaces, and icon visibility in dark mode.',
			},
		},
	},
};
