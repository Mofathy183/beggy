import { useForm } from 'react-hook-form';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import PackItemFormUI from './PackItemFormUI';

import { ItemCategory, WeightUnit, VolumeUnit } from '@beggy/shared/constants';
import type { PackItemInput, ItemDTO } from '@beggy/shared/types';

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data (Deterministic)
// ─────────────────────────────────────────────────────────────────────────────

const baseItems: ItemDTO[] = [
	{
		id: 'item-1',
		name: 'T-Shirt',
		category: ItemCategory.CLOTHING,
		color: 'navy',
		weight: 0.2,
		weightUnit: WeightUnit.GRAM,
		volume: 0.3,
		volumeUnit: VolumeUnit.LITER,
		isFragile: false,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: 'item-2',
		name: 'Batman The Dark Knight Returns',
		category: ItemCategory.BOOKS,
		color: 'navy',
		weight: 0.8,
		weightUnit: WeightUnit.KILOGRAM,
		volume: 0.3,
		volumeUnit: VolumeUnit.LITER,
		isFragile: false,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: 'item-3',
		name: 'Laptop',
		category: ItemCategory.ELECTRONICS,
		color: 'navy',
		weight: 0.2,
		weightUnit: WeightUnit.KILOGRAM,
		volume: 0.3,
		volumeUnit: VolumeUnit.LITER,
		isFragile: false,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
];

const baseDefaults: PackItemInput = {
	itemId: '',
	quantity: 1,
};

// ─────────────────────────────────────────────────────────────────────────────
// Form Wrapper (MANDATORY)
// ─────────────────────────────────────────────────────────────────────────────

function FormWrapper({
	defaultValues,
	...props
}: React.ComponentProps<typeof PackItemFormUI> & {
	defaultValues?: Partial<PackItemInput>;
}) {
	const form = useForm<PackItemInput>({
		defaultValues: {
			...baseDefaults,
			...defaultValues,
		},
		mode: 'onTouched',
	});

	return (
		<PackItemFormUI
			{...props}
			form={form}
			onSubmit={(values) => props.onSubmit?.(values)}
		/>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────────────────────────────────────

const meta: Meta<typeof PackItemFormUI> = {
	title: 'Features/Container/Form/PackItemFormUI',
	component: PackItemFormUI,
	tags: ['autodocs'],

	parameters: {
		docs: {
			description: {
				component: `
PackItemFormUI allows users to add an item into a container by selecting the item and specifying its quantity.

It adapts based on context:
- Standard mode → user selects an item
- Locked mode → item is preselected and cannot be changed

---

**When to use it**
- Adding items into a bag or suitcase
- Quick packing workflows
- Drag-and-drop flows (locked item)

**When not to use it**
- Editing existing packed items
- Moving items between containers
- Bulk item operations

---

**Interaction model**
- User selects an item (unless locked)
- Adjusts quantity
- Submits action to pack item

---

**Constraints**
- Item selection required (unless locked)
- Quantity must be valid (handled externally)
- Select disabled during loading
- Locked mode replaces Select with read-only input

---

**Accessibility guarantees**
- Proper label association
- Error messages use role="alert"
- aria-invalid and aria-describedby applied
- Keyboard accessible Select
- Disabled states are semantic

---

**Design-system notes**
- Built with shadcn primitives
- Token-based styling (no hardcoded colors)
- Supports narrow layouts
- Handles dual-mode UI (select vs locked display)
        `,
			},
		},
	},

	argTypes: {
		form: { table: { disable: true } },
		onSubmit: { table: { disable: true } },

		onCancel: {
			action: 'cancelled',
			description: 'Triggered when user cancels the action.',
			table: {
				type: { summary: '() => void' },
			},
		},

		isSubmitting: {
			control: 'boolean',
			description: 'Disables interaction and shows loading state.',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},

		serverError: {
			control: 'text',
			description: 'Server-side error message.',
			table: {
				type: { summary: 'string | null' },
			},
		},

		serverSuggestion: {
			control: 'text',
			description: 'Helpful suggestion for server error.',
			table: {
				type: { summary: 'string | null' },
			},
		},

		items: {
			control: 'object',
			description: 'List of selectable items.',
			table: {
				type: { summary: 'ItemDTO[]' },
			},
		},

		isLoadingItems: {
			control: 'boolean',
			description: 'Indicates items are loading.',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},

		lockedItemId: {
			control: 'text',
			description: 'Locks the item selection.',
			table: {
				type: { summary: 'string | undefined' },
			},
		},

		lockedItemName: {
			control: 'text',
			description: 'Display name for locked item.',
			table: {
				type: { summary: 'string | undefined' },
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof PackItemFormUI>;

// ─────────────────────────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Default state.
 *
 * User selects an item and quantity.
 */
export const Default: Story = {
	render: (args) => <FormWrapper {...args} />,
	args: {
		items: baseItems,
	},
	parameters: {
		docs: {
			description: {
				story: `
Initial state where user must select an item and specify quantity.

No validation errors are shown yet.
        `,
			},
		},
	},
};

/**
 * Item selected.
 *
 * User already chose an item.
 */
export const WithSelection: Story = {
	render: (args) => (
		<FormWrapper {...args} defaultValues={{ itemId: 'item-2' }} />
	),
	args: {
		items: baseItems,
	},
	parameters: {
		docs: {
			description: {
				story: `
Represents a partially completed form with an item already selected.

Common in edit or retry flows.
        `,
			},
		},
	},
};

/**
 * Locked item (drag & drop).
 *
 * Item cannot be changed.
 */
export const LockedItem: Story = {
	render: (args) => (
		<FormWrapper {...args} defaultValues={{ itemId: 'item-1' }} />
	),
	args: {
		items: baseItems,
		lockedItemId: 'item-1',
		lockedItemName: 'T-Shirt',
	},
	parameters: {
		docs: {
			description: {
				story: `
Used in drag-and-drop flows where the item is already determined.

Select is replaced with a read-only input.
        `,
			},
		},
	},
};

/**
 * Validation error.
 *
 * Required fields missing.
 */
export const ErrorState: Story = {
	render: (args) => <FormWrapper {...args} defaultValues={{ itemId: '' }} />,
	args: {
		items: baseItems,
	},
	parameters: {
		docs: {
			description: {
				story: `
Displays validation errors when required fields are missing.

Errors are announced via role="alert".
        `,
			},
		},
	},
};

/**
 * Server error.
 */
export const ServerError: Story = {
	render: (args) => <FormWrapper {...args} />,
	args: {
		items: baseItems,
		serverError: 'This bag cannot carry more weight.',
		serverSuggestion: 'Try reducing quantity or choose another bag.',
	},
	parameters: {
		docs: {
			description: {
				story: `
Displays backend failure with actionable guidance.
        `,
			},
		},
	},
};

/**
 * Loading state.
 *
 * Items are being fetched.
 */
export const LoadingState: Story = {
	render: (args) => <FormWrapper {...args} />,
	args: {
		items: [],
		isLoadingItems: true,
	},
	parameters: {
		docs: {
			description: {
				story: `
Item list is loading.

Select is disabled and communicates loading via placeholder.
        `,
			},
		},
	},
};

/**
 * Submitting state.
 */
export const Submitting: Story = {
	render: (args) => <FormWrapper {...args} />,
	args: {
		items: baseItems,
		isSubmitting: true,
	},
	parameters: {
		docs: {
			description: {
				story: `
Form is in progress.

All interactions are disabled and submit button shows loading.
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
			<FormWrapper {...args} />
		</div>
	),
	args: {
		items: baseItems,
	},
	parameters: {
		docs: {
			description: {
				story: `
Tests layout under constrained width.

Ensures proper wrapping and spacing.
        `,
			},
		},
	},
};

/**
 * Dark mode.
 */
export const DarkMode: Story = {
	render: (args) => <FormWrapper {...args} />,
	args: {
		items: baseItems,
	},
	globals: {
		theme: 'dark',
	},
	parameters: {
		docs: {
			description: {
				story: `
Validates contrast, readability, and focus visibility in dark mode.
        `,
			},
		},
	},
};
