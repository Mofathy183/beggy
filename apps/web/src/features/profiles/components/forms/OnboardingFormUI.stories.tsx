import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useForm } from 'react-hook-form';
import type { EditProfileInput } from '@beggy/shared/types';
import { Gender } from '@beggy/shared/constants';

import OnboardingFormUI from './OnboardingFormUI';

const meta: Meta<typeof OnboardingFormUI> = {
	title: 'Features/Profiles/Forms/OnboardingFormUI',
	component: OnboardingFormUI,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
## OnboardingFormUI

### What it is
A welcoming, travel-inspired onboarding form used to collect initial profile information from a new user.

### When to use it
Use during first-time account setup after authentication, when the user needs to complete their traveler profile.

### When not to use it
Do not use for profile editing after onboarding — use the dedicated Edit Profile form instead.

### Interaction model
- Standard form submission
- Inline field validation errors
- Optional fields clearly marked
- Submit button enters loading state during submission
- Server-level error appears as an alert block above the footer

### Constraints & UX Rules
- First name and last name are primary identity fields
- Optional fields must remain visually secondary
- Date input must show helper text explaining age usage
- Server error must visually interrupt the flow but remain accessible

### Accessibility Guarantees
- All fields are labeled
- Errors use role="alert"
- aria-invalid and aria-describedby are wired
- Alert uses aria-live="polite"
- Keyboard navigable
- Focus states visible via design tokens

### Design-System Notes
- Token-driven colors only
- Uses shadcn primitives
- Structured by FieldGroup sections
- Dark mode supported
`,
			},
		},
	},
	argTypes: {
		isSubmitting: {
			description:
				'Displays loading state on submit button and disables interaction.',
			control: 'boolean',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},
		serverError: {
			description: 'High-level error message shown in destructive alert.',
			control: 'text',
			table: {
				type: { summary: 'string | null' },
			},
		},
		serverSuggestion: {
			description: 'Optional supporting message under the server error.',
			control: 'text',
			table: {
				type: { summary: 'string | null' },
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof OnboardingFormUI>;

/* -------------------------------------------------------------------------- */
/* Controlled Form Wrapper                                                    */
/* -------------------------------------------------------------------------- */

const ControlledRender = (args: any) => {
	const form = useForm<EditProfileInput>({
		defaultValues: {
			firstName: '',
			lastName: '',
			gender: undefined,
			country: '',
			city: '',
			birthDate: undefined,
		},
	});

	return <OnboardingFormUI {...args} form={form} onSubmit={() => {}} />;
};

/* -------------------------------------------------------------------------- */
/* Stories                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Default onboarding state.
 *
 * Occurs when a new user first lands on profile setup.
 * No validation errors.
 * No server feedback.
 *
 * The user sees a calm, structured welcome form.
 */
export const Default: Story = {
	render: ControlledRender,
	args: {
		isSubmitting: false,
		serverError: null,
		serverSuggestion: null,
	},
	parameters: {
		docs: {
			description: {
				story: 'Initial onboarding state with empty fields and no feedback.',
			},
		},
	},
};

/**
 * Loading state after submission.
 *
 * Triggered when the user submits the form
 * and the system is processing profile creation.
 *
 * The button communicates progress and prevents resubmission.
 */
export const Submitting: Story = {
	render: ControlledRender,
	args: {
		isSubmitting: true,
		serverError: null,
		serverSuggestion: null,
	},
	parameters: {
		docs: {
			description: {
				story: 'Submit button enters loading state and becomes disabled.',
			},
		},
	},
};

/**
 * Server-level error state.
 *
 * Occurs when backend validation or profile creation fails.
 *
 * The alert must:
 * - Be visually distinct
 * - Announce via aria-live
 * - Provide helpful recovery guidance
 */
export const ServerErrorState: Story = {
	render: ControlledRender,
	args: {
		isSubmitting: false,
		serverError: 'We couldn’t complete your setup.',
		serverSuggestion: 'Please check your information and try again.',
	},
	parameters: {
		docs: {
			description: {
				story: 'Displays destructive alert with recovery guidance.',
			},
		},
	},
};

/**
 * Filled example state.
 *
 * Represents a realistic user midway through filling the form.
 *
 * Useful for layout verification and Chromatic visual stability.
 */
export const PartiallyFilled: Story = {
	render: () => {
		const form = useForm<EditProfileInput>({
			defaultValues: {
				firstName: 'Mohamed',
				lastName: 'Fathy',
				gender: Gender.MALE,
				country: 'Egypt',
				city: 'Cairo',
				birthDate: new Date('1998-04-15'),
			},
		});

		return (
			<OnboardingFormUI
				form={form}
				onSubmit={() => {}}
				isSubmitting={false}
				serverError={null}
				serverSuggestion={null}
			/>
		);
	},
	parameters: {
		docs: {
			description: {
				story: 'Example filled state for layout validation and visual regression stability.',
			},
		},
	},
};

/**
 * Dark mode verification.
 *
 * Ensures token-based styling adapts correctly
 * and destructive alert remains readable.
 */
export const DarkMode: Story = {
	render: ControlledRender,
	args: {
		isSubmitting: false,
		serverError: 'We couldn’t complete your setup.',
		serverSuggestion: 'Please check your information and try again.',
	},
	parameters: {
		themes: {
			default: 'dark',
		},
		docs: {
			description: {
				story: 'Dark mode rendering with alert visibility and token contrast verification.',
			},
		},
	},
};
