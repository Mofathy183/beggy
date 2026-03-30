import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useForm } from 'react-hook-form';
import { BagFeature, BagType, Material, Size } from '@beggy/shared/constants';
import CreateBagFormUI from './CreateBagFormUI';
import type { CreateBagInput } from '@beggy/shared/types';

// ─── Base deterministic defaults ─────────────────────────────────────────────

const baseDefaults: CreateBagInput = {
	name: '',
	type: BagType.BACKPACK,
	size: Size.MEDIUM,
	maxWeight: 0.0,
	maxCapacity: 0.0,
	emptyWeight: 0.0,
	color: 'black',
	material: undefined,
	features: [],
};

// ─── Form Wrapper (Storybook adapter layer) ──────────────────────────────────

function FormWrapper({
	defaultValues,
	isSubmitting,
	serverError,
	serverSuggestion,
	onCancel,
	onSubmit,
}: {
	defaultValues?: Partial<CreateBagInput>;
	isSubmitting?: boolean;
	serverError?: string | null;
	serverSuggestion?: string | null;
	onCancel?: () => void;
	onSubmit?: (values: CreateBagInput) => void;
}) {
	const form = useForm<CreateBagInput>({
		defaultValues: {
			...baseDefaults,
			...defaultValues,
		},
		mode: 'onTouched',
	});

	return (
		<div className="max-w-xl">
			<CreateBagFormUI
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

const meta: Meta<typeof CreateBagFormUI> = {
	title: 'Features/Bags/Forms/CreateBagFormUI',
	component: CreateBagFormUI,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
CreateBagFormUI is a presentational form component used to define a new bag's configuration.

It allows users to input core properties such as name, type, size, weight limits, and optional attributes like color, material, and features.

Use this component when collecting structured bag data before saving. It is designed for creation flows inside dialogs or pages.

Do not use this component for editing flows with partial schemas or for uncontrolled inputs.

Interaction model:
- Users fill inputs, select chips, and submit the form
- Validation feedback appears inline per field
- Server errors appear as a global banner

Constraints:
- Requires a valid react-hook-form instance
- Controlled entirely by external form state
- Layout assumes medium-width container

Accessibility guarantees:
- Labels are associated with inputs
- Errors use role="alert"
- Keyboard navigation supported across all fields
- Disabled states respected for submission

Design-system notes:
- Uses token-based styling via Tailwind
- Chips represent enum selections
- Number fields enforce numeric input patterns
- Layout uses grouped fields and responsive grid
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
			description: 'Disables actions and shows loading state.',
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
 * Empty form state.
 *
 * User sees a blank form with default optional values.
 */
export const Default: Story = {
	render: (args) => <FormWrapper {...args} />,
	parameters: {
		docs: {
			description: {
				story: 'Initial empty state used when creating a new bag.',
			},
		},
	},
};

/**
 * Prefilled realistic example.
 */
export const Prefilled: Story = {
	render: (args) => (
		<FormWrapper
			{...args}
			defaultValues={{
				name: 'Weekend Duffel',
				type: BagType.DUFFEL,
				size: Size.MEDIUM,
				maxWeight: 12,
				maxCapacity: 35,
				emptyWeight: 1.2,
				color: 'olive',
				material: Material.CANVAS,
				features: [BagFeature.WATERPROOF],
			}}
		/>
	),
	parameters: {
		docs: {
			description: {
				story: 'Represents a realistic filled-out form before submission.',
			},
		},
	},
};

/**
 * Server error visible.
 */
export const ErrorState: Story = {
	render: (args) => (
		<FormWrapper
			{...args}
			serverError="Failed to create bag"
			serverSuggestion="Try using a different name or check your connection."
		/>
	),
	parameters: {
		docs: {
			description: {
				story: 'Displays a global server error after submission failure.',
			},
		},
	},
};

/**
 * Submitting state disables actions.
 */
export const Submitting: Story = {
	render: (args) => <FormWrapper {...args} isSubmitting />,
	parameters: {
		docs: {
			description: {
				story: 'Shows loading state while submission is in progress.',
			},
		},
	},
};

/**
 * Narrow container stress test.
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
				story: 'Tests layout responsiveness in constrained width.',
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
				story: 'Ensures contrast, focus, and readability in dark mode.',
			},
		},
	},
};
