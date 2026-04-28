import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ContainerStatus } from '@beggy/shared/constants';
import ContainerStatusBadge from './ContainerStatusBadge';

const STATUS_VALUES = Object.values(ContainerStatus);

const meta: Meta<typeof ContainerStatusBadge> = {
	title: 'Features/Container/Badges/ContainerStatusBadge',
	component: ContainerStatusBadge,
	tags: ['autodocs'],

	parameters: {
		docs: {
			description: {
				component: `
A semantic status badge that communicates container state using color, icon, and label.

### What it is
ContainerStatusBadge is the **single source of truth** for mapping container status → semantic color tokens. It visually communicates system state (success, warning, destructive, neutral) using consistent badge styling.

### When to use it
- Bag or suitcase status indicators
- Dashboard summaries
- Any UI showing system or capacity state

### When not to use it
- Generic labels without semantic meaning
- Non-status metadata (use SizeBadge or MaterialBadge)
- Interactive status controls

### Interaction model
- Fully non-interactive
- Purely informational
- Icon + label or icon-only modes

### Constraints
- Renders nothing when value is null or undefined
- Variant is NOT manually configurable — derived from status mapping
- Unknown enum values are ignored
- iconOnly hides text but preserves accessibility

### Accessibility guarantees
- Uses role="img" with descriptive aria-label
- Always exposes full label for screen readers
- Icon is decorative (handled at container level)
- No focusable elements

### Design-system notes
- Semantic tokens (success, warning, destructive, secondary)
- Soft background tint (never full intensity)
- CVA controls size + variant composition
- Highest visual priority among metadata badges
        `,
			},
		},
	},

	argTypes: {
		value: {
			control: 'select',
			options: STATUS_VALUES,
			description: 'Container status value.',
			table: {
				type: { summary: 'ContainerStatus | null | undefined' },
			},
		},

		display: {
			control: 'radio',
			options: ['short', 'full'],
			description: 'Controls label verbosity.',
			table: {
				type: { summary: `'short' | 'full'` },
				defaultValue: { summary: 'short' },
			},
		},

		iconOnly: {
			control: 'boolean',
			description: 'Renders only the icon when true.',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},

		size: {
			control: 'select',
			options: ['sm', 'md', 'lg'],
			description: 'Controls badge size and icon scaling.',
			table: {
				type: { summary: `'sm' | 'md' | 'lg'` },
				defaultValue: { summary: 'md' },
			},
		},

		className: { table: { disable: true } },
	},
};

export default meta;

type Story = StoryObj<typeof ContainerStatusBadge>;

/**
 * Default status.
 *
 * Represents a healthy container state.
 */
export const Default: Story = {
	args: {
		value: ContainerStatus.OK,
		display: 'short',
	},
	parameters: {
		docs: {
			description: {
				story: 'Displays the success state ("OK") using semantic success tokens. This is the most common healthy state.',
			},
		},
	},
};

/**
 * Warning state.
 *
 * Indicates approaching limits.
 */
export const WarningState: Story = {
	args: {
		value: ContainerStatus.FULL,
	},
	parameters: {
		docs: {
			description: {
				story: 'Displays a warning state indicating capacity is reached. Uses warning tokens to draw attention without urgency.',
			},
		},
	},
};

/**
 * Destructive states.
 *
 * Critical conditions requiring attention.
 */
export const DestructiveStates: Story = {
	render: () => (
		<div className="flex gap-2 flex-wrap">
			<ContainerStatusBadge value={ContainerStatus.OVERWEIGHT} />
			<ContainerStatusBadge value={ContainerStatus.OVER_CAPACITY} />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Displays critical states using destructive tokens. These represent errors or violations requiring immediate attention.',
			},
		},
	},
};

/**
 * Neutral state.
 *
 * Represents empty or inactive containers.
 */
export const NeutralState: Story = {
	args: {
		value: ContainerStatus.EMPTY,
	},
	parameters: {
		docs: {
			description: {
				story: 'Displays a neutral state using secondary tokens. Indicates absence of content without urgency.',
			},
		},
	},
};

/**
 * Full label display.
 *
 * Used in detailed contexts.
 */
export const FullLabel: Story = {
	args: {
		value: ContainerStatus.OVER_CAPACITY,
		display: 'full',
	},
	parameters: {
		docs: {
			description: {
				story: 'Displays the full descriptive label instead of the short form. Useful in detailed views or tooltips.',
			},
		},
	},
};

/**
 * Icon-only mode.
 *
 * Used in highly compact layouts.
 */
export const IconOnly: Story = {
	args: {
		value: ContainerStatus.OK,
		iconOnly: true,
		size: 'sm',
	},
	parameters: {
		docs: {
			description: {
				story: 'Displays only the icon while preserving accessibility via aria-label. Ideal for dense UI such as tables.',
			},
		},
	},
};

/**
 * All statuses overview.
 *
 * Validates semantic mapping consistency.
 */
export const AllStatuses: Story = {
	render: () => (
		<div className="flex flex-wrap gap-2">
			{STATUS_VALUES.map((status) => (
				<ContainerStatusBadge key={status} value={status} />
			))}
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Displays all possible statuses to validate semantic color mapping, icon consistency, and visual hierarchy.',
			},
		},
	},
};

/**
 * Empty state.
 *
 * Component renders nothing.
 */
export const Empty: Story = {
	args: {
		value: null,
	},
	parameters: {
		docs: {
			description: {
				story: 'When no value is provided, the component renders nothing. This prevents unnecessary UI noise.',
			},
		},
	},
};

/**
 * Narrow container.
 *
 * Tests layout resilience.
 */
export const NarrowContainer: Story = {
	args: {
		value: ContainerStatus.FULL,
	},
	render: (args) => (
		<div className="w-[100px] border p-2 flex justify-center">
			<ContainerStatusBadge {...args} />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Ensures the badge remains visually stable and readable in constrained layouts.',
			},
		},
	},
};

/**
 * Dark mode validation.
 *
 * Ensures semantic tokens maintain contrast.
 */
export const DarkMode: Story = {
	args: {
		value: ContainerStatus.OVERWEIGHT,
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
