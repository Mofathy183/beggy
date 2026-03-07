import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useForm } from 'react-hook-form';

import CreateItemFormUI from './CreateItemFormUI';

import { ItemCategory, VolumeUnit, WeightUnit } from '@beggy/shared/constants';
import type { CreateItemInput } from '@beggy/shared/types';

function FormWrapper({
	defaultValues,
	...props
}: React.ComponentProps<typeof CreateItemFormUI> & {
	defaultValues?: Partial<CreateItemInput>;
}) {
	const form = useForm<CreateItemInput>({
		defaultValues: {
			name: '',
			category: undefined,
			weight: undefined,
			weightUnit: WeightUnit.KILOGRAM,
			volume: undefined,
			volumeUnit: VolumeUnit.LITER,
			color: '',
			isFragile: false,
			...defaultValues,
		},
	});

	return (
		<CreateItemFormUI
			{...props}
			form={form}
			onSubmit={(v) => props.onSubmit?.(v)}
		/>
	);
}

const meta: Meta<typeof CreateItemFormUI> = {
	title: 'Features/Items/Forms/CreateItemFormUI',
	component: CreateItemFormUI,
	tags: ['autodocs'],

	parameters: {
		docs: {
			description: {
				component: `
## What this component is

**CreateItemFormUI** renders the user interface for creating a new packing item.

It provides the **form layout and accessibility layer**, but contains **no API calls or side effects**.

The component receives a \`react-hook-form\` instance and delegates submission to the parent container.

---

## When to use it

Use this component whenever the user needs to **add a new item to their packing inventory**.

Typical scenarios:

• creating items inside an "Add Item" dialog  
• adding gear to a packing list  
• entering travel equipment manually  

---

## When NOT to use it

Do not use this component when:

• editing an existing item (use **UpdateItemFormUI**)  
• displaying item details in read-only mode  
• importing items in bulk  

---

## Field structure

• Item name  
• Category (chip single-select)  
• Weight + unit  
• Volume + unit  
• Color (optional text input)  
• Fragile toggle

---

## Interaction model

Users enter item information and submit the form.

The container component handles:

• validation  
• API mutation  
• success and error handling  
• dialog closing or navigation

---

## Design principles

• Optimized for **fast item entry**  
• Chips improve **category scanning speed**  
• Measurement inputs reduce ambiguity with unit pairing  
• Optional metadata does not block submission

---

## Architecture

This component belongs to the **Forms → UI layer**.

\`\`\`
CreateItemFormContainer
        ↓
CreateItemFormUI
\`\`\`

---

## Accessibility

• All inputs have associated labels  
• Validation errors use \`role="alert"\`  
• Descriptions are connected with \`aria-describedby\`  
• Toggle uses semantic switch behavior  
• Form controls remain keyboard navigable
`,
			},
		},
	},

	argTypes: {
		form: {
			table: { disable: true },
			description: 'react-hook-form instance controlling the form.',
		},

		onSubmit: {
			action: 'submitted',
			description: 'Callback triggered when the form is submitted.',
			table: {
				type: { summary: '(values: CreateItemInput) => void' },
			},
		},

		onCancel: {
			action: 'cancelled',
			description: 'Called when the user presses the Cancel button.',
			table: {
				type: { summary: '() => void' },
			},
		},

		isSubmitting: {
			control: 'boolean',
			description:
				'Disables all inputs and shows loading state on submit.',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},

		serverError: {
			control: 'text',
			description: 'Server error message displayed in the alert.',
			table: {
				type: { summary: 'string | null' },
			},
		},

		serverSuggestion: {
			control: 'text',
			description: 'Optional suggestion displayed below the error.',
			table: {
				type: { summary: 'string | null' },
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof CreateItemFormUI>;

export const EmptyForm: Story = {
	render: (args) => <FormWrapper {...args} />,

	parameters: {
		docs: {
			description: {
				story: 'Initial empty state of the create item form.',
			},
		},
	},
};

export const PrefilledExample: Story = {
	render: (args) => (
		<FormWrapper
			{...args}
			defaultValues={{
				name: 'Travel Toothbrush',
				category: ItemCategory.TOILETRIES,
				weight: 0.2,
				weightUnit: WeightUnit.KILOGRAM,
				volume: 0.3,
				volumeUnit: VolumeUnit.LITER,
				color: 'navy',
				isFragile: false,
			}}
		/>
	),

	parameters: {
		docs: {
			description: {
				story: 'Example of the form with prefilled values.',
			},
		},
	},
};

export const FragileItem: Story = {
	render: (args) => (
		<FormWrapper
			{...args}
			defaultValues={{
				name: 'Glass perfume bottle',
				category: ItemCategory.ACCESSORIES,
				isFragile: true,
			}}
		/>
	),

	parameters: {
		docs: {
			description: {
				story: 'Shows the fragile toggle enabled for delicate items.',
			},
		},
	},
};

export const ServerError: Story = {
	render: (args) => (
		<FormWrapper
			{...args}
			serverError={'Failed to create item.'}
			serverSuggestion={'Please check your connection and try again.'}
		/>
	),

	parameters: {
		docs: {
			description: {
				story: 'Displays a server error alert returned from the API.',
			},
		},
	},
};

export const SubmittingState: Story = {
	render: (args) => (
		<FormWrapper
			{...args}
			isSubmitting
			defaultValues={{
				name: 'Passport',
			}}
		/>
	),

	parameters: {
		docs: {
			description: {
				story: 'Form state while submission is in progress.',
			},
		},
	},
};

export const NarrowContainer: Story = {
	render: (args) => (
		<div style={{ width: 340 }}>
			<FormWrapper {...args} />
		</div>
	),

	parameters: {
		docs: {
			description: {
				story: 'Stress test ensuring the form remains usable inside narrow dialog containers.',
			},
		},
	},
};

export const DarkMode: Story = {
	render: (args) => (
		<FormWrapper
			{...args}
			defaultValues={{
				name: 'Travel adapter',
				category: ItemCategory.ELECTRONICS,
			}}
		/>
	),

	parameters: {
		themes: { default: 'dark' },

		docs: {
			description: {
				story: 'Validates contrast and layout in dark mode.',
			},
		},
	},
};
