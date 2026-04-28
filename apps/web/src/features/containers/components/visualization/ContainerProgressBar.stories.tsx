import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ContainerProgressBar from './ContainerProgressBar';
import { ContainerStatus } from '@beggy/shared/constants';

const meta: Meta<typeof ContainerProgressBar> = {
	title: 'Features/Container/Visualization/ContainerProgressBar',
	component: ContainerProgressBar,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
## What it is
A semantic progress bar representing a single container metric dimension (weight or capacity), combining numeric context with visual status signaling.

## When to use it
- Displaying container utilization (weight or capacity)
- Providing quick feedback during packing flows
- Showing constraint proximity in dashboards or summaries

## When not to use it
- For generic progress tracking unrelated to container constraints
- When both weight and capacity must be shown together (use a parent panel)
- Without meaningful max values

## Interaction model
- Read-only component
- No direct user interaction
- Communicates state through visual fill, color, and text

## Constraints
- Represents only ONE dimension (weight OR capacity)
- Requires pre-formatted current and max values
- Percentage is precomputed (component does not calculate)

## Accessibility guarantees
- Uses aria-label for screen reader interpretation
- Proper progress semantics via aria-valuenow/min/max
- Information is not conveyed by color alone (text + numbers included)
- Maintains readability across themes

## Design-system notes
- Color is driven by ContainerStatus via shared mapping
- Overflow (>100%) is communicated via:
  - full bar
  - destructive color
  - "+X% over" text
- Uses tabular numbers for alignment
- Built on shadcn Progress primitive
        `,
			},
		},
	},
	argTypes: {
		percentage: {
			control: 'number',
			description:
				'Utilization percentage. Values above 100 are visually clamped but trigger overflow styling.',
			table: {
				type: { summary: 'number' },
			},
		},
		label: {
			control: 'text',
			description: 'Axis label (e.g., Weight, Capacity).',
			table: {
				type: { summary: 'string' },
			},
		},
		current: {
			control: 'text',
			description: 'Formatted current value string.',
			table: {
				type: { summary: 'string' },
			},
		},
		max: {
			control: 'text',
			description: 'Formatted maximum value string.',
			table: {
				type: { summary: 'string' },
			},
		},
		status: {
			control: 'select',
			options: Object.values(ContainerStatus),
			description:
				'Container status that drives the semantic color of the progress indicator.',
			table: {
				type: { summary: 'ContainerStatus | null' },
			},
		},

		// ❌ hidden
		className: { table: { disable: true } },
	},
};

export default meta;
type Story = StoryObj<typeof ContainerProgressBar>;

/**
 * Default neutral state.
 *
 * Represents a standard utilization without warnings.
 */
export const Default: Story = {
	args: {
		label: 'Weight',
		percentage: 45,
		current: '9.0 kg',
		max: '20 kg',
		status: null,
	},
	parameters: {
		docs: {
			description: {
				story: 'Displays a neutral progress state when no explicit container status is provided.',
			},
		},
	},
};

/**
 * Healthy state.
 *
 * Container is within safe limits.
 */
export const SuccessState: Story = {
	args: {
		label: 'Weight',
		percentage: 60,
		current: '12.0 kg',
		max: '20 kg',
		status: ContainerStatus.OK,
	},
	parameters: {
		docs: {
			description: {
				story: 'Indicates a healthy utilization level with success styling applied.',
			},
		},
	},
};

/**
 * Warning state.
 *
 * Approaching limit.
 */
export const WarningState: Story = {
	args: {
		label: 'Capacity',
		percentage: 88,
		current: '88 L',
		max: '100 L',
		status: ContainerStatus.FULL,
	},
	parameters: {
		docs: {
			description: {
				story: 'Shows near-limit utilization where users should be cautious about adding more items.',
			},
		},
	},
};

/**
 * Critical overflow state.
 *
 * Constraint exceeded.
 */
export const DestructiveState: Story = {
	args: {
		label: 'Weight',
		percentage: 120,
		current: '24.0 kg',
		max: '20 kg',
		status: ContainerStatus.OVERWEIGHT,
	},
	parameters: {
		docs: {
			description: {
				story: 'Represents overflow where the value exceeds constraints. The bar is visually full and uses destructive styling with an overflow indicator.',
			},
		},
	},
};

/**
 * Exact limit reached.
 *
 * Edge case at 100%.
 */
export const AtLimit: Story = {
	args: {
		label: 'Capacity',
		percentage: 100,
		current: '100 L',
		max: '100 L',
		status: ContainerStatus.FULL,
	},
	parameters: {
		docs: {
			description: {
				story: 'Represents the exact boundary condition where the container has reached its maximum capacity.',
			},
		},
	},
};

/**
 * Very low usage.
 *
 * Near-empty scenario.
 */
export const LowUsage: Story = {
	args: {
		label: 'Weight',
		percentage: 5,
		current: '1.0 kg',
		max: '20 kg',
		status: ContainerStatus.EMPTY,
	},
	parameters: {
		docs: {
			description: {
				story: 'Represents minimal usage, useful for early packing stages or empty states.',
			},
		},
	},
};

/**
 * Long label stress test.
 *
 * Ensures layout stability.
 */
export const LongLabel: Story = {
	args: {
		label: 'Total Container Weight',
		percentage: 55,
		current: '11.0 kg',
		max: '20 kg',
		status: ContainerStatus.OK,
	},
	parameters: {
		docs: {
			description: {
				story: 'Validates layout behavior when labels are longer than usual.',
			},
		},
	},
};

/**
 * Narrow container constraint.
 *
 * Tests responsiveness.
 */
export const NarrowContainer: Story = {
	render: (args) => (
		<div className="w-[220px] border p-2">
			<ContainerProgressBar {...args} />
		</div>
	),
	args: {
		label: 'Capacity',
		percentage: 72,
		current: '72 L',
		max: '100 L',
		status: ContainerStatus.OK,
	},
	parameters: {
		docs: {
			description: {
				story: 'Ensures the component remains readable and structured in tight layouts such as side panels.',
			},
		},
	},
};

/**
 * Dark mode validation.
 *
 * Ensures contrast and semantic colors.
 */
export const DarkMode: Story = {
	args: {
		label: 'Weight',
		percentage: 110,
		current: '22.0 kg',
		max: '20 kg',
		status: ContainerStatus.OVER_CAPACITY,
	},
	globals: {
		theme: 'dark',
	},
	parameters: {
		docs: {
			description: {
				story: 'Validates color contrast, overflow visibility, and readability in dark mode.',
			},
		},
	},
};
