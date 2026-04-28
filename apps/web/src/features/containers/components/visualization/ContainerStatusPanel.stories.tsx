import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ContainerStatusPanel from './ContainerStatusPanel';

import {
	ContainerStatus,
	ContainerStatusReason,
} from '@beggy/shared/constants';
import type { ContainerStatusDTO } from '@beggy/shared/types';

/* ──────────────────────────────────────────────────────────────
 * Realistic domain states
 * ────────────────────────────────────────────────────────────── */

const healthyStatus: ContainerStatusDTO = {
	metrics: {
		currentWeight: 10,
		currentCapacity: 35,
		remainingWeight: 15,
		remainingCapacity: 65,
		weightPercentage: 40,
		capacityPercentage: 35,
		itemCount: 5,
	},
	state: {
		isOverweight: false,
		isOverCapacity: false,
		isFull: false,
		status: ContainerStatus.OK,
		reasons: [],
	},
};

const warningStatus: ContainerStatusDTO = {
	metrics: {
		currentWeight: 23.5,
		currentCapacity: 92,
		remainingWeight: 1.5,
		remainingCapacity: 8,
		weightPercentage: 94,
		capacityPercentage: 92,
		itemCount: 11,
	},
	state: {
		isOverweight: false,
		isOverCapacity: false,
		isFull: true,
		status: ContainerStatus.FULL,
		reasons: [ContainerStatusReason.WEIGHT_NEAR_LIMIT],
	},
};

const destructiveStatus: ContainerStatusDTO = {
	metrics: {
		currentWeight: 28,
		currentCapacity: 120,
		remainingWeight: -3,
		remainingCapacity: -20,
		weightPercentage: 112,
		capacityPercentage: 120,
		itemCount: 14,
	},
	state: {
		isOverweight: true,
		isOverCapacity: true,
		isFull: true,
		status: ContainerStatus.OVER_CAPACITY,
		reasons: [
			ContainerStatusReason.CAPACITY_OVER_LIMIT,
			ContainerStatusReason.WEIGHT_OVER_LIMIT,
		],
	},
};

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

/* ────────────────────────────────────────────────────────────── */

const meta: Meta<typeof ContainerStatusPanel> = {
	title: 'Features/Container/Visualization/ContainerStatusPanel',
	component: ContainerStatusPanel,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
## What it is
A high-level visualization panel that composes container metrics, progress indicators, status badges, and constraint explanations into a single cohesive UI.

## When to use it
- Container detail pages
- Packing flows (live feedback)
- Dashboard summaries (full or compact)

## When not to use it
- When only a single metric is needed
- Inside highly constrained layouts (use compact variant instead)
- Without computed container status data

## Interaction model
- Fully read-only
- No direct interaction
- Communicates system state through visual hierarchy and semantic feedback

## Constraints
- Requires precomputed ContainerStatusDTO (no internal calculations)
- Requires maxWeight and maxCapacity for context
- Variant determines layout behavior (compact vs full)

## Accessibility guarantees
- Information is not conveyed by color alone
- Text + numbers + layout hierarchy reinforce meaning
- Progress bars include aria semantics
- Works in both light and dark themes

## Design-system notes
- Orchestrates multiple atomic components:
  - Stat cells
  - Progress bars
  - Status badge
  - Reason chips
- Variant-driven layout (compact vs full)
- Empty and loading states handled internally
- Emphasis is derived centrally to keep subcomponents simple
        `,
			},
		},
	},
	argTypes: {
		status: {
			control: false,
			description:
				'Computed container status including metrics and constraint state.',
			table: {
				type: { summary: 'ContainerStatusDTO | null' },
			},
		},
		maxWeight: {
			control: 'number',
			table: { type: { summary: 'number' } },
		},
		maxCapacity: {
			control: 'number',
			table: { type: { summary: 'number' } },
		},
		variant: {
			control: 'radio',
			options: ['full', 'compact'],
			table: {
				type: { summary: "'full' | 'compact'" },
				defaultValue: { summary: 'full' },
			},
		},

		// ❌ hidden
		className: { table: { disable: true } },
	},
};

export default meta;
type Story = StoryObj<typeof ContainerStatusPanel>;

/* ──────────────────────────────────────────────────────────────
 * Core States
 * ────────────────────────────────────────────────────────────── */

/**
 * Default healthy state.
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
				story: 'Represents a balanced container with no constraint violations.',
			},
		},
	},
};

/**
 * Warning state.
 *
 * Near capacity or weight limits.
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
				story: 'Shows near-limit conditions where the user should proceed cautiously.',
			},
		},
	},
};

/**
 * Critical overflow state.
 *
 * Constraints violated.
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
				story: 'Displays constraint violations with strong visual emphasis and explanatory reasons.',
			},
		},
	},
};

/**
 * Empty container.
 *
 * No items present.
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
				story: 'Shows the empty state when no items are present. Only applies to full variant.',
			},
		},
	},
};

/**
 * Loading state.
 *
 * Data not yet available.
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
				story: 'Displays skeleton layout while container data is loading.',
			},
		},
	},
};

/* ──────────────────────────────────────────────────────────────
 * Variants
 * ────────────────────────────────────────────────────────────── */

/**
 * Compact variant.
 *
 * Used in cards and list views.
 */
export const Compact: Story = {
	args: {
		status: healthyStatus,
		maxWeight: 25,
		maxCapacity: 100,
		variant: 'compact',
	},
	parameters: {
		docs: {
			description: {
				story: 'Compact layout removes metric grid and focuses on quick scanning via progress bars.',
			},
		},
	},
};

/**
 * Compact warning state.
 */
export const CompactWarning: Story = {
	args: {
		status: warningStatus,
		maxWeight: 25,
		maxCapacity: 100,
		variant: 'compact',
	},
	parameters: {
		docs: {
			description: {
				story: 'Compact variant with warning state emphasizes near-limit conditions in tight layouts.',
			},
		},
	},
};

/* ──────────────────────────────────────────────────────────────
 * Layout & Stress
 * ────────────────────────────────────────────────────────────── */

/**
 * Narrow container constraint.
 */
export const NarrowContainer: Story = {
	render: (args) => (
		<div className="w-[320px] border p-2">
			<ContainerStatusPanel {...args} />
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
				story: 'Ensures layout stability and readability in constrained containers.',
			},
		},
	},
};

/**
 * Dark mode validation.
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
				story: 'Validates contrast, emphasis visibility, and semantic colors in dark mode.',
			},
		},
	},
};
