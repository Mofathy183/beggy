import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ContainerMetricBadge from './ContainerMetricBadge';
import { ContainerStatus } from '@beggy/shared/constants';

const meta: Meta<typeof ContainerMetricBadge> = {
	title: 'Features/Container/Badges/ContainerMetricBadge',
	component: ContainerMetricBadge,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
## What it is
A compact, token-driven metric badge that displays a numeric value with its unit, enriched with contextual visual intent based on container status.

## When to use it
- Displaying container metrics (weight, capacity, volume)
- Showing system-calculated values with quick status recognition
- Inline summaries in dashboards, cards, or lists

## When not to use it
- For large or primary data display (use more prominent components)
- When no unit is applicable
- For purely decorative values without meaning

## Interaction model
- Non-interactive visual indicator
- Read-only display
- Screen readers announce the formatted value via aria-label

## Constraints
- Always requires a numeric value and unit
- Value is formatted to one decimal place
- Status drives visual intent automatically (cannot override intent directly)

## Accessibility guarantees
- Uses role="img" to represent a meaningful visual indicator
- aria-label provides a readable value (e.g., "12.5 kg")
- Sufficient contrast across all intents (including dark mode)
- No hidden interaction

## Design-system notes
- Built with CVA variants (size + intent)
- Token-based colors (success, warning, destructive, neutral)
- Uses tabular numbers for consistent alignment
- Designed for dense UI environments
        `,
			},
		},
	},
	argTypes: {
		value: {
			control: 'number',
			description:
				'Numeric value displayed (formatted to 1 decimal place).',
			table: {
				type: { summary: 'number' },
			},
		},
		unit: {
			control: 'text',
			description:
				'Unit label associated with the value (e.g., kg, L, %).',
			table: {
				type: { summary: 'string' },
			},
		},
		status: {
			control: 'select',
			options: Object.values(ContainerStatus),
			description:
				'Domain status that determines the visual intent (mapped internally).',
			table: {
				type: { summary: 'ContainerStatus | null' },
			},
		},
		size: {
			control: 'radio',
			options: ['sm', 'md'],
			description: 'Controls badge density and typography size.',
			table: {
				type: { summary: "'sm' | 'md'" },
				defaultValue: { summary: 'md' },
			},
		},

		// ❌ Hidden internal / controlled props
		className: { table: { disable: true } },
	},
};

export default meta;
type Story = StoryObj<typeof ContainerMetricBadge>;

/**
 * Default neutral metric display.
 *
 * Represents a standard metric with no critical state.
 */
export const Default: Story = {
	args: {
		value: 12.5,
		unit: 'kg',
		status: ContainerStatus.EMPTY,
	},
	parameters: {
		docs: {
			description: {
				story: 'Displays a neutral metric state. Used when no warnings or critical thresholds are reached.',
			},
		},
	},
};

/**
 * Healthy container state.
 *
 * Indicates optimal conditions.
 */
export const SuccessState: Story = {
	args: {
		value: 8.2,
		unit: 'kg',
		status: ContainerStatus.OK,
	},
	parameters: {
		docs: {
			description: {
				story: 'Represents a healthy container state. The badge uses success styling to reinforce positive conditions.',
			},
		},
	},
};

/**
 * Approaching limit.
 *
 * Warns the user that capacity is near maximum.
 */
export const WarningState: Story = {
	args: {
		value: 19.4,
		unit: 'kg',
		status: ContainerStatus.FULL,
	},
	parameters: {
		docs: {
			description: {
				story: 'Indicates that the container is nearing its limit. Visual warning helps users take preventive action.',
			},
		},
	},
};

/**
 * Critical overflow state.
 *
 * Indicates unsafe or invalid conditions.
 */
export const DestructiveState: Story = {
	args: {
		value: 25.7,
		unit: 'kg',
		status: ContainerStatus.OVERWEIGHT,
	},
	parameters: {
		docs: {
			description: {
				story: 'Represents a critical condition such as overweight or overcapacity. Uses destructive styling to demand attention.',
			},
		},
	},
};

/**
 * Unknown or missing status.
 *
 * Falls back to neutral to avoid misleading signals.
 */
export const UnknownState: Story = {
	args: {
		value: 10.0,
		unit: 'kg',
		status: null,
	},
	parameters: {
		docs: {
			description: {
				story: 'When status is unknown or missing, the badge defaults to a neutral appearance to avoid incorrect interpretation.',
			},
		},
	},
};

/**
 * Compact density.
 *
 * Used in tight layouts such as tables or dense lists.
 */
export const SmallSize: Story = {
	args: {
		value: 6.3,
		unit: 'L',
		status: ContainerStatus.OK,
		size: 'sm',
	},
	parameters: {
		docs: {
			description: {
				story: 'Reduced padding and font size for high-density UI contexts like tables or compact dashboards.',
			},
		},
	},
};

/**
 * Long unit handling.
 *
 * Ensures layout remains stable with extended unit labels.
 */
export const LongUnit: Story = {
	args: {
		value: 120.5,
		unit: 'liters',
		status: ContainerStatus.OK,
	},
	parameters: {
		docs: {
			description: {
				story: 'Demonstrates how the badge behaves with longer unit labels while maintaining readability and alignment.',
			},
		},
	},
};

/**
 * Narrow container constraint.
 *
 * Tests wrapping and layout resilience.
 */
export const NarrowContainer: Story = {
	render: (args) => (
		<div className="w-[80px] border p-2">
			<ContainerMetricBadge {...args} />
		</div>
	),
	args: {
		value: 15.2,
		unit: 'kg',
		status: ContainerStatus.FULL,
	},
	parameters: {
		docs: {
			description: {
				story: 'Simulates constrained layouts to ensure the badge remains visually stable and does not overflow unexpectedly.',
			},
		},
	},
};

/**
 * Dark mode validation.
 *
 * Ensures contrast, readability, and token correctness.
 */
export const DarkMode: Story = {
	args: {
		value: 22.1,
		unit: 'kg',
		status: ContainerStatus.OVER_CAPACITY,
	},
	globals: {
		theme: 'dark',
	},
	parameters: {
		docs: {
			description: {
				story: 'Validates color contrast, readability, and semantic intent mapping in dark mode.',
			},
		},
	},
};
