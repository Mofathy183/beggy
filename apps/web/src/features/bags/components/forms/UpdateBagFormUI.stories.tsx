import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useForm } from 'react-hook-form';
import { BagFeature, BagType, Material, Size } from '@beggy/shared/constants';
import UpdateBagFormUI from './UpdateBagFormUI';
import type { UpdateBagInput } from '@beggy/shared/types';

// ─── Base defaults (deterministic) ───────────────────────────────────────────

const baseDefaults: UpdateBagInput = {
	name: 'Cabin Backpack',
	type: BagType.BACKPACK,
	size: Size.MEDIUM,
	maxWeight: 10,
	maxCapacity: 40,
	emptyWeight: 1.5,
	color: 'black',
	material: Material.POLYESTER,
	features: [BagFeature.WATERPROOF],
};

// ─── Form Wrapper ────────────────────────────────────────────────────────────

function FormWrapper({
	defaultValues,
	isSubmitting,
	serverError,
	serverSuggestion,
	onCancel,
	onSubmit,
}: {
	defaultValues?: Partial<UpdateBagInput>;
	isSubmitting?: boolean;
	serverError?: string | null;
	serverSuggestion?: string | null;
	onCancel?: () => void;
	onSubmit?: (values: UpdateBagInput) => void;
}) {
	const form = useForm<UpdateBagInput>({
		defaultValues: {
			...baseDefaults,
			...defaultValues,
		},
		mode: 'onTouched',
	});

	return (
		<div className="max-w-xl">
			<UpdateBagFormUI
				form={form}
				onSubmit={(values) => onSubmit?.(values)}
				onCancel={onCancel}
				isSubmitting={isSubmitting}
				serverError={serverError}
				serverSuggestion={serverSuggestion}
			/>
		</div>
	);
}

// ─── Meta ────────────────────────────────────────────────────────────────────

const meta: Meta<typeof UpdateBagFormUI> = {
	title: 'Features/Bags/Forms/UpdateBagFormUI',
	component: UpdateBagFormUI,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `UpdateBagFormUI is a presentational form used to edit an existing bag.

It is prefilled with existing data and allows users to update any subset of fields.
Only modified fields are submitted (PATCH semantics).

Use this component inside edit dialogs or settings screens where existing entities are modified.

Do not use for creation flows or uncontrolled forms.

Interaction model:
- Users edit prefilled values
- Inline validation appears on interaction
- Submission updates only changed fields
- Server errors appear globally

Constraints:
- Requires pre-populated form state
- All fields are optional
- Layout assumes medium-width container

Accessibility guarantees:
- Proper label associations
- Error messages use role="alert"
- Keyboard navigation supported
- Disabled states respected during submission

Design-system notes:
- Shares structure with Create form
- Chips represent enum edits
- Numeric inputs enforce structured input
- Consistent spacing and grouping via FieldGroup
`,
			},
		},
	},
	argTypes: {
		form: { table: { disable: true } },
		onSubmit: { action: 'submitted' },
		onCancel: { action: 'cancelled' },
		isSubmitting: {
			control: 'boolean',
			description: 'Disables actions and shows saving state.',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},
		serverError: {
			control: 'text',
			description: 'Server-side error message displayed in banner.',
			table: {
				type: { summary: 'string | null' },
			},
		},
		serverSuggestion: {
			control: 'text',
			description: 'Optional suggestion accompanying server error.',
			table: {
				type: { summary: 'string | null' },
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Stories ─────────────────────────────────────────────────────────────────

/**
 * Default edit state.
 *
 * Form is fully prefilled with existing bag data.
 */
export const Default: Story = {
	render: (args) => <FormWrapper {...args} />,
	parameters: {
		docs: {
			description: {
				story: 'Initial edit state with all fields populated from an existing bag.',
			},
		},
	},
};

/**
 * Partial update scenario.
 */
export const PartialEdit: Story = {
	render: (args) => (
		<FormWrapper
			{...args}
			defaultValues={{
				name: 'Updated Duffel',
				features: [BagFeature.WATERPROOF, BagFeature.LIGHTWEIGHT],
			}}
		/>
	),
	parameters: {
		docs: {
			description: {
				story: 'User modifies only a subset of fields before saving.',
			},
		},
	},
};

/**
 * Server error state.
 */
export const ErrorState: Story = {
	render: (args) => (
		<FormWrapper
			{...args}
			serverError="Failed to update bag"
			serverSuggestion="Check your inputs or try again later."
		/>
	),
	parameters: {
		docs: {
			description: {
				story: 'Displays a global server error after failed update.',
			},
		},
	},
};

/**
 * Submitting state.
 */
export const Submitting: Story = {
	render: (args) => <FormWrapper {...args} isSubmitting />,
	parameters: {
		docs: {
			description: {
				story: 'Save button enters loading state and interactions are disabled.',
			},
		},
	},
};

/**
 * Narrow container layout.
 */
export const NarrowContainer: Story = {
	render: (args) => (
		<div className="max-w-sm">
			<FormWrapper {...args} />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Ensures layout adapts correctly in constrained widths.',
			},
		},
	},
};

/**
 * Dark mode validation.
 */
export const DarkMode: Story = {
	render: (args) => <FormWrapper {...args} />,
	globals: {
		theme: 'dark',
	},
	parameters: {
		docs: {
			description: {
				story: 'Validates contrast, readability, and focus states in dark theme.',
			},
		},
	},
};
