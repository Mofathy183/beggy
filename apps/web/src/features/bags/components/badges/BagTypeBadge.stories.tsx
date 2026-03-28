import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { BagType } from '@beggy/shared/constants';
import BagTypeBadge from './BagTypeBadge';

const BAG_TYPE_VALUES = Object.values(BagType);

const meta: Meta<typeof BagTypeBadge> = {
	title: 'Features/Bags/Badges/BagTypeBadge',
	component: BagTypeBadge,
	tags: ['autodocs'],

	parameters: {
		docs: {
			description: {
				component: `
A secondary informational badge representing the type of bag.

### What it is
BagTypeBadge displays the bag type using icon + short label. It represents **core identity metadata**, not system state, and therefore always uses neutral (secondary) styling.

### When to use it
- Card headers showing bag identity
- Metadata rows alongside size and material
- Anywhere bag classification is needed

### When not to use it
- Status or validation feedback (use ContainerStatusBadge)
- High-priority or semantic indicators
- Interactive selection or filtering

### Interaction model
- Fully non-interactive
- Icon + label or icon-only
- No focus or keyboard interaction

### Constraints
- Renders nothing when value is null or undefined
- Always uses shortLabel (never full label)
- Variant is fixed (secondary) — not configurable
- Unknown enum values are silently ignored

### Accessibility guarantees
- Uses role="img" with descriptive aria-label
- Icon is decorative (aria handled at container level)
- No focusable elements (read-only)
- iconOnly mode still exposes label via aria

### Design-system notes
- Uses secondary tokens (identity, not semantic)
- CVA controls size and spacing
- Icon scales with size variant
- Sits between ContainerStatusBadge (high priority) and SizeBadge (low priority)
        `,
			},
		},
	},

	argTypes: {
		value: {
			control: 'select',
			options: BAG_TYPE_VALUES,
			description: 'Bag type enum value.',
			table: {
				type: { summary: 'BagType | null | undefined' },
			},
		},

		iconOnly: {
			control: 'boolean',
			description: 'When true, renders only the icon.',
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

type Story = StoryObj<typeof BagTypeBadge>;

/**
 * Default bag type badge.
 *
 * Standard identity display in card headers.
 */
export const Default: Story = {
	args: {
		value: BagType.BACKPACK,
	},
	parameters: {
		docs: {
			description: {
				story: 'Displays the bag type using icon and short label. This is the primary usage in cards.',
			},
		},
	},
};

/**
 * Icon-only mode.
 *
 * Used in compact layouts like tables or dense rows.
 */
export const IconOnly: Story = {
	args: {
		value: BagType.DUFFEL,
		iconOnly: true,
		size: 'sm',
	},
	parameters: {
		docs: {
			description: {
				story: 'Renders only the icon while preserving accessibility via aria-label. Ideal for tight UI spaces.',
			},
		},
	},
};

/**
 * Large size variant.
 *
 * Improves readability slightly in expanded layouts.
 */
export const LargeSize: Story = {
	args: {
		value: BagType.TRAVEL_BAG,
		size: 'lg',
	},
	parameters: {
		docs: {
			description: {
				story: 'Uses a larger size for improved readability while maintaining secondary visual priority.',
			},
		},
	},
};

/**
 * All bag types overview.
 *
 * Validates consistency across all variants.
 */
export const AllBagTypes: Story = {
	render: () => (
		<div className="flex flex-wrap gap-2">
			{BAG_TYPE_VALUES.map((type) => (
				<BagTypeBadge key={type} value={type} />
			))}
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Displays all bag types to validate icon consistency, spacing, and alignment across variants.',
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
				story: 'When value is null or undefined, the component renders nothing. This prevents unnecessary UI noise.',
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
		value: BagType.MESSENGER,
	},
	render: (args) => (
		<div className="w-[100px] border p-2 flex justify-center">
			<BagTypeBadge {...args} />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Ensures the badge remains stable and properly aligned in constrained layouts.',
			},
		},
	},
};

/**
 * Dark mode validation.
 *
 * Ensures secondary tokens maintain contrast.
 */
export const DarkMode: Story = {
	args: {
		value: BagType.LAPTOP_BAG,
	},
	globals: {
		theme: 'dark',
	},
	parameters: {
		docs: {
			description: {
				story: 'Validates contrast, readability, and token correctness in dark mode.',
			},
		},
	},
};

/**
 * Identity vs semantic hierarchy.
 *
 * Demonstrates visual priority differences between badges.
 */
export const BadgeHierarchy: Story = {
	render: () => (
		<div className="flex flex-wrap gap-2 items-center">
			<BagTypeBadge value={BagType.CROSSBODY} />
			{/* Simulated context: status would appear stronger visually */}
			<span className="text-xs text-muted-foreground">
				← Identity (secondary priority)
			</span>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Highlights that BagTypeBadge represents identity (secondary priority) and should not visually compete with semantic badges like status.',
			},
		},
	},
};
