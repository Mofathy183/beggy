import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import ToggleFilter from './ToggleFilter';

/**
 * Storybook configuration for ToggleFilter.
 *
 * Tri-state boolean filter component aligned with backend schemas.
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

### Domain Model

\`boolean | undefined\`

- \`undefined\` → All
- \`true\` → Yes
- \`false\` → No

Designed for data-heavy interfaces where filters must align with backend query schemas.
        `,
			},
		},
	},
	argTypes: {
		label: {
			description: 'Optional label displayed above the toggle group.',
			control: 'text',
		},
		value: {
			description: `
Current filter value.

- true → Yes
- false → No
- undefined → All
      `,
			control: {
				type: 'select',
			},
			options: [undefined, true, false],
		},
		onChange: {
			description: 'Triggered when filter value changes.',
			action: 'filterChanged',
			table: {
				category: 'Events',
			},
		},
		className: {
			description: 'Optional additional class names.',
			control: false,
		},
		showIcons: {
			description: 'Displays a icon when value is not undefined.',
			control: 'boolean',
			defaultValue: false,
		},
	},
};

export default meta;
type Story = StoryObj<typeof ToggleFilter>;

/**
 * Default state (All selected).
 */
export const Default: Story = {
	args: {
		label: 'Active Status',
		value: undefined,
		showIcons: false,
	},
	render: () => {
		const [value, setValue] = useState<boolean | undefined>();

		return (
			<ToggleFilter
				label="Active Status"
				value={value}
				onChange={setValue}
				showIcons
			/>
		);
	},
};

/**
 * Yes selected.
 */
export const YesSelected: Story = {
	args: {
		label: 'Active Status',
		value: true,
	},
};

/**
 * No selected.
 */
export const NoSelected: Story = {
	args: {
		label: 'Active Status',
		value: false,
	},
};

/**
 * With Icon enabled.
 */
export const WithIcon: Story = {
	args: {
		label: 'Verified',
		value: true,
		showIcons: false,
	},
};

/**
 * Without label.
 */
export const WithoutLabel: Story = {
	args: {
		value: undefined,
	},
};

/**
 * Interactive controlled example.
 *
 * Demonstrates real tri-state behavior.
 */
export const Interactive: Story = {
	render: () => {
		const [value, setValue] = useState<boolean | undefined>();

		return (
			<ToggleFilter
				label="Active Status"
				value={value}
				onChange={setValue}
				showIcons
			/>
		);
	},
};
