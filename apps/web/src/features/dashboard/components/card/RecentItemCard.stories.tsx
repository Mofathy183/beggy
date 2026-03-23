import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ItemCategory } from '@beggy/shared/constants';

import RecentItemCard from './RecentItemCard';
import type { RecentItemDto } from '@beggy/shared/types';

const mockItem: RecentItemDto = {
	id: 'item-1',
	name: 'Travel Backpack',
	category: ItemCategory.BOOKS,
	createdAt: '2024-01-01T00:00:00.000Z',
};

const longNameItem: RecentItemDto = {
	...mockItem,
	name: 'Very Long Item Name That Should Truncate Properly In The Card Layout',
};

const meta: Meta<typeof RecentItemCard> = {
	title: 'Features/Dashboard/Card/RecentItemCard',
	component: RecentItemCard,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component: `
### What it is
A compact, interactive card representing a recently created item. It provides quick visual identification, metadata, and contextual actions.

### When to use it
- Dashboard “recent items” sections
- Quick access panels
- Grid-based item previews with lightweight actions

### When NOT to use it
- Detailed item views (use full item card instead)
- Lists requiring persistent actions (actions here are hover-revealed)
- Critical destructive workflows without confirmation layer

### Interaction model
- Entire card is passive (non-clickable container)
- Hover reveals contextual actions (edit, delete)
- Actions are icon-only and rely on aria-labels for clarity

### Constraints
- Name is truncated to a single line
- Actions are hidden until hover
- Designed for grid layouts, not full-width lists
- Requires valid category mapping for icon display

### Accessibility guarantees
- Action buttons are keyboard focusable
- Each action includes descriptive aria-label
- Icons are decorative except for actions
- Hover-revealed actions remain accessible via keyboard focus

### Design-system notes
- Uses token-based colors (no hardcoded values)
- Built with CVA-compatible patterns
- Relies on consistent spacing and density for grid alignment
- Supports dark mode via tokens
        `,
			},
		},
	},
	argTypes: {
		item: {
			description: 'Item data displayed in the card.',
			table: { type: { summary: 'RecentItemDto' } },
			control: false,
		},
		onEdit: {
			description: 'Triggered when the edit action is activated.',
			table: { type: { summary: '(id: string) => void' } },
			control: false,
		},
		onDelete: {
			description: 'Triggered when the delete action is activated.',
			table: { type: { summary: '(id: string) => void' } },
			control: false,
		},
	},
};

export default meta;

type Story = StoryObj<typeof RecentItemCard>;

/**
 * Default state.
 *
 * Displays a standard recent item with hover-revealed actions.
 */
export const Default: Story = {
	args: {
		item: mockItem,
		onEdit: () => {},
		onDelete: () => {},
	},
	parameters: {
		docs: {
			description: {
				story: 'The default appearance of the card. Actions are hidden until hover, and the item displays name, category, and relative date.',
			},
		},
	},
};

/**
 * Hover state (actions visible).
 *
 * Simulates user hover to reveal contextual actions.
 */
export const WithActionsVisible: Story = {
	args: {
		item: mockItem,
		onEdit: () => {},
		onDelete: () => {},
	},
	parameters: {
		pseudo: { hover: true },
		docs: {
			description: {
				story: 'Shows the hover state where edit and delete actions become visible. This represents the primary interaction mode.',
			},
		},
	},
};

/**
 * Long content handling.
 *
 * Ensures text truncation behaves correctly.
 */
export const LongName: Story = {
	args: {
		item: longNameItem,
		onEdit: () => {},
		onDelete: () => {},
	},
	parameters: {
		docs: {
			description: {
				story: 'Demonstrates how long item names are truncated to preserve layout integrity and prevent overflow.',
			},
		},
	},
};

/**
 * Keyboard accessibility state.
 *
 * Focus is placed on action buttons.
 */
export const KeyboardNavigation: Story = {
	render: (args) => (
		<div className="flex gap-4">
			<RecentItemCard {...args} />
		</div>
	),
	args: {
		item: mockItem,
		onEdit: () => {},
		onDelete: () => {},
	},
	parameters: {
		docs: {
			description: {
				story: 'Demonstrates keyboard accessibility. Action buttons are focusable and expose clear aria-labels for screen readers.',
			},
		},
	},
};

/**
 * Narrow container stress test.
 *
 * Ensures layout stability in constrained widths.
 */
export const NarrowContainer: Story = {
	render: (args) => (
		<div className="w-[140px]">
			<RecentItemCard {...args} />
		</div>
	),
	args: {
		item: mockItem,
		onEdit: () => {},
		onDelete: () => {},
	},
	parameters: {
		docs: {
			description: {
				story: 'Tests how the card behaves in tight layouts. Ensures truncation, spacing, and icon scaling remain stable.',
			},
		},
	},
};

/**
 * In-context usage.
 *
 * Card displayed inside a realistic grid layout.
 */
export const InGridContext: Story = {
	render: (args) => (
		<div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
			{Array.from({ length: 4 }).map((_, i) => (
				<RecentItemCard
					key={i}
					{...args}
					item={{
						...args.item,
						id: `item-${i}`,
						name: `Item ${i + 1}`,
					}}
				/>
			))}
		</div>
	),
	args: {
		item: mockItem,
		onEdit: () => {},
		onDelete: () => {},
	},
	parameters: {
		docs: {
			description: {
				story: 'Shows the component in a realistic grid layout as used in dashboards. Validates spacing, alignment, and density.',
			},
		},
	},
};

/**
 * Dark mode validation.
 *
 * Ensures proper contrast and token usage.
 */
export const DarkMode: Story = {
	args: {
		item: mockItem,
		onEdit: () => {},
		onDelete: () => {},
	},
	globals: {
		theme: 'dark',
	},
	parameters: {
		docs: {
			description: {
				story: 'Validates dark mode rendering, including contrast, icon visibility, hover states, and action clarity.',
			},
		},
	},
};
