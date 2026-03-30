import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ContainerStatCell from './ContainerStatCell';

const meta: Meta<typeof ContainerStatCell> = {
	title: 'Features/Container/Visualization/ContainerStatCell',
	component: ContainerStatCell,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
## What it is
A single metric cell used inside a container status grid, displaying a labeled value with unit and optional semantic emphasis.

## When to use it
- Inside structured layouts (e.g., 2×2 metric grids)
- When presenting container metrics like current/remaining values
- When visual hierarchy between primary and secondary metrics is required

## When not to use it
- As a standalone metric display outside a structured layout
- For interactive inputs or editable values
- When no unit is applicable

## Interaction model
- Read-only component
- No interaction
- Communicates meaning through typography, layout, and emphasis

## Constraints
- Value must be pre-formatted (component does not format numbers)
- Unit is always displayed inline
- Emphasis is optional but must reflect real system state (not arbitrary)

## Accessibility guarantees
- Information is not conveyed by color alone (hierarchy + labels included)
- High contrast across all emphasis states
- Uppercase labels improve scanability
- Tabular numbers ensure alignment consistency

## Design-system notes
- Primary vs secondary metrics define visual hierarchy
- Emphasis affects:
  - border
  - background
  - text color
- Designed for grid composition (not isolation)
- Token-driven styling ensures consistency across themes
        `,
			},
		},
	},
	argTypes: {
		label: {
			control: 'text',
			description: 'Metric label displayed above the value.',
			table: {
				type: { summary: 'string' },
			},
		},
		value: {
			control: 'text',
			description: 'Pre-formatted numeric value.',
			table: {
				type: { summary: 'string' },
			},
		},
		unit: {
			control: 'text',
			description: 'Unit appended to the value.',
			table: {
				type: { summary: 'string' },
			},
		},
		emphasis: {
			control: 'radio',
			options: ['warning', 'destructive'],
			description:
				'Semantic emphasis indicating constraint state (warning or destructive).',
			table: {
				type: { summary: "'warning' | 'destructive' | undefined" },
			},
		},
		primary: {
			control: 'boolean',
			description:
				'Controls visual hierarchy. Primary metrics are larger and more prominent.',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},

		// ❌ hidden
		className: { table: { disable: true } },
	},
};

export default meta;
type Story = StoryObj<typeof ContainerStatCell>;

/**
 * Default secondary metric.
 *
 * Represents supporting information.
 */
export const Default: Story = {
	args: {
		label: 'Remaining weight',
		value: '12.5',
		unit: 'kg',
	},
	parameters: {
		docs: {
			description: {
				story: 'Displays a secondary metric with standard styling and no emphasis.',
			},
		},
	},
};

/**
 * Primary metric.
 *
 * Represents the main value users scan first.
 */
export const Primary: Story = {
	args: {
		label: 'Current weight',
		value: '12.5',
		unit: 'kg',
		primary: true,
	},
	parameters: {
		docs: {
			description: {
				story: 'Primary metrics use larger typography to emphasize current state values.',
			},
		},
	},
};

/**
 * Warning emphasis.
 *
 * Near limit condition.
 */
export const WarningState: Story = {
	args: {
		label: 'Used capacity',
		value: '95.0',
		unit: 'L',
		emphasis: 'warning',
		primary: true,
	},
	parameters: {
		docs: {
			description: {
				story: 'Indicates a near-limit condition. Background tint and text color reinforce the warning state.',
			},
		},
	},
};

/**
 * Destructive emphasis.
 *
 * Constraint violated.
 */
export const DestructiveState: Story = {
	args: {
		label: 'Remaining weight',
		value: '-2.0',
		unit: 'kg',
		emphasis: 'destructive',
	},
	parameters: {
		docs: {
			description: {
				story: 'Represents a constraint violation where remaining value is negative. Strong visual emphasis ensures visibility.',
			},
		},
	},
};

/**
 * Zero remaining edge case.
 *
 * Important boundary condition.
 */
export const ZeroRemaining: Story = {
	args: {
		label: 'Remaining capacity',
		value: '0.0',
		unit: 'L',
		emphasis: 'destructive',
	},
	parameters: {
		docs: {
			description: {
				story: 'Represents a boundary condition where no capacity remains. Treated as a destructive state for clarity.',
			},
		},
	},
};

/**
 * Long label stress test.
 *
 * Ensures wrapping and layout stability.
 */
export const LongLabel: Story = {
	args: {
		label: 'Total remaining container capacity',
		value: '42.0',
		unit: 'L',
	},
	parameters: {
		docs: {
			description: {
				story: 'Tests how the component handles longer labels without breaking layout.',
			},
		},
	},
};

/**
 * Grid composition.
 *
 * Real usage inside a 2×2 layout.
 */
export const GridComposition: Story = {
	render: () => (
		<div className="grid grid-cols-2 gap-2 w-[320px]">
			<ContainerStatCell
				label="Current weight"
				value="18.5"
				unit="kg"
				primary
				emphasis="warning"
			/>
			<ContainerStatCell
				label="Remaining weight"
				value="1.5"
				unit="kg"
				emphasis="warning"
			/>
			<ContainerStatCell
				label="Used capacity"
				value="92.0"
				unit="L"
				primary
				emphasis="warning"
			/>
			<ContainerStatCell
				label="Remaining capacity"
				value="8.0"
				unit="L"
			/>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Demonstrates real usage inside a grid layout, showing hierarchy and emphasis working together.',
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
		<div className="w-[160px] border p-2">
			<ContainerStatCell {...args} />
		</div>
	),
	args: {
		label: 'Current weight',
		value: '12.5',
		unit: 'kg',
		primary: true,
	},
	parameters: {
		docs: {
			description: {
				story: 'Ensures readability and layout stability in constrained containers.',
			},
		},
	},
};

/**
 * Dark mode validation.
 *
 * Ensures contrast and token correctness.
 */
export const DarkMode: Story = {
	args: {
		label: 'Remaining weight',
		value: '-1.2',
		unit: 'kg',
		emphasis: 'destructive',
	},
	globals: {
		theme: 'dark',
	},
	parameters: {
		docs: {
			description: {
				story: 'Validates contrast, emphasis visibility, and readability in dark mode.',
			},
		},
	},
};
