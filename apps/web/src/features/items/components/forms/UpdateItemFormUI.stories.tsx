import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useForm } from 'react-hook-form';

import UpdateItemFormUI from './UpdateItemFormUI';

import { ItemCategory, VolumeUnit, WeightUnit } from '@beggy/shared/constants';
import type { UpdateItemInput } from '@beggy/shared/types';

/**
 * Story wrapper responsible for creating the react-hook-form instance.
 *
 * Storybook should never control the form instance directly.
 */
function FormWrapper(props: React.ComponentProps<typeof UpdateItemFormUI>) {
	const form = useForm<UpdateItemInput>({
		defaultValues: {
			name: 'Travel toothbrush',
			category: ItemCategory.TOILETRIES,
			weight: 0.2,
			weightUnit: WeightUnit.KILOGRAM,
			volume: 0.3,
			volumeUnit: VolumeUnit.LITER,
			color: 'navy',
			isFragile: false,
		},
	});

	return <UpdateItemFormUI {...props} form={form} />;
}

const meta: Meta<typeof UpdateItemFormUI> = {
	title: 'Features/Items/Forms/UpdateItemFormUI',
	component: UpdateItemFormUI,
	tags: ['autodocs'],

	parameters: {
		docs: {
			description: {
				component: `
## What this component is

**UpdateItemFormUI** renders the editable form used when a user updates an existing packing item.

The component provides the **visual structure and accessibility layer** for editing item details such as:

• item name  
• category  
• weight and unit  
• volume and unit  
• color  
• fragile status  

It does **not perform API calls or validation logic**.  
Those responsibilities belong to the form container.

---

## When to use it

Use this component when a user must **modify an existing item** in their packing inventory.

Typical product scenarios:

• editing an item inside an "Edit Item" dialog  
• modifying an item from the packing list  
• correcting item measurements after creation  

The container manages:

• loading the item data  
• form validation  
• mutation requests  
• success / failure handling  

---

## When NOT to use it

Do not use this component when:

• creating a new item (use **CreateItemFormUI**)  
• displaying item information read-only  
• editing unrelated entity types  

This component is **strictly for item updates**.

---

## Interaction model

The user interacts with the form through standard input controls:

• text input for name and color  
• chip selection for category  
• measurement inputs for weight and volume  
• a switch to mark the item as fragile  

Submitting the form triggers the container's mutation logic.

Canceling closes the surrounding dialog.

---

## Constraints

• Measurement fields require both value and unit  
• Category must match the fixed enum defined in \`@beggy/shared\`  
• Color is optional and stored as a lowercase string  
• Only changed values are sent in the PATCH request  

The layout is optimized for **dialog usage** with a maximum width.

---

## Accessibility guarantees

The component guarantees:

• label associations for all inputs  
• ARIA error messaging via \`FieldError\`  
• semantic switch control for fragile items  
• accessible alert for server errors  
• keyboard accessibility for all inputs  

All interactive elements remain **focusable and screen-reader friendly**.

---

## Design-system notes

The component follows Beggy's UI architecture:

• shadcn primitives for structure  
• token-based Tailwind styling  
• consistent Field / FieldLabel / FieldError pattern  
• Chips component for enum selections  
• shared measurement field abstraction  

Spacing and density match the **forms design system used across Beggy**.
`,
			},
		},
	},

	argTypes: {
		form: {
			table: { disable: true },
		},

		onSubmit: {
			description:
				'Callback triggered when the form is submitted successfully.',
			table: {
				type: { summary: '(values: UpdateItemInput) => void' },
			},
			action: 'submitted',
		},

		onCancel: {
			description: 'Called when the user presses the Cancel button.',
			table: {
				type: { summary: '() => void' },
			},
			action: 'cancelled',
		},

		isSubmitting: {
			control: 'boolean',
			description:
				'Disables inputs and shows a loading label on the submit button.',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},

		serverError: {
			control: 'text',
			description:
				'Server-side error message shown when an update fails.',
			table: {
				type: { summary: 'string | null' },
			},
		},

		serverSuggestion: {
			control: 'text',
			description:
				'Optional suggestion displayed below the server error.',
			table: {
				type: { summary: 'string | null' },
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof UpdateItemFormUI>;

/**
 * Default editing scenario.
 *
 * Represents a user editing an existing packing item
 * with typical values already filled.
 */
export const Default: Story = {
	render: (args) => <FormWrapper {...args} />,

	parameters: {
		docs: {
			description: {
				story: 'The default editing state showing an existing item loaded into the form.',
			},
		},
	},
};

/**
 * Fragile item state.
 *
 * Demonstrates how the fragile toggle appears when enabled.
 */
export const FragileItem: Story = {
	render: (args) => {
		const form = useForm<UpdateItemInput>({
			defaultValues: {
				name: 'Glass perfume bottle',
				category: ItemCategory.ACCESSORIES,
				isFragile: true,
			},
		});

		return <UpdateItemFormUI {...args} form={form} />;
	},

	parameters: {
		docs: {
			description: {
				story: 'Shows the form when the item has the fragile property enabled.',
			},
		},
	},
};

/**
 * Server error state.
 *
 * Displayed when the API mutation fails.
 */
export const ErrorState: Story = {
	render: (args) => <FormWrapper {...args} />,

	args: {
		serverError: 'Unable to update item.',
		serverSuggestion: 'Please try again in a moment.',
	},

	parameters: {
		docs: {
			description: {
				story: 'Displays the alert UI shown when the backend rejects the update request.',
			},
		},
	},
};

/**
 * Submitting state.
 *
 * The form is locked while the update request is in progress.
 */
export const Disabled: Story = {
	render: (args) => <FormWrapper {...args} />,

	args: {
		isSubmitting: true,
	},

	parameters: {
		docs: {
			description: {
				story: 'All actions are disabled while the update mutation is processing.',
			},
		},
	},
};

/**
 * Narrow container stress test.
 *
 * Verifies that the form layout adapts correctly
 * when placed in smaller dialog containers.
 */
export const NarrowContainer: Story = {
	render: (args) => (
		<div style={{ width: 340 }}>
			<FormWrapper {...args} />
		</div>
	),

	parameters: {
		docs: {
			description: {
				story: 'Layout stress test ensuring the form remains readable inside narrow dialog containers.',
			},
		},
	},
};

/**
 * Dark mode verification.
 *
 * Ensures tokens render correctly in dark themes.
 */
export const DarkMode: Story = {
	render: (args) => <FormWrapper {...args} />,

	parameters: {
		themes: { default: 'dark' },

		docs: {
			description: {
				story: 'Validates contrast, focus states, and token usage in dark theme.',
			},
		},
	},
};
