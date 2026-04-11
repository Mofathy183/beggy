import { useForm } from 'react-hook-form';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import MoveItemFormUI from './MoveItemFormUI';

import {
	BagFeature,
	BagType,
	Size,
	Material,
	ContainerStatus,
} from '@beggy/shared/constants';
import type { MoveItemInput, BagDTO } from '@beggy/shared/types';

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data (Deterministic)
// ─────────────────────────────────────────────────────────────────────────────

const baseBags: BagDTO[] = [
	{
		id: 'bag-1',
		name: 'Backpack',
		containerId: 'container-2',
		type: BagType.BACKPACK,
		size: Size.SMALL,
		material: Material.NYLON,
		maxCapacity: 10,
		maxWeight: 5,
		emptyWeight: 0.7,
		features: [BagFeature.HIDDEN_POCKET, BagFeature.MULTIPLE_POCKETS],
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
				status: ContainerStatus.OK,
				reasons: [],
			},
		},
		createdAt: '2024-01-10T00:00:00.000Z',
		updatedAt: '2024-01-10T00:00:00.000Z',
		userId: null,
	},
	{
		id: 'bag-2',
		name: 'Checked Luggage',
		containerId: 'container-2',
		type: BagType.DUFFEL,
		size: Size.SMALL,
		material: Material.FABRIC,
		maxCapacity: 10,
		maxWeight: 5,
		emptyWeight: 0.7,
		features: [BagFeature.HIDDEN_POCKET, BagFeature.MULTIPLE_POCKETS],
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
				status: ContainerStatus.OK,
				reasons: [],
			},
		},
		createdAt: '2024-01-10T00:00:00.000Z',
		updatedAt: '2024-01-10T00:00:00.000Z',
		userId: null,
	},
	{
		id: 'bag-3',
		name: 'Daypack',
		containerId: 'container-2',
		type: BagType.TOTE,
		size: Size.SMALL,
		material: Material.POLYESTER,
		maxCapacity: 10,
		maxWeight: 5,
		emptyWeight: 0.7,
		features: [BagFeature.HIDDEN_POCKET, BagFeature.MULTIPLE_POCKETS],
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
				status: ContainerStatus.OK,
				reasons: [],
			},
		},
		createdAt: '2024-01-10T00:00:00.000Z',
		updatedAt: '2024-01-10T00:00:00.000Z',
		userId: null,
	},
];

const baseDefaults: MoveItemInput = {
	fromContainerId: 'bag-origin',
	toContainerId: '',
	itemId: 'item-1',
	quantity: 2,
};

// ─────────────────────────────────────────────────────────────────────────────
// Form Wrapper (MANDATORY)
// ─────────────────────────────────────────────────────────────────────────────

