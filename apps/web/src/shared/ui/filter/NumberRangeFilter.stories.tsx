import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import NumberRangeFilter, { type NumberRangeValue } from './NumberRangeFilter';

/**
 * NumberRangeFilter
 *
 * A config-driven numeric range filter primitive.
 *
 * Boundaries, precision rules, and slider limits
 * are derived directly from NUMBER_CONFIG.
 *
 * Storybook documents:
 * - Inactive vs active filter states
 * - Partial boundaries
 * - Integer vs decimal precision
 * - Unit-aware mode
 * - Error state
 *
 * Logic correctness (clamping, normalization)
 * is validated in Vitest.
 */
const meta: Meta<typeof NumberRangeFilter> = {
	title: 'Filters/NumberRangeFilter',
	component: NumberRangeFilter,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
This component derives its numeric boundaries and precision rules
from NUMBER_CONFIG.

The slider and inputs always reflect:
- Minimum (gte)
- Maximum (lte)
- Decimal precision

Storybook demonstrates user-visible behavior,
not domain constants.
        `,
			},
		},
	},
	argTypes: {
		label: { control: 'text' },
		description: { control: 'text' },
		error: { control: 'text' },
		value: { control: false },
		onChange: { control: false },
		entity: { control: false },
		metric: { control: false },
		className: { control: false },
	},
};

export default meta;
type Story = StoryObj<typeof NumberRangeFilter>;

/**
 * Default
 *
 * Represents the baseline, inactive filter state.
 *
 * - No minimum or maximum selected
 * - Filter is considered "not applied"
 * - Slider reflects full domain range
 *
 * This state is important to validate that:
 * - Placeholder UI renders correctly
 * - No badge/active styling is applied
 * - No accidental normalization occurs
 */
export const Default: Story = {
	render: (args) => {
		const [value, setValue] = useState<NumberRangeValue | undefined>(
			undefined
		);

		return (
			<NumberRangeFilter {...args} value={value} onChange={setValue} />
		);
	},
	args: {
		label: 'Item Weight',
		entity: 'item',
		metric: 'weight',
		description: 'Filter items within a weight range.',
	},
	parameters: {
		docs: {
			description: {
				story: 'Baseline inactive state. No boundaries are selected and the filter is considered inactive.',
			},
		},
	},
};

/**
 * WithRangeSelected
 *
 * Fully active filter state with both boundaries selected.
 *
 * - Minimum and maximum defined
 * - Slider handles reflect constrained range
 * - Component is considered active
 *
 * This is the most common real-world usage scenario.
 */
export const WithRangeSelected: Story = {
	render: (args) => {
		const [value, setValue] = useState<NumberRangeValue | undefined>({
			min: 1,
			max: 5,
		});

		return (
			<NumberRangeFilter {...args} value={value} onChange={setValue} />
		);
	},
	args: {
		label: 'Item Weight',
		entity: 'item',
		metric: 'weight',
	},
	parameters: {
		docs: {
			description: {
				story: 'Active filter state where both minimum and maximum values are selected.',
			},
		},
	},
};

/**
 * MinOnly
 *
 * Partial boundary state.
 *
 * - Only minimum is applied
 * - Maximum remains undefined
 * - Filter behaves as "greater than or equal"
 *
 * Validates:
 * - Correct badge state
 * - Slider lower bound constraint
 * - No forced max normalization
 */
export const MinOnly: Story = {
	render: (args) => {
		const [value, setValue] = useState<NumberRangeValue | undefined>({
			min: 2,
		});

		return (
			<NumberRangeFilter {...args} value={value} onChange={setValue} />
		);
	},
	args: {
		label: 'Item Weight',
		entity: 'item',
		metric: 'weight',
	},
	parameters: {
		docs: {
			description: {
				story: 'Partial boundary state where only a minimum value is applied.',
			},
		},
	},
};

/**
 * IntegerPrecision
 *
 * Demonstrates a metric configured with 0 decimal precision.
 *
 * - Inputs enforce integer-only values
 * - Slider step equals 1
 * - Decimal entry is disallowed
 *
 * Ensures NUMBER_CONFIG precision rules are respected
 * in both slider and input fields.
 */
export const IntegerPrecision: Story = {
	render: (args) => {
		const [value, setValue] = useState<NumberRangeValue | undefined>({
			min: 5,
			max: 20,
		});

		return (
			<NumberRangeFilter {...args} value={value} onChange={setValue} />
		);
	},
	args: {
		label: 'Item Quantity',
		entity: 'item',
		metric: 'quantity', // decimals: 0
		description: 'Integer-only metric. Decimal input is not allowed.',
	},
	parameters: {
		docs: {
			description: {
				story: 'Demonstrates integer-only precision. Inputs enforce numeric mode and step = 1.',
			},
		},
	},
};

/**
 * WithUnits
 *
 * Demonstrates unit-aware behavior for supported metrics.
 *
 * - Unit badge is displayed
 * - Dropdown selector is available
 * - Unit switching currently affects UI only
 *
 * Validates:
 * - Conditional rendering logic
 * - Layout consistency with extra controls
 */
export const WithUnits: Story = {
	render: (args) => {
		const [value, setValue] = useState<NumberRangeValue | undefined>({
			min: 0.1,
			max: 2,
		});

		return (
			<NumberRangeFilter {...args} value={value} onChange={setValue} />
		);
	},
	args: {
		label: 'Item Volume',
		entity: 'item',
		metric: 'volume',
		description: 'Unit selector is available for item weight and volume.',
	},
	parameters: {
		docs: {
			description: {
				story: 'Shows unit badge and dropdown selector. Unit switching is currently visual-only.',
			},
		},
	},
};

/**
 * DifferentEntity
 *
 * Demonstrates behavior for a different domain entity.
 *
 * - Uses "bag" instead of "item"
 * - No unit selector rendered
 * - Decimal precision still respected
 *
 * Ensures cross-entity configuration remains isolated
 * and does not leak item-specific logic.
 */
export const DifferentEntity: Story = {
	render: (args) => {
		const [value, setValue] = useState<NumberRangeValue | undefined>({
			min: 20,
			max: 80,
		});

		return (
			<NumberRangeFilter {...args} value={value} onChange={setValue} />
		);
	},
	args: {
		label: 'Bag Capacity',
		entity: 'bag',
		metric: 'capacity',
		description: 'Non-item entity. No unit selector is displayed.',
	},
	parameters: {
		docs: {
			description: {
				story: 'Demonstrates a decimal metric without unit support.',
			},
		},
	},
};

/**
 * ErrorState
 *
 * Demonstrates validation feedback.
 *
 * - Artificially invalid range (min > max)
 * - Error message injected manually
 * - Destructive styling applied
 *
 * Storybook intentionally does NOT test validation logic —
 * that is covered in unit tests.
 *
 * This story verifies:
 * - Error UI rendering
 * - Accessibility feedback
 * - Visual consistency
 */
export const ErrorState: Story = {
	render: (args) => {
		const [value, setValue] = useState<NumberRangeValue | undefined>({
			min: 10,
			max: 5,
		});

		return (
			<NumberRangeFilter {...args} value={value} onChange={setValue} />
		);
	},
	args: {
		label: 'Item Weight',
		entity: 'item',
		metric: 'weight',
		error: 'Maximum must be greater than minimum.',
	},
	parameters: {
		docs: {
			description: {
				story: 'Displays validation error state. Inputs show destructive styling and message.',
			},
		},
	},
};
