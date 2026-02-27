import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useForm } from 'react-hook-form';

import SignupFormUI from './SignupFormUI';
import type { SignUpInput } from '@beggy/shared/types';

const meta: Meta<typeof SignupFormUI> = {
	title: 'Features/Auth/Forms/SignupFormUI',
	component: SignupFormUI,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
**SignupFormUI** is the presentational account-creation form used during initial registration.

### What it is
A structured identity-first signup form collecting name, email, and password.

### When to use it
Use during first-time account creation before onboarding or profile enrichment.

### When not to use it
Do not use for profile editing, password reset, or onboarding flows.

### Interaction model
- Client validation handled by react-hook-form (visual states only shown here)
- Submit disabled during loading
- Server errors appear above the submit button
- Field-level errors are announced via \`role="alert"\`

### Constraints
- Password must be confirmed
- Submission is blocked while loading
- Required fields communicate required state semantically

### Accessibility guarantees
- Proper \`aria-invalid\`
- Linked \`aria-describedby\`
- Errors use \`role="alert"\`
- Fully keyboard navigable
- Required fields use semantic indicators

### Design-system notes
- Uses shadcn Field primitives
- Token-driven spacing and destructive colors
- No hardcoded colors
- Dark-mode compatible
`,
			},
		},
	},
	argTypes: {
		isSubmitting: {
			control: 'boolean',
			description:
				'Disables inputs and shows loading state in submit button.',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},
		serverError: {
			control: 'text',
			description: 'Server-side error shown above submit button.',
			table: {
				type: { summary: 'string | null' },
				defaultValue: { summary: 'null' },
			},
		},
		form: { table: { disable: true } },
		onSubmit: { table: { disable: true } },
	},
};

export default meta;

type Story = StoryObj<typeof SignupFormUI>;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function useSignupForm(initialValues?: Partial<SignUpInput>) {
	return useForm<SignUpInput>({
		defaultValues: {
			firstName: '',
			lastName: '',
			email: '',
			password: '',
			confirmPassword: '',
			...initialValues,
		},
		mode: 'onBlur',
	});
}

/* -------------------------------------------------------------------------- */
/* Stories                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Default state shown when the user first lands on the signup page.
 *
 * The user sees empty required fields and a primary call-to-action.
 * No errors are visible until interaction occurs.
 */
export const Default: Story = {
	render: (args) => {
		const form = useSignupForm();

		return <SignupFormUI {...args} form={form} onSubmit={() => {}} />;
	},
	args: {
		isSubmitting: false,
		serverError: null,
	},
	parameters: {
		docs: {
			description: {
				story: 'Initial empty state before user interaction.',
			},
		},
	},
};

/**
 * Field validation state after user interaction.
 *
 * Represents a user who attempted submission
 * and triggered client-side validation errors.
 *
 * Demonstrates destructive color tokens and accessible error messaging.
 */
export const WithFieldErrors: Story = {
	render: (args) => {
		const form = useSignupForm();

		form.setError('email', { message: 'Invalid email address.' });
		form.setError('password', {
			message: 'Must be at least 8 characters.',
		});
		form.setError('confirmPassword', {
			message: 'Passwords do not match.',
		});

		return <SignupFormUI {...args} form={form} onSubmit={() => {}} />;
	},
	args: {
		isSubmitting: false,
		serverError: null,
	},
	parameters: {
		docs: {
			description: {
				story: 'Shows client-side validation errors after submission attempt.',
			},
		},
	},
};

/**
 * Server error state after API rejection.
 *
 * Occurs when the backend rejects the signup attempt
 * (e.g., email already registered).
 *
 * The error appears above the submit button to be visible
 * before retrying.
 */
export const WithServerError: Story = {
	render: (args) => {
		const form = useSignupForm();

		return <SignupFormUI {...args} form={form} onSubmit={() => {}} />;
	},
	args: {
		isSubmitting: false,
		serverError: 'An account with this email already exists.',
	},
	parameters: {
		docs: {
			description: {
				story: 'Represents a backend rejection (e.g., duplicate email).',
			},
		},
	},
};

/**
 * Loading state during mutation.
 *
 * Inputs become disabled and the submit button
 * communicates progress.
 *
 * Prevents duplicate submissions.
 */
export const Submitting: Story = {
	render: (args) => {
		const form = useSignupForm({
			firstName: 'Mohamed',
			lastName: 'Fathy',
			email: 'mohamed@example.com',
		});

		return <SignupFormUI {...args} form={form} onSubmit={() => {}} />;
	},
	args: {
		isSubmitting: true,
		serverError: null,
	},
	parameters: {
		docs: {
			description: {
				story: 'Loading state while account creation request is in progress.',
			},
		},
	},
};

/**
 * Dark mode visual parity verification.
 *
 * Ensures destructive tokens, focus states,
 * and spacing maintain contrast and clarity.
 */
export const DarkMode: Story = {
	render: (args) => {
		const form = useSignupForm();

		return <SignupFormUI {...args} form={form} onSubmit={() => {}} />;
	},
	args: {
		isSubmitting: false,
		serverError: null,
	},
	parameters: {
		themes: {
			default: 'dark',
		},
		docs: {
			description: {
				story: 'Verifies visual parity and token contrast in dark mode.',
			},
		},
	},
};
