import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import PackedItemList from './PackedItemList';

import { WeightUnit, ItemCategory, VolumeUnit } from '@beggy/shared/constants';
import type { PackedItemDTO } from '@beggy/shared/types';

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data (Deterministic)
// ─────────────────────────────────────────────────────────────────────────────

const baseItems: PackedItemDTO[] = [
	{
		itemId: 'item-1',
		name: 'Travel Backpack',
		category: ItemCategory.ACCESSORIES,
		quantity: 1,
		weight: 1.2,
		weightUnit: WeightUnit.KILOGRAM,
		volume: 0.87,
		volumeUnit: VolumeUnit.LITER,
		isFragile: false,
	},
	{
		itemId: 'item-2',
		name: 'Running Shoes',
		category: ItemCategory.CLOTHING,
		quantity: 2,
		weight: 0.8,
		weightUnit: WeightUnit.KILOGRAM,
		volume: 0.87,
		volumeUnit: VolumeUnit.LITER,
		isFragile: false,
	},
];
// ─────────────────────────────────────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────────────────────────────────────

const meta: Meta<typeof PackedItemList> = {
	title: 'Features/Container/List/PackedItemList',
	component: PackedItemList,
	tags: ['autodocs'],

	parameters: {
		docs: {
			description: {
				component: `
PackedItemList displays all items currently packed inside a container and acts as a drop target for drag-and-drop interactions.

It visually communicates:
- Item density
- Available actions (move / unpack)
- Drop affordances

---

**When to use it**
- Inside container detail views
- When displaying packed inventory
- As a drop zone for packing and moving items

**When not to use it**
- Generic list rendering
- Static item previews
- Without container context

---

**Interaction model**
- Items are displayed as rows with metadata
- Hover reveals action buttons
- Entire list acts as a drop zone
- Empty state invites drag-and-drop

---

**Constraints**
- Requires containerId context
- Drop behavior is visual only in Storybook
- Actions must be injected or safely mocked

---

**Accessibility guarantees**
- Uses role="list" and role="listitem"
- Proper aria-labels for items and actions
- Drop zone clearly labeled
- Buttons are keyboard accessible

---

**Design-system notes**
- Uses card-like row density
- Token-based hover + focus states
- Supports animated entry
- Handles empty vs populated layouts
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

		bagName: {
			control: 'text',
			description: 'Name of the container.',
			table: {
				type: { summary: 'string' },
			},
		},

		items: {
			control: 'object',
			description: 'Packed items displayed in the list.',
			table: {
				type: { summary: 'PackedItemDTO[]' },
			},
		},

		onUnpack: {
			action: 'unpack-clicked',
			description: 'Triggered when user clicks unpack.',
			table: {
				type: { summary: '(item) => void' },
			},
		},

		onMove: {
			action: 'move-clicked',
			description: 'Triggered when user clicks move.',
			table: {
				type: { summary: '(item) => void' },
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof PackedItemList>;

// ─────────────────────────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Default populated state.
 *
 * Shows packed items with actions on hover.
 */
export const Default: Story = {
	args: {
		items: baseItems,
		containerId: 'bag-1',
		bagName: 'Main Bag',
	},
	parameters: {
		docs: {
			description: {
				story: `
Displays packed items with metadata and action affordances.

Hover reveals move and remove actions.
        `,
			},
		},
	},
};

/**
 * Empty state.
 *
 * No items in container.
 */
export const Empty: Story = {
	args: {
		items: [],
		containerId: 'bag-1',
		bagName: 'Main Bag',
	},
	parameters: {
		docs: {
			description: {
				story: `
Shows empty container state.

Encourages user to drag items into the container.
        `,
			},
		},
	},
};

/**
 * Single item.
 *
 * Minimal density scenario.
 */
export const SingleItem: Story = {
	args: {
		items: [baseItems[0] as any],
		containerId: 'bag-1',
		bagName: 'Main Bag',
	},
	parameters: {
		docs: {
			description: {
				story: `
Displays a single packed item.

Validates spacing and layout for minimal content.
        `,
			},
		},
	},
};

/**
 * Dense list.
 *
 * Stress test with many items.
 */
export const DenseList: Story = {
	args: {
		items: Array.from({ length: 8 }).map((_, i) => ({
			...baseItems[i % 2],
			itemId: `item-${i}`,
			name: `Item ${i + 1}`,
		})) as any,
		containerId: 'bag-1',
		bagName: 'Main Bag',
	},
	parameters: {
		docs: {
			description: {
				story: `
Stress test for vertical density and scrolling behavior.

Ensures readability with many items.
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
			<PackedItemList {...args} />
		</div>
	),
	args: {
		items: baseItems,
		containerId: 'bag-1',
		bagName: 'Main Bag',
	},
	parameters: {
		docs: {
			description: {
				story: `
Validates layout in constrained width.

Ensures truncation and wrapping behave correctly.
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
		items: baseItems,
		containerId: 'bag-1',
		bagName: 'Main Bag',
	},
	globals: {
		theme: 'dark',
	},
	parameters: {
		docs: {
			description: {
				story: `
Validates contrast, hover states, and badge visibility in dark mode.
        `,
			},
		},
	},
};
