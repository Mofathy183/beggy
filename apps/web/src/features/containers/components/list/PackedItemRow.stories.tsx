import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import PackedItemRow from './PackedItemRow';

import { ItemCategory, WeightUnit, VolumeUnit } from '@beggy/shared/constants';
import type { PackedItemDTO } from '@beggy/shared/types';

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────────────────────

const baseItem: PackedItemDTO = {
	itemId: 'item-1',
	name: 'Batman the dark knight returns',
	category: ItemCategory.BOOKS,
	quantity: 2,
	weight: 1.2,
	weightUnit: WeightUnit.KILOGRAM,
	volume: 0.87,
	volumeUnit: VolumeUnit.LITER,
	isFragile: false,
};

// ─────────────────────────────────────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────────────────────────────────────

const meta: Meta<typeof PackedItemRow> = {
	title: 'Features/Container/List/PackedItemRow',
	component: PackedItemRow,
	tags: ['autodocs'],

	parameters: {
		docs: {
			description: {
				component: `
PackedItemRow represents a single packed item inside a container.

It combines quantity, identity, metadata, and actions into a compact, interactive row.

---

**When to use it**
- Inside PackedItemList
- Any container inventory view

**When not to use it**
- Static item previews
- Non-interactive summaries

---

**Interaction model**
- Hover reveals actions (move, remove)
- Drag handle appears on hover
- Actions trigger callbacks

---

**Constraints**
- Requires full PackedItemDTO
- Drag behavior not simulated in Storybook
- Long names are truncated

---

**Accessibility guarantees**
- aria-label describes item and quantity
- Action buttons are labeled
- Keyboard interaction supported

---

**Design-system notes**
- Dense horizontal layout
- Token-based hover and focus states
- Badge-driven metadata display
        `,
			},
		},
	},

	argTypes: {
		containerId: {
			control: 'text',
			description: 'Container identifier.',
			table: {
				type: { summary: 'string' },
			},
		},

		item: {
			control: 'object',
			description: 'Packed item data.',
			table: {
				type: { summary: 'PackedItemDTO' },
			},
		},

		onMove: {
			action: 'move-clicked',
			description: 'Triggered when move action is clicked.',
			table: {
				type: { summary: '(item) => void' },
			},
		},

		onUnpack: {
			action: 'unpack-clicked',
			description: 'Triggered when remove action is clicked.',
			table: {
				type: { summary: '(item) => void' },
			},
		},

		isUnpacking: {
			control: 'boolean',
			description: 'Disables remove action during processing.',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof PackedItemRow>;

// ─────────────────────────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Default row.
 *
 * Displays item with metadata and actions on hover.
 */
export const Default: Story = {
	args: {
		item: baseItem,
		containerId: 'bag-1',
	},
	parameters: {
		docs: {
			description: {
				story: `
Standard packed item row.

Hover reveals move and remove actions.
        `,
			},
		},
	},
};

/**
 * Fragile item.
 *
 * Shows fragile badge.
 */
export const Fragile: Story = {
	args: {
		item: {
			...baseItem,
			name: 'Camera Lens',
			isFragile: true,
			category: ItemCategory.ELECTRONICS,
		},
		containerId: 'bag-1',
	},
	parameters: {
		docs: {
			description: {
				story: `
Displays fragile indicator and category badge.
        `,
			},
		},
	},
};

/**
 * No weight.
 *
 * No metric badge shown.
 */
export const NoWeight: Story = {
	args: {
		item: {
			...baseItem,
			weight: null as unknown as number,
		},
		containerId: 'bag-1',
	},
	parameters: {
		docs: {
			description: {
				story: `
Item without weight information.

Metric badge is omitted.
        `,
			},
		},
	},
};

/**
 * Long name.
 *
 * Tests truncation behavior.
 */
export const LongName: Story = {
	args: {
		item: {
			...baseItem,
			name: 'Very long item name that should truncate properly in the layout',
		},
		containerId: 'bag-1',
	},
	parameters: {
		docs: {
			description: {
				story: `
Ensures long names truncate without breaking layout.
        `,
			},
		},
	},
};

/**
 * Unpacking state.
 *
 * Remove button disabled.
 */
export const Unpacking: Story = {
	args: {
		item: baseItem,
		containerId: 'bag-1',
		isUnpacking: true,
	},
	parameters: {
		docs: {
			description: {
				story: `
Remove action is disabled during unpack operation.
        `,
			},
		},
	},
};

/**
 * Narrow container.
 */
export const NarrowContainer: Story = {
	render: (args) => (
		<div className="max-w-xs">
			<PackedItemRow {...args} />
		</div>
	),
	args: {
		item: baseItem,
		containerId: 'bag-1',
	},
	parameters: {
		docs: {
			description: {
				story: `
Tests layout under constrained width.
        `,
			},
		},
	},
};

/**
 * Dark mode.
 */
export const DarkMode: Story = {
	args: {
		item: baseItem,
		containerId: 'bag-1',
	},
	globals: {
		theme: 'dark',
	},
	parameters: {
		docs: {
			description: {
				story: `
Validates contrast and hover states in dark mode.
        `,
			},
		},
	},
};
