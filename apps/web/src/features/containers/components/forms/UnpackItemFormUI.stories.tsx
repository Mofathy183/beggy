import { useForm } from 'react-hook-form';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import UnpackItemFormUI from './UnpackItemFormUI';

import type { UnpackItemInput } from '@beggy/shared/types';

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data (Deterministic)
// ─────────────────────────────────────────────────────────────────────────────

const baseDefaults: UnpackItemInput = {
	itemId: 'item-1',
	quantity: 2,
};

// ─────────────────────────────────────────────────────────────────────────────
// Form Wrapper (MANDATORY)
// ─────────────────────────────────────────────────────────────────────────────

function FormWrapper({
	defaultValues,
	...props
}: React.ComponentProps<typeof UnpackItemFormUI> & {
	defaultValues?: Partial<UnpackItemInput>;
}) {
	const form = useForm<UnpackItemInput>({
		defaultValues: {
			...baseDefaults,
			...defaultValues,
		},
		mode: 'onTouched',
	});

	return (
		<UnpackItemFormUI
			{...props}
			form={form}
			onSubmit={(values) => props.onSubmit?.(values)}
		/>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────────────────────────────────────

const meta: Meta<typeof UnpackItemFormUI> = {
	title: 'Features/Container/Form/UnpackItemFormUI',
	component: UnpackItemFormUI,
	tags: ['autodocs'],

	parameters: {
		docs: {
			description: {
				component: `
UnpackItemFormUI allows users to remove a quantity of an already packed item from a container.

The item context is locked, and the user’s only decision is how many units to remove.

---

**When to use it**
- Removing items from a bag or suitcase
- Adjusting packing quantities
- Undoing or correcting packing actions

**When not to use it**
- Moving items between containers
- Adding new items
- Editing item metadata

---

**Interaction model**
- User reviews locked item context
- Adjusts quantity within allowed bounds
- Confirms removal via destructive action

---

**Constraints**
- Item is always read-only
- Quantity must not exceed available amount
- Minimum quantity is 1
- Submission disabled during processing

---

**Accessibility guarantees**
- Read-only input clearly communicates locked context
- Error messages use role="alert"
- aria-describedby connects form description
- Keyboard navigation supported
- Disabled states are semantic

---

**Design-system notes**
- Uses destructive action styling to signal removal
- Token-based styling ensures theme consistency
- Layout supports narrow containers
- Emphasis on clarity and irreversible action awareness
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

		itemName: {
			control: 'text',
			description: 'Name of the item being removed (read-only).',
			table: {
				type: { summary: 'string' },
			},
		},

		maxQuantity: {
			control: 'number',
			description: 'Maximum quantity available to remove.',
			table: {
				type: { summary: 'number' },
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof UnpackItemFormUI>;

// ─────────────────────────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Default state.
 *
 * User chooses how many items to remove.
 */
export const Default: Story = {
	render: (args) => <FormWrapper {...args} />,
	args: {
		itemName: 'T-Shirt',
		maxQuantity: 5,
	},
	parameters: {
		docs: {
			description: {
				story: `
Initial state where the user decides how many items to remove.

The item context is locked and clearly displayed.
        `,
			},
		},
	},
};

/**
 * Partial removal.
 *
 * User reduces quantity before confirming.
 */
export const PartialQuantity: Story = {
	render: (args) => <FormWrapper {...args} defaultValues={{ quantity: 2 }} />,
	args: {
		itemName: 'T-Shirt',
		maxQuantity: 5,
	},
	parameters: {
		docs: {
			description: {
				story: `
Represents removing only part of the available quantity.

Useful for incremental adjustments.
        `,
			},
		},
	},
};

/**
 * Maximum removal.
 *
 * User removes all available items.
 */
export const MaxQuantity: Story = {
	render: (args) => <FormWrapper {...args} defaultValues={{ quantity: 5 }} />,
	args: {
		itemName: 'T-Shirt',
		maxQuantity: 5,
	},
	parameters: {
		docs: {
			description: {
				story: `
User selects the full available quantity.

This effectively clears the item from the container.
        `,
			},
		},
	},
};

/**
 * Validation error.
 *
 * Invalid quantity entered.
 */
export const ErrorState: Story = {
	render: (args) => <FormWrapper {...args} defaultValues={{ quantity: 0 }} />,
	args: {
		itemName: 'T-Shirt',
		maxQuantity: 5,
	},
	parameters: {
		docs: {
			description: {
				story: `
Displays validation feedback when quantity is invalid.

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
		itemName: 'T-Shirt',
		maxQuantity: 5,
		serverError: 'Unable to remove items right now.',
		serverSuggestion: 'Try again in a moment or reduce the quantity.',
	},
	parameters: {
		docs: {
			description: {
				story: `
Shows backend failure with guidance for recovery.
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
		itemName: 'T-Shirt',
		maxQuantity: 5,
		isSubmitting: true,
	},
	parameters: {
		docs: {
			description: {
				story: `
Form is processing the removal.

All interactions are disabled and button shows loading.
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
		itemName: 'T-Shirt',
		maxQuantity: 5,
	},
	parameters: {
		docs: {
			description: {
				story: `
Tests layout under constrained width.

Ensures readability and spacing remain intact.
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
		itemName: 'T-Shirt',
		maxQuantity: 5,
	},
	globals: {
		theme: 'dark',
	},
	parameters: {
		docs: {
			description: {
				story: `
Validates destructive action visibility, contrast, and focus states in dark mode.
        `,
			},
		},
	},
};
