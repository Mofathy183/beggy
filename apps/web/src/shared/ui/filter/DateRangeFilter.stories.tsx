import { useState, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import DateRangeFilter from './DateRangeFilter';

/**
 * DateRangeFilter allows users to filter lists using a start and/or end date.
 *
 * It supports partial ranges, emits `undefined` when empty,
 * and relies on native date inputs for accessibility and mobile-friendly UX.
 */
const meta: Meta<typeof DateRangeFilter> = {
	title: 'Filters/DateRangeFilter',
	component: DateRangeFilter,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
A controlled date range filter used inside list and search filters.

**UX principles**
- Supports partial ranges (from-only or to-only)
- Emits \`undefined\` when no dates are selected
- Uses native date inputs for accessibility and mobile UX
- Validation and error messaging are handled externally
				`,
			},
		},
	},
	argTypes: {
		label: {
			control: 'text',
			description:
				'Visible label describing what date range is being filtered.',
		},
		description: {
			control: 'text',
			description: 'Optional helper text displayed below the inputs.',
		},
		error: {
			control: 'text',
			description: 'Optional validation error message.',
		},
		value: { control: false },
		onChange: { control: false },
	},
};

export default meta;

type Story = StoryObj<typeof DateRangeFilter>;

/**
 * Shared controlled render for all stories.
 */
const Controlled = (args: Story['args']) => {
	const [value, setValue] = useState(args?.value);

	useEffect(() => {
		setValue(args?.value);
	}, [args?.value]);

	return (
		<DateRangeFilter
			{...args}
			label={args?.label ?? 'Date range'}
			value={value}
			onChange={setValue}
		/>
	);
};

/**
 * Default empty state.
 *
 * Used when no date filter has been applied yet.
 */
export const Default: Story = {
	args: {
		label: 'Created at',
	},
	render: Controlled,
	parameters: {
		docs: {
			description: {
				story: `
Initial empty state with no dates selected.

This is the most common state when a user first opens a filter panel.
No filter is applied until at least one date is chosen.
				`,
			},
		},
	},
};

/**
 * Partial range with only a start date.
 *
 * Represents filtering from a given date onward.
 */
export const WithStartDate: Story = {
	args: {
		label: 'Created at',
		value: {
			from: new Date('2024-01-01'),
		},
	},
	render: Controlled,
	parameters: {
		docs: {
			description: {
				story: `
State where only the start date is selected.

This allows users to filter results **from a specific date onward**
without requiring an end date.
				`,
			},
		},
	},
};

/**
 * Full date range selected.
 *
 * Represents filtering between two inclusive dates.
 */
export const WithRange: Story = {
	args: {
		label: 'Created at',
		value: {
			from: new Date('2024-01-01'),
			to: new Date('2024-01-31'),
		},
	},
	render: Controlled,
	parameters: {
		docs: {
			description: {
				story: `
State where both start and end dates are selected.

Used when users want to constrain results to a specific time window.
				`,
			},
		},
	},
};

/**
 * With helper description.
 *
 * Used to explain how the filter behaves or what it affects.
 */
export const WithDescription: Story = {
	args: {
		label: 'Created at',
		description: 'Filters items based on their creation date.',
	},
	render: Controlled,
	parameters: {
		docs: {
			description: {
				story: `
Displays helper text below the inputs.

Use this to clarify what the date range affects or how it is applied.
				`,
			},
		},
	},
};

/**
 * With validation error.
 *
 * Used when external validation fails (e.g. invalid range).
 */
export const WithError: Story = {
	args: {
		label: 'Created at',
		error: 'End date must be after start date.',
		value: {
			from: new Date('2024-02-01'),
			to: new Date('2024-01-01'),
		},
	},
	render: Controlled,
	parameters: {
		docs: {
			description: {
				story: `
Error state displayed when the provided date range is invalid.

Validation is handled externally (e.g. Zod or server-side),
and the error message is rendered for clear user feedback.
				`,
			},
		},
	},
};
