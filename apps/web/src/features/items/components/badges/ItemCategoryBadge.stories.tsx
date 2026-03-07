import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import ItemCategoryBadge from './ItemCategoryBadge';
import { ItemCategory } from '@beggy/shared/constants';

const meta: Meta<typeof ItemCategoryBadge> = {
	title: 'Features/Items/Badges/ItemCategoryBadge',
	component: ItemCategoryBadge,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component: `
## ItemCategoryBadge

A compact visual label that communicates the **category of an item** using a semantic color token and optional icon.

The badge maps a domain value (\`ItemCategory\`) to a **design-system semantic color** and a **human-readable label** sourced from the application's category metadata.

It helps users quickly scan item lists, suitcase inventories, or packing summaries by providing a consistent visual signal for item classification.

---

### When to use

Use \`ItemCategoryBadge\` when displaying item metadata where category context improves recognition or grouping.

Common product scenarios:

• suitcase packing lists  
• inventory summaries  
• item cards  
• search results  
• packing review screens

---

### When not to use

Do **not** use this component:

• as a primary label for an item  
• for filtering interactions  
• for user-editable category selection  
• where long text descriptions are required

This component is purely **informational**, not interactive.

---

### Interaction model

The badge itself is **non-interactive**.

Users cannot click or toggle it.  
It exists only to **visually communicate category context**.

Hover states exist only to maintain **visual feedback consistency** with other badge tokens.

---

### Constraints

• The label is always derived from the application's category mapping.  
• Unknown category values render **nothing** to avoid incorrect labeling.  
• Badge width is content-driven and should not be manually constrained.
• In compact contexts, the badge may render **icon-only**.

---

### Accessibility guarantees

The badge exposes an accessible label:

• \`role="img"\` communicates that it represents semantic meaning  
• \`aria-label\` describes the category to screen readers  
• the icon itself is hidden from assistive tech to avoid redundancy

Example:

"Category: Medicine"

This ensures assistive technology users receive the same context as sighted users.

---

### Design-system notes

• Visual styling is driven by **semantic tokens**, never raw colors.  
• Category → token mapping ensures visual consistency across the product.  
• Variants support multiple density contexts via size scaling.  
• Icons and labels are sourced from the shared category registry.

The badge should always remain **compact, readable, and visually stable** across light and dark themes.
`,
			},
		},
	},

	argTypes: {
		category: {
			control: 'select',
			options: Object.values(ItemCategory),
			description: 'The domain category represented by the badge.',
			table: {
				type: { summary: 'ItemCategory' },
			},
		},

		size: {
			control: 'radio',
			options: ['sm', 'md', 'lg'],
			description:
				'Controls badge density and icon scale for different layout contexts.',
			table: {
				type: { summary: '"sm" | "md" | "lg"' },
				defaultValue: { summary: 'md' },
			},
		},

		iconOnly: {
			control: 'boolean',
			description:
				'Renders only the category icon. Useful in compact layouts such as card headers.',
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

type Story = StoryObj<typeof ItemCategoryBadge>;

export const Default: Story = {
	args: {
		category: ItemCategory.ACCESSORIES,
	},
	parameters: {
		docs: {
			description: {
				story: 'Standard badge presentation showing both icon and label. This is the most common usage within item lists and inventory summaries.',
			},
		},
	},
};

/**
 * Icon-only rendering used in compact UI contexts.
 *
 * The badge collapses to a circular visual indicator while
 * maintaining the same semantic color mapping.
 */
export const IconOnly: Story = {
	args: {
		category: ItemCategory.ELECTRONICS,
		iconOnly: true,
		size: 'sm',
	},
	parameters: {
		docs: {
			description: {
				story: 'Compact icon-only badge used in tight layouts such as card headers or item thumbnails.',
			},
		},
	},
};

/**
 * Large badge for prominent metadata presentation.
 *
 * Used in detail views or summary cards where
 * category context is visually emphasized.
 */
export const Large: Story = {
	args: {
		category: ItemCategory.FOOD,
		size: 'lg',
	},
	parameters: {
		docs: {
			description: {
				story: 'Expanded badge size used when the category should be more visually prominent, such as in item detail pages.',
			},
		},
	},
};

/**
 * All categories overview.
 *
 * Displays every available category badge
 * to validate semantic color distribution
 * and icon consistency across the domain.
 */
export const AllCategories: Story = {
	render: () => (
		<div className="flex flex-wrap gap-2">
			{Object.values(ItemCategory).map((category) => (
				<ItemCategoryBadge key={category} category={category} />
			))}
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Displays all item categories to verify semantic color tokens and icon consistency across the system.',
			},
		},
	},
};

/**
 * Dark mode validation.
 *
 * Verifies token contrast, icon visibility,
 * and text readability on dark surfaces.
 */
export const DarkMode: Story = {
	args: {
		category: ItemCategory.SPORTS,
	},
	parameters: {
		themes: { default: 'dark' },
		docs: {
			description: {
				story: 'Validates color tokens and contrast in dark mode to ensure readability and icon clarity.',
			},
		},
	},
};
