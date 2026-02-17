import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import ToggleFilter from './ToggleFilter';

/**
 * Storybook configuration for ToggleFilter.
 *
 * A tri-state segmented control used for boolean filtering in
 * data-heavy interfaces. Designed to align with backend query
 * schemas expecting `boolean | undefined`.
 */
const meta: Meta<typeof ToggleFilter> = {
	title: 'UI/Filters/ToggleFilter',
	component: ToggleFilter,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
Tri-state segmented toggle for boolean filtering.

---

## What it is

A compact segmented control representing:

- **All** → no filtering (undefined)
- **Yes** → true
- **No** → false

It visually communicates filter state while maintaining alignment
with backend schemas that expect \`boolean | undefined\`.

---

## When to use it

- Admin dashboards
- Data tables
- Filtering toolbars
- Boolean query parameters

---

## When not to use it

- Binary toggles that represent immediate state mutation (use Switch instead)
- Multi-select filtering
- Non-boolean domain modeling

---

## Interaction model

- Single selection at a time
- Keyboard navigable (arrow keys + tab)
- Clicking an option updates the selected state
- Always one value active

---

## Constraints

- Exactly three states
- Must remain horizontally grouped
- Designed for compact toolbar usage

---

## Accessibility guarantees

- Built on Radix ToggleGroup
- Fully keyboard navigable
- Visible focus states
- Semantic pressed state
- No color-only meaning

---

## Design-system notes

- Token-driven colors (bg-muted, bg-accent, border-border)
- Variant-free: fixed compact density
- Dark-mode compatible
- Chromatic-stable
        `,
			},
		},
	},
	argTypes: {
		label: {
			description: 'Optional label displayed above the toggle group.',
			control: 'text',
			table: {
				type: { summary: 'string' },
			},
		},
		showIcons: {
			description:
				'Displays contextual icons inside each segment. Recommended for dashboard contexts.',
			control: 'boolean',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},
		className: {
			description: 'Optional additional class names.',
			control: false,
			table: {
				type: { summary: 'string' },
			},
		},

		// Controlled props are intentionally hidden
		value: { table: { disable: true } },
		onChange: { table: { disable: true } },
	},
};

export default meta;
type Story = StoryObj<typeof ToggleFilter>;

/**
 * Default filtering state.
 *
 * Occurs when no filter is applied and the dataset
 * is shown without boolean restriction.
 */
export const Default: Story = {
	args: {
		label: 'Active Status',
		showIcons: false,
	},
	render: (args) => {
		const [value, setValue] = useState<boolean | undefined>(undefined);

		return <ToggleFilter {...args} value={value} onChange={setValue} />;
	},
	parameters: {
		docs: {
			description: {
				story: 'Represents the neutral filtering state where no boolean constraint is applied.',
			},
		},
	},
};

/**
 * Filtering by true values.
 *
 * Occurs when the user restricts the dataset
 * to only positive/active entries.
 */
export const YesSelected: Story = {
	args: {
		label: 'Active Status',
		showIcons: false,
	},
	render: (args) => {
		const [value, setValue] = useState<boolean | undefined>(true);

		return <ToggleFilter {...args} value={value} onChange={setValue} />;
	},
	parameters: {
		docs: {
			description: {
				story: 'Represents the state where only records with true values are shown.',
			},
		},
	},
};

/**
 * Filtering by false values.
 *
 * Occurs when the user restricts the dataset
 * to only negative/inactive entries.
 */
export const NoSelected: Story = {
	args: {
		label: 'Active Status',
		showIcons: false,
	},
	render: (args) => {
		const [value, setValue] = useState<boolean | undefined>(false);

		return <ToggleFilter {...args} value={value} onChange={setValue} />;
	},
	parameters: {
		docs: {
			description: {
				story: 'Represents the state where only records with false values are shown.',
			},
		},
	},
};

/**
 * Icon-enhanced variant.
 *
 * Recommended for dense admin dashboards where
 * quick visual scanning improves recognition.
 */
export const WithIcons: Story = {
	args: {
		label: 'Verified',
		showIcons: true,
	},
	render: (args) => {
		const [value, setValue] = useState<boolean | undefined>(undefined);

		return <ToggleFilter {...args} value={value} onChange={setValue} />;
	},
	parameters: {
		docs: {
			description: {
				story: 'Enhances visual scanning by adding contextual icons to each state.',
			},
		},
	},
};

/**
 * Label-less usage.
 *
 * Used inside compact filter bars where
 * surrounding UI already provides context.
 */
export const WithoutLabel: Story = {
	args: {
		showIcons: false,
	},
	render: (args) => {
		const [value, setValue] = useState<boolean | undefined>(undefined);

		return <ToggleFilter {...args} value={value} onChange={setValue} />;
	},
	parameters: {
		docs: {
			description: {
				story: 'Used when context is provided by surrounding layout and an explicit label is unnecessary.',
			},
		},
	},
};

/**
 * Interactive example.
 *
 * Demonstrates real tri-state behavior:
 * - Only one segment can be active
 * - Selection updates immediately
 * - Fully keyboard navigable
 *
 * This story simulates real usage and exists
 * to visualize interaction behavior.
 */
export const Interactive: Story = {
	args: {
		label: 'Active Status',
		showIcons: true,
	},
	render: (args) => {
		const [value, setValue] = useState<boolean | undefined>(undefined);

		return <ToggleFilter {...args} value={value} onChange={setValue} />;
	},
	parameters: {
		docs: {
			description: {
				story: 'Demonstrates real-time interaction behavior and tri-state selection constraints.',
			},
		},
	},
};

/**
 * Dark mode rendering.
 *
 * Verifies token contrast, border visibility,
 * and active-state clarity in dark theme.
 */
export const DarkMode: Story = {
	args: {
		label: 'Active Status',
		showIcons: true,
	},
	render: (args) => {
		const [value, setValue] = useState<boolean | undefined>(undefined);

		return <ToggleFilter {...args} value={value} onChange={setValue} />;
	},
	parameters: {
		themes: { themeOverride: 'dark' },
		docs: {
			description: {
				story: 'Validates visual parity, contrast ratios, and token consistency in dark mode.',
			},
		},
	},
};
