import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import HeroUI from './HeroUI';

const meta: Meta<typeof HeroUI> = {
	title: 'Features/Home/Hero/HeroUI',
	component: HeroUI,
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component: `
A marketing hero section used on the homepage to communicate Beggy's core value proposition.

---

### What it is
A high-impact landing section combining headline, supporting copy, CTAs, and a visual mockup.

### When to use it
- Landing pages
- Product introductions
- Campaign entry points

### When not to use it
- Inside dashboards
- As a repeated section within long pages
- For dense or transactional UI

### Interaction model
- Primary CTA triggers the main user journey
- Secondary CTA provides educational context
- No inline form or complex interaction

### Constraints
- Should remain above the fold
- Requires meaningful headline + CTA pairing
- Visual must not overflow small screens

### Accessibility guarantees
- Uses semantic <section> with aria-labelledby
- Focusable buttons with visible focus states
- Text contrast follows design tokens

### Design-system notes
- Token-driven styling (no hardcoded colors)
- Responsive grid layout
- Supports dark mode via tokens
`,
			},
		},
	},
	argTypes: {
		onStartPacking: {
			action: 'start packing',
			description: 'Fires when the primary CTA is clicked.',
			table: {
				type: { summary: '() => void' },
			},
		},
		onSeeHowItWorks: {
			action: 'see how it works',
			description: 'Fires when the secondary CTA is clicked.',
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
type Story = StoryObj<typeof HeroUI>;

/**
 * Default hero state.
 *
 * Represents the primary landing experience with both CTAs available
 * and full visual layout rendered.
 */
export const Default: Story = {
	args: {},
	parameters: {
		docs: {
			description: {
				story: 'Primary hero section as seen on the homepage. Displays full layout, messaging, and CTAs.',
			},
		},
	},
};

/**
 * Narrow container layout.
 *
 * Simulates constrained environments such as smaller laptops or embedded layouts.
 */
export const NarrowContainer: Story = {
	render: (args) => (
		<div className="max-w-3xl mx-auto">
			<HeroUI {...args} />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Tests layout behavior under constrained width. Ensures text wrapping and spacing remain stable.',
			},
		},
	},
};

/**
 * Content stress test.
 *
 * Validates layout resilience with longer text content.
 */
export const ContentStress: Story = {
	render: (args) => (
		<div className="[& h1]:max-w-xl [& p]:max-w-lg">
			<HeroUI {...args} />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Simulates longer content to verify wrapping, spacing, and visual hierarchy under stress.',
			},
		},
	},
};

/**
 * Dark mode validation.
 *
 * Ensures contrast, tokens, and visual clarity in dark theme.
 */
export const DarkMode: Story = {
	args: {},
	globals: {
		theme: 'dark',
	},
	parameters: {
		docs: {
			description: {
				story: 'Validates appearance in dark mode including contrast, glow effects, and visual hierarchy.',
			},
		},
	},
};
