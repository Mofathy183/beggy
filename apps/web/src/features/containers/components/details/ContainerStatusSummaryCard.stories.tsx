import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ContainerStatusSummaryCard from './ContainerStatusSummaryCard';
import {
	ContainerStatus,
	ContainerStatusReason,
} from '@beggy/shared/constants';
import type { ContainerStatusDTO } from '@beggy/shared/types';

/**
 * Realistic base state (healthy container).
 */
const healthyStatus: ContainerStatusDTO = {
	metrics: {
		currentWeight: 12.5,
		currentCapacity: 40,
		remainingWeight: 12.5,
		remainingCapacity: 60,
		weightPercentage: 50,
		capacityPercentage: 40,
		itemCount: 6,
	},
	state: {
		isOverweight: false,
		isOverCapacity: false,
		isFull: false,
		status: ContainerStatus.OK,
		reasons: [],
	},
};

/**
 * Near-limit warning state.
 */
const warningStatus: ContainerStatusDTO = {
	metrics: {
		currentWeight: 22,
		currentCapacity: 85,
		remainingWeight: 3,
		remainingCapacity: 15,
		weightPercentage: 88,
		capacityPercentage: 85,
		itemCount: 10,
	},
	state: {
		isOverweight: false,
		isOverCapacity: false,
		isFull: true,
		status: ContainerStatus.FULL,
		reasons: [ContainerStatusReason.WEIGHT_NEAR_LIMIT],
	},
};

/**
 * Critical overflow state.
 */
const destructiveStatus: ContainerStatusDTO = {
	metrics: {
		currentWeight: 30,
		currentCapacity: 120,
		remainingWeight: -5,
		remainingCapacity: -20,
		weightPercentage: 120,
		capacityPercentage: 120,
		itemCount: 14,
	},
	state: {
		isOverweight: true,
		isOverCapacity: true,
		isFull: true,
		status: ContainerStatus.OVER_CAPACITY,
		reasons: [
			ContainerStatusReason.WEIGHT_OVER_LIMIT,
			ContainerStatusReason.CAPACITY_OVER_LIMIT,
		],
	},
};

/**
 * Empty container state.
 */
const emptyStatus: ContainerStatusDTO = {
	metrics: {
		currentWeight: 0,
		currentCapacity: 0,
		remainingWeight: 25,
		remainingCapacity: 100,
		weightPercentage: 0,
		capacityPercentage: 0,
		itemCount: 0,
	},
	state: {
		isOverweight: false,
		isOverCapacity: false,
		isFull: false,
		status: ContainerStatus.EMPTY,
		reasons: [],
	},
};

const meta: Meta<typeof ContainerStatusSummaryCard> = {
	title: 'Features/Container/Details/ContainerStatusSummaryCard',
	component: ContainerStatusSummaryCard,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
## What it is
A high-level dashboard card that summarizes container packing status using computed metrics and constraint-based state.

## When to use it
- Dashboard summaries of container health
- Packing flows where users need quick feedback
- Situations requiring both numeric insight and status interpretation

## When not to use it
- Raw metric display without context
- Inline or dense UI (use smaller metric components instead)
- When constraints (maxWeight/maxCapacity) are not defined

## Interaction model
- Fully read-only
- Visual interpretation is delegated to the status panel
- No direct interaction or editing

## Constraints
- Requires maxWeight and maxCapacity to contextualize metrics
- Status must be derived from calculation layer (never mocked arbitrarily)
- Accepts null for loading/empty fallback states

## Accessibility guarantees
- Semantic card structure (header + content)
- Information is not conveyed by color alone
- Metrics are readable and structured
- Works in both light and dark themes

## Design-system notes
- Built using shadcn Card primitives
- Strict separation between:
  - data (DTO)
  - visualization (panel)
- Token-based styling ensures consistency
        `,
			},
		},
	},
	argTypes: {
		status: {
			control: false,
			description:
				'Derived container status including metrics and constraint-based state.',
			table: {
				type: { summary: 'ContainerStatusDTO | null' },
			},
		},
		maxWeight: {
			control: 'number',
			description: 'Maximum allowed container weight.',
			table: {
				type: { summary: 'number' },
			},
		},
		maxCapacity: {
			control: 'number',
			description: 'Maximum allowed container capacity.',
			table: {
				type: { summary: 'number' },
			},
		},
		weightUnit: {
			control: 'text',
			description: 'Weight unit label.',
			table: {
				type: { summary: 'string' },
				defaultValue: { summary: 'kg' },
			},
		},
		capacityUnit: {
			control: 'text',
			description: 'Capacity unit label.',
			table: {
				type: { summary: 'string' },
				defaultValue: { summary: 'L' },
			},
		},
		title: {
			control: 'text',
			description: 'Card title.',
			table: {
				type: { summary: 'string' },
				defaultValue: { summary: 'Packing status' },
			},
		},

		// ❌ hidden
		className: { table: { disable: true } },
	},
};

export default meta;
type Story = StoryObj<typeof ContainerStatusSummaryCard>;

/**
 * Default healthy state.
 *
 * Container is within safe limits.
 */
export const Default: Story = {
	args: {
		status: healthyStatus,
		maxWeight: 25,
		maxCapacity: 100,
	},
	parameters: {
		docs: {
			description: {
				story: 'Represents a balanced container where both weight and capacity are within acceptable limits.',
			},
		},
	},
};

/**
 * Warning state.
 *
 * Container is nearing its limits.
 */
export const WarningState: Story = {
	args: {
		status: warningStatus,
		maxWeight: 25,
		maxCapacity: 100,
	},
	parameters: {
		docs: {
			description: {
				story: 'Indicates that the container is close to its limits and requires user awareness.',
			},
		},
	},
};

/**
 * Critical overflow state.
 *
 * Constraints are violated.
 */
export const DestructiveState: Story = {
	args: {
		status: destructiveStatus,
		maxWeight: 25,
		maxCapacity: 100,
	},
	parameters: {
		docs: {
			description: {
				story: 'Displays an overflow condition where both weight and capacity exceed allowed constraints.',
			},
		},
	},
};

/**
 * Empty container.
 *
 * No items have been added yet.
 */
export const Empty: Story = {
	args: {
		status: emptyStatus,
		maxWeight: 25,
		maxCapacity: 100,
	},
	parameters: {
		docs: {
			description: {
				story: 'Represents an initial state with no items. Useful for onboarding and first-use scenarios.',
			},
		},
	},
};

/**
 * Loading / unknown state.
 *
 * Data is not yet available.
 */
export const LoadingState: Story = {
	args: {
		status: null,
		maxWeight: 25,
		maxCapacity: 100,
	},
	parameters: {
		docs: {
			description: {
				story: 'Used when container data has not been loaded yet. Rendering fallback is handled internally.',
			},
		},
	},
};

/**
 * Narrow layout constraint.
 *
 * Tests responsiveness and layout stability.
 */
export const NarrowContainer: Story = {
	render: (args) => (
		<div className="w-[280px] border p-2">
			<ContainerStatusSummaryCard {...args} />
		</div>
	),
	args: {
		status: healthyStatus,
		maxWeight: 25,
		maxCapacity: 100,
	},
	parameters: {
		docs: {
			description: {
				story: 'Ensures the component remains readable and structured in constrained layouts.',
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
		status: destructiveStatus,
		maxWeight: 25,
		maxCapacity: 100,
	},
	globals: {
		theme: 'dark',
	},
	parameters: {
		docs: {
			description: {
				story: 'Validates semantic colors, contrast, and readability in dark mode.',
			},
		},
	},
};
