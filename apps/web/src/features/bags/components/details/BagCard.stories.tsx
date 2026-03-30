import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import BagCard from './BagCard';
import type { BagDTO } from '@beggy/shared/types';
import { BagFeature, BagType, Size, Material } from '@beggy/shared/constants';

// ───────────────────────────────────────────────────────────────────────────────
// Deterministic Mock Data
// ───────────────────────────────────────────────────────────────────────────────

const baseBag: BagDTO = {
	id: 'bag-1',
	name: 'Urban Travel Backpack with Extended Storage Compartment',
	type: BagType.BACKPACK,
	size: Size.MEDIUM,
	material: Material.NYLON,
	maxCapacity: 30,
	maxWeight: 10,
	emptyWeight: 1.2,
	features: [
		BagFeature.WATERPROOF,
		BagFeature.TROLLEY_SLEEVE,
		BagFeature.EXPANDABLE,
	],
	status: {
		metrics: {
			currentWeight: 5,
			currentCapacity: 15,
			remainingWeight: 5,
			remainingCapacity: 15,
			weightPercentage: 50,
			capacityPercentage: 50,
			itemCount: 6,
		},
		state: {
			isOverweight: false,
			isOverCapacity: false,
			isFull: false,
			status: 'HEALTHY' as any,
			reasons: [],
		},
	},
	createdAt: '2024-01-10T00:00:00.000Z',
	updatedAt: '2024-01-10T00:00:00.000Z',
	userId: null,
};

// ───────────────────────────────────────────────────────────────────────────────
// Meta
// ───────────────────────────────────────────────────────────────────────────────

const meta: Meta<typeof BagCard> = {
	title: 'Features/Bags/Card/BagCard',
	component: BagCard,
	tags: ['autodocs'],

	parameters: {
		docs: {
			description: {
				component: `
A composite card representing a physical bag, designed for dense yet scannable presentation inside grid-based layouts.

---

### What it is
A structured UI container that communicates identity, constraints, material properties, and real-time usage of a bag.

---

### When to use it
- Bags overview grids
- Container comparison views
- Inventory dashboards
- Selection UIs for packing workflows

---

### When not to use it
- Editable form contexts
- Deep inspection views (use a dedicated detail page)
- Extremely narrow layouts without wrapping support

---

### Interaction model
- Actions are accessed via overflow menu (edit/delete)
- Hover introduces elevation feedback
- Card becomes non-interactive during deletion
- All badges and chips are informational only

---

### Constraints
- Title is line-clamped to 2 lines
- Feature chips capped at 3 + overflow indicator
- Material and size badges are optional but should not overflow layout
- Status panel must remain stable even if data is null
- Stats fallback to "—" when unavailable

---

### Accessibility guarantees
- Semantic heading for bag name
- Badge icons include aria-labels
- Keyboard-accessible action menu
- Disabled state blocks interaction and communicates visually
- Status panel conveys meaning through structure and progress indicators

---

### Design-system notes
- Token-driven styling (Tailwind v4)
- Badge composition defines metadata hierarchy (type → size → material)
- Visual density optimized for grid layouts
- Consistent spacing and separation via design tokens
- Supports wrapping without breaking hierarchy
        `,
			},
		},
	},

	argTypes: {
		bag: {
			description: 'Bag data rendered inside the card.',
			table: { type: { summary: 'BagDTO' } },
		},
		onEdit: {
			description: 'Triggered when edit action is selected.',
			table: { type: { summary: '(bag: BagDTO) => void' } },
		},
		onDelete: {
			description: 'Triggered when delete action is selected.',
			table: { type: { summary: '(bag: BagDTO) => void' } },
		},
		isUpdating: {
			control: 'boolean',
			description: 'Displays loading state for update actions.',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},
		isDeleting: {
			control: 'boolean',
			description: 'Locks and dims the card during deletion.',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},

		className: { table: { disable: true } },
	},

	args: {
		bag: baseBag,
		onEdit: () => {},
		onDelete: () => {},
	},
};

export default meta;

type Story = StoryObj<typeof BagCard>;

// ───────────────────────────────────────────────────────────────────────────────
// Stories
// ───────────────────────────────────────────────────────────────────────────────

/**
 * Default balanced state.
 *
 * Represents a healthy bag with all metadata visible.
 */
export const Default: Story = {
	parameters: {
		docs: {
			description: {
				story: 'Baseline state with type, size, material, and balanced usage metrics.',
			},
		},
	},
};

/**
 * Missing optional metadata.
 *
 * Material is absent and features are minimal.
 */
export const MinimalMetadata: Story = {
	args: {
		bag: {
			...baseBag,
			material: null,
			features: [],
		},
	},
	parameters: {
		docs: {
			description: {
				story: 'Shows how the card adapts when optional metadata like material or features are not provided.',
			},
		},
	},
};

/**
 * High utilization nearing limits.
 */
export const NearLimit: Story = {
	args: {
		bag: {
			...baseBag,
			status: {
				...baseBag.status!,
				metrics: {
					...baseBag.status!.metrics,
					weightPercentage: 92,
					capacityPercentage: 88,
				},
			},
		},
	},
	parameters: {
		docs: {
			description: {
				story: 'Indicates approaching limits to help users proactively adjust contents.',
			},
		},
	},
};

/**
 * Constraint violation state.
 */
export const Overloaded: Story = {
	args: {
		bag: {
			...baseBag,
			status: {
				...baseBag.status!,
				metrics: {
					...baseBag.status!.metrics,
					weightPercentage: 120,
					capacityPercentage: 115,
				},
				state: {
					...baseBag.status!.state,
					isOverweight: true,
					isOverCapacity: true,
				},
			},
		},
	},
	parameters: {
		docs: {
			description: {
				story: 'Represents a failure state where constraints are exceeded and user action is required.',
			},
		},
	},
};

/**
 * Deleting state.
 *
 * Card becomes visually dimmed and non-interactive.
 */
export const Deleting: Story = {
	args: {
		isDeleting: true,
	},
	parameters: {
		docs: {
			description: {
				story: 'Prevents interaction and signals an in-progress destructive action.',
			},
		},
	},
};

/**
 * Narrow layout stress test.
 */
export const NarrowContainer: Story = {
	render: (args) => (
		<div className="w-[260px]">
			<BagCard {...args} />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Validates wrapping, truncation, and badge stacking under constrained width.',
			},
		},
	},
};

/**
 * Dark mode validation.
 */
export const DarkMode: Story = {
	globals: {
		theme: 'dark',
	},
	parameters: {
		docs: {
			description: {
				story: 'Ensures correct token usage, contrast, and visual hierarchy in dark mode.',
			},
		},
	},
};