function FormWrapper({
	defaultValues,
	...props
}: React.ComponentProps<typeof MoveItemFormUI> & {
	defaultValues?: Partial<MoveItemInput>;
}) {
	const form = useForm<MoveItemInput>({
		defaultValues: {
			...baseDefaults,
			...defaultValues,
		},
		mode: 'onTouched',
	});

	return (
		<MoveItemFormUI
			{...props}
			form={form}
			onSubmit={(values) => props.onSubmit?.(values)}
		/>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────────────────────────────────────

const meta: Meta<typeof MoveItemFormUI> = {
	title: 'Features/Container/Form/MoveItemFormUI',
	component: MoveItemFormUI,
	tags: ['autodocs'],

	parameters: {
		docs: {
			description: {
				component: `
MoveItemFormUI is a focused transactional form that allows users to move a packed item from one bag to another.

It presents immutable context (item name and source bag) and requires the user to choose a destination bag and confirm the quantity.

---

**When to use it**
- Moving items between bags during packing
- Adjusting organization across containers
- Resolving capacity or weight distribution

**When not to use it**
- Creating or editing items
- Bulk operations across multiple items
- Managing container metadata

---

**Interaction model**
- User reviews locked context (item + source)
- Selects a destination bag
- Adjusts quantity if needed
- Confirms action via submit

---

**Constraints**
- Source bag cannot be selected as destination
- Quantity must be valid (handled externally)
- Destination list may be empty or loading
- Submission disabled while processing

---

**Accessibility guarantees**
- Proper label association for all fields
- Error messages use role="alert"
- aria-invalid and aria-describedby applied correctly
- Keyboard accessible Select and buttons
- Disabled states respected semantically

---

**Design-system notes**
- Built with shadcn primitives (Card, Field, Select)
- Token-driven styling (no hardcoded values)
- Supports narrow container layouts
- Visual hierarchy emphasizes action clarity
        `,
			},
		},
	},

	argTypes: {
		form: { table: { disable: true } },
		onSubmit: { table: { disable: true } },

		onCancel: {
			action: 'cancelled',
			description: 'Triggered when the user cancels the action.',
			table: {
				type: { summary: '() => void' },
			},
		},

		isSubmitting: {
			control: 'boolean',
			description: 'Disables interactions and shows loading state.',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},

		serverError: {
			control: 'text',
			description: 'Server-side error message displayed to the user.',
			table: {
				type: { summary: 'string | null' },
			},
		},

		serverSuggestion: {
			control: 'text',
			description: 'Helpful suggestion paired with server error.',
			table: {
				type: { summary: 'string | null' },
			},
		},

		itemName: {
			control: 'text',
			description: 'Name of the item being moved (read-only).',
			table: {
				type: { summary: 'string' },
			},
		},

		fromBagName: {
			control: 'text',
			description: 'Source bag name (read-only).',
			table: {
				type: { summary: 'string' },
			},
		},

		targetBags: {
			control: 'object',
			description: 'List of available destination bags.',
			table: {
				type: { summary: 'BagDTO[]' },
			},
		},

		isLoadingBags: {
			control: 'boolean',
			description: 'Indicates destination bags are loading.',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof MoveItemFormUI>;

// ─────────────────────────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Default state.
 *
 * User sees item context and selects a destination bag.
 */
export const Default: Story = {
	render: (args) => <FormWrapper {...args} />,
	args: {
		itemName: 'Travel Adapter',
		fromBagName: 'Main Bag',
		targetBags: baseBags,
	},
	parameters: {
		docs: {
			description: {
				story: `
Initial state where the user must choose a destination bag and confirm the move.

No validation errors are visible yet.
        `,
			},
		},
	},
};

/**
 * Prefilled destination.
 *
 * User has already selected a target bag.
 */
export const WithSelection: Story = {
	render: (args) => (
		<FormWrapper {...args} defaultValues={{ toContainerId: 'bag-2' }} />
	),
	args: {
		itemName: 'Travel Adapter',
		fromBagName: 'Main Bag',
		targetBags: baseBags,
	},
	parameters: {
		docs: {
			description: {
				story: `
Represents a partially completed form where a destination has already been selected.

Useful for edit or retry flows.
        `,
			},
		},
	},
};

/**
 * Validation error state.
 *
 * Destination is required but missing.
 */
export const ErrorState: Story = {
	render: (args) => (
		<FormWrapper {...args} defaultValues={{ toContainerId: '' }} />
	),
	args: {
		itemName: 'Travel Adapter',
		fromBagName: 'Main Bag',
		targetBags: baseBags,
	},
	parameters: {
		docs: {
			description: {
				story: `
Shows validation feedback when required fields are missing.

Error message is announced via role="alert".
        `,
			},
		},
	},
};

/**
 * Server error state.
 *
 * Backend rejected the operation.
 */
export const ServerError: Story = {
	render: (args) => <FormWrapper {...args} />,
	args: {
		itemName: 'Travel Adapter',
		fromBagName: 'Main Bag',
		targetBags: baseBags,
		serverError: 'That bag is already full.',
		serverSuggestion: 'Try moving fewer items or pick another bag.',
	},
	parameters: {
		docs: {
			description: {
				story: `
Displays server-side failure after submission.

Includes actionable suggestion to guide recovery.
        `,
			},
		},
	},
};

/**
 * Loading state.
 *
 * Destination bags are being fetched.
 */
export const LoadingState: Story = {
	render: (args) => <FormWrapper {...args} />,
	args: {
		itemName: 'Travel Adapter',
		fromBagName: 'Main Bag',
		targetBags: [],
		isLoadingBags: true,
	},
	parameters: {
		docs: {
			description: {
				story: `
Destination list is loading.

Select is disabled and communicates loading state via placeholder.
        `,
			},
		},
	},
};

/**
 * Empty state.
 *
 * No available destination bags.
 */
export const Empty: Story = {
	render: (args) => <FormWrapper {...args} />,
	args: {
		itemName: 'Travel Adapter',
		fromBagName: 'Main Bag',
		targetBags: [],
	},
	parameters: {
		docs: {
			description: {
				story: `
No other bags are available to move the item into.

User is blocked from completing the action.
        `,
			},
		},
	},
};

/**
 * Submitting state.
 *
 * Interaction is locked during submission.
 */
export const Submitting: Story = {
	render: (args) => <FormWrapper {...args} />,
	args: {
		itemName: 'Travel Adapter',
		fromBagName: 'Main Bag',
		targetBags: baseBags,
		isSubmitting: true,
	},
	parameters: {
		docs: {
			description: {
				story: `
Form is in progress.

All interactions are disabled and submit button shows loading state.
        `,
			},
		},
	},
};

/**
 * Narrow container.
 *
 * Layout stress test for small widths.
 */
export const NarrowContainer: Story = {
	render: (args) => (
		<div className="max-w-xs">
			<FormWrapper {...args} />
		</div>
	),
	args: {
		itemName: 'Travel Adapter',
		fromBagName: 'Main Bag',
		targetBags: baseBags,
	},
	parameters: {
		docs: {
			description: {
				story: `
Validates layout behavior in constrained widths.

Ensures spacing, wrapping, and readability remain intact.
        `,
			},
		},
	},
};

/**
 * Dark mode validation.
 *
 * Ensures contrast and readability in dark theme.
 */
export const DarkMode: Story = {
	render: (args) => <FormWrapper {...args} />,
	args: {
		itemName: 'Travel Adapter',
		fromBagName: 'Main Bag',
		targetBags: baseBags,
	},
	globals: {
		theme: 'dark',
	},
	parameters: {
		docs: {
			description: {
				story: `
Validates token usage, contrast, and focus visibility in dark mode.

All interactive states must remain accessible.
        `,
			},
		},
	},
};
