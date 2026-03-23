import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ItemCategory } from '@beggy/shared/constants';
import RecentItems from './RecentItems';
import type { RecentItemDto } from '@beggy/shared/types';

// ─── Deterministic Mock Data ──────────────────────────────────────────────────

const mockItems: RecentItemDto[] = [
	{
		id: '1',
		name: 'Merino wool sweater',
		category: ItemCategory.CLOTHING,
		createdAt: '2024-01-01T00:00:00.000Z',
	},
	{
		id: '2',
		name: 'Sony WH-1000XM5',
		category: ItemCategory.ELECTRONICS,
		createdAt: '2024-01-02T00:00:00.000Z',
	},
	{
		id: '3',
		name: 'Skincare travel kit',
		category: ItemCategory.TOILETRIES,
		createdAt: '2024-01-03T00:00:00.000Z',
	},
	{
		id: '4',
		name: 'Leather card wallet',
		category: ItemCategory.ACCESSORIES,
		createdAt: '2024-01-04T00:00:00.000Z',
	},
];

const manyItems: RecentItemDto[] = Array.from({ length: 10 }).map((_, i) => ({
	id: `item-${i}`,
	name: `Item ${i + 1}`,
	category: ItemCategory.CLOTHING,
	createdAt: '2024-01-01T00:00:00.000Z',
}));

// ─── Meta ────────────────────────────────────────────────────────────────────

const meta: Meta<typeof RecentItems> = {
	title: 'Features/Dashboard/Card/RecentItems',
	component: RecentItems,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component: `
### What it is
A state-driven dashboard section that displays recently added items with contextual actions and responsive layout.

### When to use it
- Dashboard overview pages
- Entry point to item management flows
- Quick-access panels for recent activity

### When NOT to use it
- Full item management screens
- Data-heavy tables with sorting/filtering
- Real-time or streaming interfaces

### Interaction model
- “View all” triggers navigation to full list
- Cards expose edit and delete actions
- Empty state provides primary creation action
- Error state enables retry flow

### Constraints
- Grid density adapts to viewport size
- No inline editing — actions navigate outward
- Skeleton count is fixed for layout stability
- Requires valid category mapping

### Accessibility guarantees
- All actions are keyboard accessible
- Buttons have clear, descriptive labels
- Empty and error states provide actionable guidance
- Logical reading order preserved in grid

### Design-system notes
- Token-based styling (no hardcoded colors)
- Skeletons mirror final layout (no layout shift)
- Responsive grid system across breakpoints
- Composed from reusable primitives
        `,
			},
		},
	},

	argTypes: {
		items: {
			description: 'List of recent items to display.',
			table: { type: { summary: 'RecentItemDto[]' } },
			control: false,
		},

		isLoading: {
			control: 'boolean',
			description: 'Displays loading skeletons.',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},

		isError: {
			control: 'boolean',
			description: 'Displays error state with retry.',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},

		onRetry: {
			description: 'Triggered when retry is activated.',
			table: { type: { summary: '() => void' } },
			control: false,
		},

		onViewAll: {
			description: 'Triggered when "View all" is clicked.',
			table: { type: { summary: '() => void' } },
			control: false,
		},

		onEdit: {
			description: 'Triggered when editing an item.',
			table: { type: { summary: '(id: string) => void' } },
			control: false,
		},

		onDelete: {
			description: 'Triggered when deleting an item.',
			table: { type: { summary: '(id: string) => void' } },
			control: false,
		},

		onAddItem: {
			description: 'Triggered from empty state CTA.',
			table: { type: { summary: '() => void' } },
			control: false,
		},
	},
};

export default meta;

type Story = StoryObj<typeof RecentItems>;

// ─── Shared Actions ───────────────────────────────────────────────────────────

const actions = {
	onRetry: () => {},
	onViewAll: () => {},
	onEdit: () => {},
	onDelete: () => {},
	onAddItem: () => {},
};

// ─── Stories ──────────────────────────────────────────────────────────────────

/**
 * Default state.
 *
 * Displays recent items with full interaction surface.
 */
export const Default: Story = {
	args: {
		items: mockItems,
		isLoading: false,
		isError: false,
		...actions,
	},
	parameters: {
		docs: {
			description: {
				story: 'Standard state showing recent items. Users can navigate, edit, or delete directly from the grid.',
			},
		},
	},
};

/**
 * Loading state.
 *
 * Skeleton layout prevents visual shift.
 */
export const LoadingState: Story = {
	args: {
		items: [],
		isLoading: true,
		isError: false,
		...actions,
	},
	parameters: {
		docs: {
			description: {
				story: 'Displays skeleton placeholders while data is loading. Layout matches final grid structure.',
			},
		},
	},
};

/**
 * Empty state.
 *
 * Encourages first item creation.
 */
export const Empty: Story = {
	args: {
		items: [],
		isLoading: false,
		isError: false,
		...actions,
	},
	parameters: {
		docs: {
			description: {
				story: 'Displayed when no items exist. Provides a clear call-to-action to add a new item.',
			},
		},
	},
};

/**
 * Dense grid.
 *
 * Validates responsive wrapping and spacing.
 */
export const ManyItems: Story = {
	args: {
		items: manyItems,
		isLoading: false,
		isError: false,
		...actions,
	},
	parameters: {
		docs: {
			description: {
				story: 'Shows how the component behaves with many items. Ensures grid density and wrapping remain stable.',
			},
		},
	},
};

/**
 * Narrow container.
 *
 * Tests layout under constrained width.
 */
export const NarrowContainer: Story = {
	render: (args) => (
		<div className="w-[320px]">
			<RecentItems {...args} />
		</div>
	),
	args: {
		items: mockItems,
		isLoading: false,
		isError: false,
		...actions,
	},
	parameters: {
		docs: {
			description: {
				story: 'Simulates constrained layout to validate responsiveness and usability.',
			},
		},
	},
};

/**
 * In dashboard context.
 *
 * Validates hierarchy and spacing in real layout.
 */
export const InDashboardContext: Story = {
	render: (args) => (
		<div className="max-w-3xl space-y-6">
			<div className="h-10 w-40 rounded bg-muted" />
			<RecentItems {...args} />
		</div>
	),
	args: {
		items: mockItems,
		isLoading: false,
		isError: false,
		...actions,
	},
	parameters: {
		docs: {
			description: {
				story: 'Shows component inside a dashboard layout to validate spacing and visual hierarchy.',
			},
		},
	},
};

/**
 * Dark mode.
 *
 * Ensures token-based styling works correctly.
 */
export const DarkMode: Story = {
	args: {
		items: mockItems,
		isLoading: false,
		isError: false,
		...actions,
	},
	globals: {
		theme: 'dark',
	},
	parameters: {
		docs: {
			description: {
				story: 'Validates dark mode including contrast, skeleton visibility, and action clarity.',
			},
		},
	},
};
