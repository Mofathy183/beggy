import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import NumberRangeFilter from './NumberRangeFilter';

const meta: Meta<typeof NumberRangeFilter> = {
	title: 'UI/Filters/NumberRangeFilter',
	component: NumberRangeFilter,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
A config-driven numeric range filter used in filter panels across the application.

## What it is
A controlled numeric range selector combining:
- Two numeric inputs
- A synchronized range slider
- Optional unit selector (for item weight & volume)

## When to use
Use when filtering datasets by numeric thresholds (weight, volume, quantity, capacity, etc).

## When not to use
Do not use for:
- Single numeric input
- Free-form calculations
- Unit conversion logic

## Interaction model
- Inputs and slider stay synchronized.
- Empty values represent an inactive filter.
- Partial ranges are allowed.
- Values are clamped and normalized before emission.

## Constraints
- Boundaries derive from NUMBER_CONFIG.
- Decimal precision follows domain rules.
- Units are visual-only (no conversion).

## Accessibility guarantees
- Inputs use correct numeric inputMode.
- Slider is keyboard accessible.
- Error state uses destructive token.
- Unit selector uses semantic dropdown patterns.

## Design-system notes
- Token-driven styling.
- Layout adapts when unit selector is present.
- No hardcoded numeric limits.
- Chromatic-stable.
        `,
			},
		},
	},
	argTypes: {
		label: {
			description: 'Visible label describing the metric being filtered.',
			control: 'text',
			table: { type: { summary: 'string' } },
		},
		description: {
			description: 'Optional helper text displayed below the header.',
			control: 'text',
			table: { type: { summary: 'string' } },
		},
		error: {
			description:
				'Validation error message. Triggers destructive styling.',
			control: 'text',
			table: { type: { summary: 'string' } },
		},

		// Hide controlled & domain props
		value: { table: { disable: true } },
		onChange: { table: { disable: true } },
		entity: { table: { disable: true } },
		metric: { table: { disable: true } },
		className: { table: { disable: true } },
	},
};

export default meta;
type Story = StoryObj<typeof NumberRangeFilter>;

type NumberRangeValue = {
	min?: number;
	max?: number;
};

/**
 * Inactive filter state.
 *
 * Occurs before the user sets any numeric boundaries.
 * The filter is visually neutral and emits undefined.
 *
 * This verifies:
 * - Slider spans full domain
 * - Inputs show placeholders
 * - No active constraints applied
 */
export const Inactive: Story = {
	args: {
		label: 'Item Weight',
		entity: 'item',
		metric: 'weight',
		description: 'Filter items by weight range.',
	},
	render: (args) => {
		const [value, setValue] = useState<NumberRangeValue | undefined>();
		return (
			<NumberRangeFilter {...args} value={value} onChange={setValue} />
		);
	},
};

/**
 * Partial range: minimum only.
 *
 * Represents "greater than or equal" filtering.
 * Common in search refinement panels.
 */
export const MinOnly: Story = {
	args: {
		label: 'Item Weight',
		entity: 'item',
		metric: 'weight',
	},
	render: (args) => {
		const [value, setValue] = useState<NumberRangeValue | undefined>({
			min: 2,
		});

		return (
			<NumberRangeFilter {...args} value={value} onChange={setValue} />
		);
	},
};

/**
 * Fully active range.
 *
 * Both boundaries selected.
 * Slider handles reflect constrained range.
 *
 * Most common filtering scenario.
 */
export const FullRange: Story = {
	args: {
		label: 'Item Weight',
		entity: 'item',
		metric: 'weight',
	},
	render: (args) => {
		const [value, setValue] = useState<NumberRangeValue | undefined>({
			min: 1,
			max: 5,
		});

		return (
			<NumberRangeFilter {...args} value={value} onChange={setValue} />
		);
	},
};

/**
 * Integer-only metric.
 *
 * Demonstrates precision rule where decimals = 0.
 * Slider step = 1.
 * Input mode = numeric.
 */
export const IntegerPrecision: Story = {
	args: {
		label: 'Item Quantity',
		entity: 'item',
		metric: 'quantity',
		description: 'Integer-only metric.',
	},
	render: (args) => {
		const [value, setValue] = useState<NumberRangeValue | undefined>({
			min: 5,
			max: 20,
		});

		return (
			<NumberRangeFilter {...args} value={value} onChange={setValue} />
		);
	},
};

/**
 * Unit-aware metric.
 *
 * Displays unit badge and dropdown selector.
 * Unit switching affects UI only.
 */
export const WithUnits: Story = {
	args: {
		label: 'Item Volume',
		entity: 'item',
		metric: 'volume',
		description: 'Supports unit selection.',
	},
	render: (args) => {
		const [value, setValue] = useState<NumberRangeValue | undefined>({
			min: 0.5,
			max: 3,
		});

		return (
			<NumberRangeFilter {...args} value={value} onChange={setValue} />
		);
	},
};

/**
 * Non-item entity.
 *
 * Verifies that unit selector does not render.
 * Ensures config isolation.
 */
export const BagCapacity: Story = {
	args: {
		label: 'Bag Capacity',
		entity: 'bag',
		metric: 'capacity',
	},
	render: (args) => {
		const [value, setValue] = useState<NumberRangeValue | undefined>({
			min: 20,
			max: 80,
		});

		return (
			<NumberRangeFilter {...args} value={value} onChange={setValue} />
		);
	},
};

/**
 * LocalInvalidRange
 *
 * Represents a temporary invalid input state
 * where minimum > maximum.
 *
 * What happens:
 * - Inputs display destructive styling
 * - Slider becomes disabled
 * - No value is emitted
 *
 * This is NOT server validation.
 * This is an interaction safety guard.
 *
 * It prevents accidental invalid filtering
 * while allowing the user to correct the range.
 */
export const LocalInvalidRange: Story = {
	args: {
		label: 'Item Weight',
		entity: 'item',
		metric: 'weight',
	},
	render: (args) => {
		const [value, setValue] = useState<NumberRangeValue | undefined>({
			min: 10,
			max: 5,
		});

		return (
			<NumberRangeFilter {...args} value={value} onChange={setValue} />
		);
	},
	parameters: {
		docs: {
			description: {
				story: 'Demonstrates temporary invalid state where minimum exceeds maximum. Slider is disabled and inputs show destructive styling.',
			},
		},
	},
};

/**
 * Validation error state.
 *
 * Error message provided externally.
 * Destructive styling applied to inputs.
 */
export const ErrorState: Story = {
	args: {
		label: 'Item Weight',
		entity: 'item',
		metric: 'weight',
		error: 'Maximum must be greater than minimum.',
	},
	render: (args) => {
		const [value, setValue] = useState<NumberRangeValue | undefined>({
			min: 10,
			max: 5,
		});

		return (
			<NumberRangeFilter {...args} value={value} onChange={setValue} />
		);
	},
};
/**
 * Dark mode verification.
 *
 * Ensures:
 * - Slider track contrast
 * - Badge visibility
 * - Error token contrast
 * - Dropdown legibility
 */
export const DarkMode: Story = {
	args: {
		label: 'Item Weight',
		entity: 'item',
		metric: 'weight',
	},
	render: (args) => {
		const [value, setValue] = useState<NumberRangeValue | undefined>({
			min: 1,
			max: 5,
		});

		return (
			<div className="dark bg-background p-6">
				<NumberRangeFilter
					{...args}
					value={value}
					onChange={setValue}
				/>
			</div>
		);
	},
	parameters: {
		themes: { default: 'dark' },
	},
};

/**
 * Constrained container.
 *
 * Verifies layout integrity inside narrow filter sidebars.
 */
export const NarrowContainer: Story = {
	args: {
		label: 'Item Weight',
		entity: 'item',
		metric: 'weight',
	},
	render: (args) => {
		const [value, setValue] = useState<NumberRangeValue | undefined>();

		return (
			<div className="w-[280px] border p-4">
				<NumberRangeFilter
					{...args}
					value={value}
					onChange={setValue}
				/>
			</div>
		);
	},
};
