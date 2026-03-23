import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import DashboardStats from './DashboardStats';
import type { ItemStatsDto, ItemCategoryStatsDto } from '@beggy/shared/types';
import { ItemCategory } from '@beggy/shared/constants';

// ─── Deterministic Mock Data ──────────────────────────────────────────────────

const mockStats: ItemStatsDto = {
	totalItems: 42,
	totalFragileItems: 8,
};

const mockTopCategory: ItemCategoryStatsDto = {
	category: ItemCategory.CLOTHING,
	count: 18,
};

const emptyStats: ItemStatsDto = {
	totalItems: 0,
	totalFragileItems: 0,
};

// ─── Meta ────────────────────────────────────────────────────────────────────

const meta: Meta<typeof DashboardStats> = {
	title: 'Features/Dashboard/Stats/DashboardStats',
	component: DashboardStats,
	tags: ['autodocs'],
	globals: {
		theme: 'light',
	},
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component: `
### What it is
A dashboard overview component that summarizes key item metrics using compact stat cards.

### When to use it
- Dashboard home screens
- High-level summaries of user data
- Entry point for understanding data distribution

### When NOT to use it
- Detailed analytics or charts
- Drill-down data exploration
- Real-time monitoring dashboards

### Interaction model
- This component is non-interactive
- Users passively consume summarized information
- Error state provides retry action

### Constraints
- Fixed number of stat cards (4)
- Values may fallback to "—" when unavailable
- Text-based stats use different visual hierarchy than numeric ones
- Layout adapts from 2 → 4 columns based on viewport

### Accessibility guarantees
- Semantic structure using headings and text
- Icons are decorative and do not carry meaning alone
- Error state provides actionable recovery
- Content remains readable across all states

### Design-system notes
- Token-based colors for icon states (primary, destructive, success, warning)
- Skeletons mirror final layout to prevent layout shift
- Uses consistent spacing and typography scale
- Supports dark mode via tokens
        `,
			},
		},
	},

	argTypes: {
		stats: {
			description: 'Aggregated item statistics.',
			table: { type: { summary: 'ItemStatsDto | undefined' } },
			control: false,
		},
		topCategory: {
			description: 'Most used category with count.',
			table: { type: { summary: 'ItemCategoryStatsDto | undefined' } },
			control: false,
		},
		totalCategories: {
			description: 'Number of categories currently used.',
			table: { type: { summary: 'number | undefined' } },
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
	},
};

export default meta;

type Story = StoryObj<typeof DashboardStats>;

// ─── Shared Actions ───────────────────────────────────────────────────────────

const actions = {
	onRetry: () => {},
};

// ─── Stories ──────────────────────────────────────────────────────────────────

/**
 * Default state.
 *
 * Displays fully populated stats.
 */
export const Default: Story = {
	args: {
		stats: mockStats,
		topCategory: mockTopCategory,
		totalCategories: 5,
		isLoading: false,
		isError: false,
		...actions,
	},
	parameters: {
		docs: {
			description: {
				story: 'Standard state showing all stat cards with meaningful data. Includes numeric and text-based values.',
			},
		},
	},
};

/**
 * Loading state.
 *
 * Skeleton layout mirrors final cards.
 */
export const LoadingState: Story = {
	args: {
		stats: undefined,
		topCategory: undefined,
		totalCategories: undefined,
		isLoading: true,
		isError: false,
		...actions,
	},
	parameters: {
		docs: {
			description: {
				story: 'Displays skeleton placeholders while stats are loading. Prevents layout shift by matching final structure.',
			},
		},
	},
};

/**
 * Empty data state.
 *
 * Represents no items in the system.
 */
export const EmptyData: Story = {
	args: {
		stats: emptyStats,
		topCategory: undefined,
		totalCategories: 0,
		isLoading: false,
		isError: false,
		...actions,
	},
	parameters: {
		docs: {
			description: {
				story: 'Displayed when no items exist. Stat values fall back to zero or placeholder values, and messaging reflects empty state.',
			},
		},
	},
};

/**
 * Partial data.
 *
 * Some stats unavailable.
 */
export const PartialData: Story = {
	args: {
		stats: mockStats,
		topCategory: undefined,
		totalCategories: 3,
		isLoading: false,
		isError: false,
		...actions,
	},
	parameters: {
		docs: {
			description: {
				story: 'Demonstrates fallback behavior when some data is missing. Cards gracefully display placeholders.',
			},
		},
	},
};

/**
 * Narrow container.
 *
 * Tests responsive layout.
 */
export const NarrowContainer: Story = {
	render: (args) => (
		<div className="w-[320px]">
			<DashboardStats {...args} />
		</div>
	),
	args: {
		stats: mockStats,
		topCategory: mockTopCategory,
		totalCategories: 5,
		isLoading: false,
		isError: false,
		...actions,
	},
	parameters: {
		docs: {
			description: {
				story: 'Validates responsive behavior where layout collapses to two columns in constrained width.',
			},
		},
	},
};

/**
 * In dashboard context.
 *
 * Validates spacing and hierarchy.
 */
export const InDashboardContext: Story = {
	render: (args) => (
		<div className="max-w-4xl space-y-6">
			<div className="h-10 w-48 rounded bg-muted" />
			<DashboardStats {...args} />
		</div>
	),
	args: {
		stats: mockStats,
		topCategory: mockTopCategory,
		totalCategories: 5,
		isLoading: false,
		isError: false,
		...actions,
	},
	parameters: {
		docs: {
			description: {
				story: 'Shows component inside a dashboard layout to validate spacing, grouping, and visual hierarchy.',
			},
		},
	},
};

/**
 * Dark mode.
 *
 * Ensures contrast and token usage.
 */
export const DarkMode: Story = {
	args: {
		stats: mockStats,
		topCategory: mockTopCategory,
		totalCategories: 5,
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
				story: 'Validates dark mode rendering including icon contrast, text readability, and card surfaces.',
			},
		},
	},
};
