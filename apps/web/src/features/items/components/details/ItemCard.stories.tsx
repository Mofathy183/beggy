import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import ItemCard from './ItemCard';

import { ItemCategory, WeightUnit, VolumeUnit } from '@beggy/shared/constants';
import type { ItemDTO } from '@beggy/shared/types';

const baseItem: ItemDTO = {
	id: 'item-1',
	name: 'Travel Toothbrush',
	category: ItemCategory.BOOKS,
	color: 'navy',
	weight: 0.2,
	weightUnit: WeightUnit.KILOGRAM,
	volume: 0.3,
	volumeUnit: VolumeUnit.LITER,
	isFragile: false,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
};

const meta: Meta<typeof ItemCard> = {
	title: 'Features/Items/Cards/ItemCard',
	component: ItemCard,
	tags: ['autodocs'],

	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component: `
## ItemCard

Displays the essential information of a packed item inside a compact card layout.

The card presents key metadata including category, name, color, weight, volume, and fragile status.  
It is primarily used in **item grids and suitcase packing lists** where users scan multiple items quickly.

The layout prioritizes **visual hierarchy and scan speed**.

---

### When to use

Use \`ItemCard\` when presenting items in a **grid or list format** where users need to review item attributes quickly.

Common scenarios:

• suitcase packing lists  
• inventory views  
• packing review screens  
• item search results

---

### When not to use

Do not use this component:

• inside dense table layouts  
• as an editable form container  
• where full item details are required

For editing or detailed inspection, navigate to a **dedicated item detail view**.

---

### Interaction model

The card itself is **non-clickable**.

Users interact through the **action menu** in the header which provides operations such as:

• edit item  
• delete item

Hover states provide subtle feedback but do not trigger navigation.

---

### Constraints

• Item name supports up to two lines before truncation.  
• Color swatches appear only when a color value is provided.  
• Fragile badge appears only when the item is marked fragile.  
• Measurements always display using symbols derived from the shared unit metadata.

---

### Accessibility guarantees

• The card exposes an \`aria-label\` identifying the item name.  
• Tooltips provide expanded measurement labels.  
• Icons are marked decorative where appropriate.  
• Action menu controls remain keyboard accessible.

---

### Design-system notes

• Built using the **shadcn Card primitive**.  
• Semantic badges communicate item category and fragile status.  
• Measurements use shared metadata tokens for unit consistency.  
• Hover states use subtle border and shadow elevation.

Cards should remain visually stable across both light and dark themes.
`,
			},
		},
	},

	argTypes: {
		item: {
			description: 'Item data displayed by the card.',
			table: {
				type: { summary: 'ItemDTO' },
			},
			control: false,
		},

		onEdit: {
			table: { disable: true },
		},

		onDelete: {
			table: { disable: true },
		},

		isUpdating: {
			control: 'boolean',
			description:
				'Disables edit action while an update request is in progress.',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},

		isDeleting: {
			control: 'boolean',
			description:
				'Disables delete action while a delete request is in progress.',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},

		className: {
			table: { disable: true },
		},
	},
};

export default meta;

type Story = StoryObj<typeof ItemCard>;

const noop = () => {};

/**
 * Default item card.
 *
 * Demonstrates the standard appearance
 * of an item inside a packing list grid.
 */
export const Default: Story = {
	args: {
		item: baseItem,
		onEdit: noop,
		onDelete: noop,
	},
	parameters: {
		docs: {
			description: {
				story: 'Standard item card showing category badge, item name, color swatch, and measurement metadata.',
			},
		},
	},
};

/**
 * Fragile item.
 *
 * The fragile indicator appears in the card footer.
 */
export const FragileItem: Story = {
	args: {
		item: {
			...baseItem,
			name: 'Glass Perfume Bottle',
			category: ItemCategory.ACCESSORIES,
			isFragile: true,
		},
		onEdit: noop,
		onDelete: noop,
	},
	parameters: {
		docs: {
			description: {
				story: 'Displays the fragile badge in the card footer when the item requires careful handling.',
			},
		},
	},
};

/**
 * Item without color metadata.
 *
 * The color swatch row is omitted.
 */
export const NoColor: Story = {
	args: {
		item: {
			...baseItem,
			color: undefined,
		},
		onEdit: noop,
		onDelete: noop,
	},
	parameters: {
		docs: {
			description: {
				story: 'Demonstrates layout behavior when the item has no associated color metadata.',
			},
		},
	},
};

/**
 * Long item name.
 *
 * Ensures text truncation behaves correctly.
 */
export const LongName: Story = {
	args: {
		item: {
			...baseItem,
			name: 'Ultra Compact Waterproof Travel Toothbrush With Protective Case',
		},
		onEdit: noop,
		onDelete: noop,
	},
	parameters: {
		docs: {
			description: {
				story: 'Validates multi-line truncation behavior for long item names.',
			},
		},
	},
};

/**
 * Narrow container stress test.
 *
 * Simulates card rendering in tight grid layouts.
 */
export const NarrowContainer: Story = {
	render: (args) => (
		<div className="w-[220px]">
			<ItemCard {...args} />
		</div>
	),
	args: {
		item: baseItem,
		onEdit: noop,
		onDelete: noop,
	},
	parameters: {
		docs: {
			description: {
				story: 'Ensures the card layout remains readable when placed in compact grid columns.',
			},
		},
	},
};

/**
 * Dark mode validation.
 *
 * Confirms color tokens and elevation styles
 * render correctly in dark themes.
 */
export const DarkMode: Story = {
	args: {
		item: baseItem,
		onEdit: noop,
		onDelete: noop,
	},
	parameters: {
		themes: { default: 'dark' },
		docs: {
			description: {
				story: 'Validates card contrast, badge visibility, and elevation styles in dark mode.',
			},
		},
	},
};
