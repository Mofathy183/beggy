import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useForm } from 'react-hook-form';
import type { CreateUserInput } from '@beggy/shared/types';
import CreateUserFormUI from './CreateUserFormUI';

const meta: Meta<typeof CreateUserFormUI> = {
	title: 'Features/Users/Form/CreateUserFormUI',
	component: CreateUserFormUI,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
User creation form used to onboard a new user into the platform.

## What it is
A structured, accessible form for collecting user identity, credentials, and optional avatar information.

## When to use it
- Admin user creation
- Back-office onboarding
- Internal account provisioning

## When not to use it
- Public self-registration flows (unless requirements match)
- Profile editing flows (use edit variant instead)

## Interaction Model
- Fully keyboard navigable.
- Field-level validation feedback appears inline.
- Server errors appear at form level.
- Reset clears all fields.
- Submit button reflects loading state.

## Constraints
- Password must meet minimum length requirements.
- Confirm password must match password.
- Avatar URL is optional.
- Submit disabled during submission.

## Accessibility Guarantees
- Proper label/input association.
- aria-invalid applied on invalid fields.
- Error messages are rendered in semantic error containers.
- Autocomplete hints provided for browser assistance.

## Design-System Notes
- Uses Card container for visual grouping.
- FieldGroup enforces vertical rhythm.
- Button variants reflect action hierarchy.
- Token-driven spacing and color.
- Dark mode supported via system tokens.
`,
			},
		},
	},
	argTypes: {
		form: {
			description: 'React Hook Form instance controlling the form.',
			control: false,
			table: {
				type: { summary: 'UseFormReturn<CreateUserInput>' },
			},
		},
		onSubmit: {
			description: 'Triggered when form is submitted.',
			control: false,
			table: {
				type: { summary: '() => void' },
			},
		},
		isSubmitting: {
			description:
				'Disables submit button and shows loading feedback during submission.',
			control: { type: 'boolean' },
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},
		serverError: {
			description:
				'Displays a generic server-level error message when submission fails.',
			control: false,
			table: {
				type: { summary: 'unknown' },
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof CreateUserFormUI>;

/**
 * Default state when the form first loads.
 *
 * No validation errors are visible.
 * User can begin typing immediately.
 */
export const Default: Story = {
	args: {
		isSubmitting: false,
		serverError: undefined,
	},
	render: (args) => {
		const form = useForm<CreateUserInput>({
			defaultValues: {
				firstName: '',
				lastName: '',
				email: '',
				password: '',
				confirmPassword: '',
				avatarUrl: '',
			},
		});

		return <CreateUserFormUI {...args} form={form} onSubmit={() => {}} />;
	},
	parameters: {
		docs: {
			description: {
				story: 'Initial empty state of the form before user interaction.',
			},
		},
	},
};

/**
 * Occurs after the user attempts submission with invalid data.
 *
 * Field-level errors become visible.
 * aria-invalid attributes are applied.
 */
export const WithValidationErrors: Story = {
	args: {},
	render: () => {
		const form = useForm<CreateUserInput>({
			defaultValues: {
				firstName: '',
				lastName: '',
				email: 'invalid-email',
				password: '123',
				confirmPassword: '456',
				avatarUrl: 'not-a-url',
			},
			mode: 'onSubmit',
		});

		form.setError('email', { message: 'Invalid email address' });
		form.setError('password', { message: 'Must be at least 8 characters' });
		form.setError('confirmPassword', { message: 'Passwords do not match' });

		return <CreateUserFormUI form={form} onSubmit={() => {}} />;
	},
	parameters: {
		docs: {
			description: {
				story: 'Shows inline validation feedback for invalid fields.',
			},
		},
	},
};

/**
 * Occurs when the backend rejects submission.
 *
 * A generic server-level error appears above actions.
 */
export const WithServerError: Story = {
	args: {
		serverError: 'Server failed',
	},
	render: (args) => {
		const form = useForm<CreateUserInput>({
			defaultValues: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'john@example.com',
				password: 'password123',
				confirmPassword: 'password123',
				avatarUrl: '',
			},
		});

		return <CreateUserFormUI {...args} form={form} onSubmit={() => {}} />;
	},
	parameters: {
		docs: {
			description: {
				story: 'Displays a form-level error when submission fails on the server.',
			},
		},
	},
};

/**
 * Occurs after submission is triggered.
 *
 * Submit button shows loading label and becomes disabled.
 * Reset remains available.
 */
export const Submitting: Story = {
	args: {
		isSubmitting: true,
	},
	render: (args) => {
		const form = useForm<CreateUserInput>({
			defaultValues: {
				firstName: 'Jane',
				lastName: 'Smith',
				email: 'jane@example.com',
				password: 'securePassword',
				confirmPassword: 'securePassword',
				avatarUrl: '',
			},
		});

		return <CreateUserFormUI {...args} form={form} onSubmit={() => {}} />;
	},
	parameters: {
		docs: {
			description: {
				story: 'Submit button locked during form submission.',
			},
		},
	},
};

/**
 * Ensures spacing, contrast, and error states
 * remain readable in dark theme.
 */
export const DarkMode: Story = {
	args: {},
	parameters: {
		themes: {
			default: 'dark',
		},
		docs: {
			description: {
				story: 'Validates visual parity and contrast in dark mode.',
			},
		},
	},
	render: () => {
		const form = useForm<CreateUserInput>({
			defaultValues: {
				firstName: '',
				lastName: '',
				email: '',
				password: '',
				confirmPassword: '',
				avatarUrl: '',
			},
		});

		return <CreateUserFormUI form={form} onSubmit={() => {}} />;
	},
};
