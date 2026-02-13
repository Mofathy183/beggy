import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import DateRangeFilter from './DateRangeFilter';

const meta: Meta<typeof DateRangeFilter> = {
	title: 'UI/Filters/DateRangeFilter',
	component: DateRangeFilter,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
A popover-based date range selector used to filter datasets by a start and/or end date.

## What it is
A controlled filter input that allows selecting:
- Start date only
- End date only
- Full date range
- Or clearing the selection

## When to use
Use when filtering lists, tables, analytics dashboards, or reports by a date interval.

## When not to use
Do not use for single-date selection (use a DatePicker instead).

## Interaction model
- Opens a popover with range calendar.
- Automatically closes when a full range is selected.
- Supports partial ranges.
- Clear removes the filter and emits undefined.
- Apply closes the popover without mutating selection.

## Constraints
- Dates before 1900-01-01 are disabled.
- Future dates are disabled.
- Emits undefined when inactive.

## Accessibility guarantees
- Keyboard navigable popover.
- aria-expanded reflects open state.
- Disabled state is semantic.
- Error text uses destructive token.
- Clear button disabled when inactive.

## Design-system notes
- Uses token-driven styling.
- Active state switches button to secondary variant.
- Fully compatible with dark mode.
- Calendar is Radix-based via shadcn/ui.
        `,
			},
		},
	},
	argTypes: {
		label: {
			description: 'Visible label describing what the filter represents.',
			control: 'text',
			table: {
				type: { summary: 'string' },
			},
		},
		description: {
			description:
				'Helper text displayed when no validation error is present.',
			control: 'text',
			table: {
				type: { summary: 'string' },
			},
		},
		error: {
			description: 'Validation error message shown below the control.',
			control: 'text',
			table: {
				type: { summary: 'string' },
			},
		},
		disabled: {
			description: 'Disables all interaction with the filter.',
			control: 'boolean',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},

		// Never expose controlled props
		value: { table: { disable: true } },
		onChange: { table: { disable: true } },
		className: { table: { disable: true } },
	},
};

export default meta;

type Story = StoryObj<typeof DateRangeFilter>;

type DateRangeValue = {
	from: Date | undefined;

	to?: Date;
};

/**
 * Default inactive state.
 *
 * Occurs when no date filter has been applied yet.
 * The button displays the label and appears in outline style.
 * Clear is disabled and no preview badges are visible.
 */
export const Default: Story = {
	args: {
		label: 'Created Between',
		description: 'Filter results by creation date.',
	},
	render: (args) => {
		const [value, setValue] = useState<DateRangeValue | undefined>(
			undefined
		);

		return <DateRangeFilter {...args} value={value} onChange={setValue} />;
	},
	parameters: {
		docs: {
			description: {
				story: 'Initial inactive state. No filter applied, button uses outline styling.',
			},
		},
	},
};

/**
 * Partial range — start date only.
 *
 * Represents a "from this date onward" filtering scenario.
 * Button switches to active style.
 * Badge preview shows only start date.
 */
export const StartOnly: Story = {
	args: {
		label: 'Created Between',
	},
	render: (args) => {
		const [value, setValue] = useState<DateRangeValue | undefined>({
			from: new Date('2024-01-01'),
		});

		return <DateRangeFilter {...args} value={value} onChange={setValue} />;
	},
	parameters: {
		docs: {
			description: {
				story: 'Active state with only a start date selected. Used for "from X onward" filtering.',
			},
		},
	},
};

/**
 * Full range selection.
 *
 * Common dashboard filtering scenario.
 * Button displays condensed formatted range.
 * Popover auto-closes when both dates selected.
 */
export const FullRange: Story = {
	args: {
		label: 'Created Between',
	},
	render: (args) => {
		const [value, setValue] = useState<DateRangeValue | undefined>({
			from: new Date('2024-01-01'),
			to: new Date('2024-01-15'),
		});

		return <DateRangeFilter {...args} value={value} onChange={setValue} />;
	},
	parameters: {
		docs: {
			description: {
				story: 'Active state with both start and end selected. Most common filtering scenario.',
			},
		},
	},
};

/**
 * Error state.
 *
 * Occurs when validation fails (e.g., invalid range or schema violation).
 * Error message replaces description and uses destructive token.
 */
export const WithError: Story = {
	args: {
		label: 'Created Between',
		error: 'End date must be after start date.',
	},
	render: (args) => {
		const [value, setValue] = useState<DateRangeValue | undefined>({
			from: new Date('2024-01-10'),
			to: new Date('2024-01-01'),
		});

		return <DateRangeFilter {...args} value={value} onChange={setValue} />;
	},
};

/**
 * Disabled state.
 *
 * Used when user lacks permission or filter is temporarily locked.
 * All interactions disabled and button visually muted.
 */
export const Disabled: Story = {
	args: {
		label: 'Created Between',
		disabled: true,
	},
	render: (args) => {
		const [value, setValue] = useState<DateRangeValue | undefined>(
			undefined
		);

		return <DateRangeFilter {...args} value={value} onChange={setValue} />;
	},
};

/**
 * Dark mode verification.
 *
 * Ensures contrast tokens, badges, popover surface,
 * and destructive text remain accessible in dark theme.
 */
export const DarkMode: Story = {
	args: {
		label: 'Created Between',
	},
	render: (args) => {
		const [value, setValue] = useState<DateRangeValue | undefined>({
			from: new Date('2024-01-01'),
			to: new Date('2024-01-20'),
		});

		return (
			<div className="dark bg-background p-6">
				<DateRangeFilter {...args} value={value} onChange={setValue} />
			</div>
		);
	},
	parameters: {
		themes: {
			default: 'dark',
		},
	},
};

/**
 * Narrow container layout.
 *
 * Verifies truncation behavior and layout stability
 * when the filter is placed inside constrained sidebars
 * or filter toolbars.
 *
 * Ensures:
 * - Button text truncates correctly
 * - Icon alignment remains intact
 * - Popover positioning behaves properly
 */
export const NarrowContainer: Story = {
	args: {
		label: 'Created Between',
	},
	render: (args) => {
		const [value, setValue] = useState<DateRangeValue | undefined>({
			from: new Date('2024-01-01'),
			to: new Date('2024-12-31'),
		});

		return (
			<div className="w-[240px] border p-4">
				<DateRangeFilter {...args} value={value} onChange={setValue} />
			</div>
		);
	},
	parameters: {
		docs: {
			description: {
				story: 'Ensures proper truncation and layout behavior when used inside constrained containers such as sidebars or filter bars.',
			},
		},
	},
};
