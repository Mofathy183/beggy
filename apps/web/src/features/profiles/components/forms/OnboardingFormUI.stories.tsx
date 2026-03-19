import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useForm } from 'react-hook-form';
import type { CompleteOnboardingInput } from '@beggy/shared/types';
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

const ControlledRender = (args: Story['args']) => {
	const form = useForm<CompleteOnboardingInput>({
		defaultValues: {
			firstName: '',
			lastName: '',
			gender: undefined,
			country: '',
			city: '',
			birthDate: undefined,
		},
	});

	return (
		<OnboardingFormUI
			{...args}
			form={form}
			onSubmit={() => {}}
			onSkip={() => {}}
		/>
	);
};

/* -------------------------------------------------------------------------- */
/* Stories                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Default onboarding state.
 *
 * First-time user lands on onboarding.
 * No validation or server feedback is shown.
 */
export const Default: Story = {
	render: ControlledRender,
	args: {
		isSubmitting: false,
		isSkipping: false,
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
 * Form submission in progress.
 *
 * Primary CTA shows loading state and disables interaction.
 */
export const Submitting: Story = {
	render: ControlledRender,
	args: {
		isSubmitting: true,
		isSkipping: false,
		serverError: null,
		serverSuggestion: null,
	},
	parameters: {
		docs: {
			description: {
				story: 'Submit button enters loading state and prevents duplicate submissions.',
			},
		},
	},
};

/**
 * Skip action in progress.
 *
 * Occurs when user chooses "I'll do this later".
 */
export const Skipping: Story = {
	render: ControlledRender,
	args: {
		isSubmitting: false,
		isSkipping: true,
		serverError: null,
		serverSuggestion: null,
	},
	parameters: {
		docs: {
			description: {
				story: 'Skip button shows loading state while onboarding is being completed without data.',
			},
		},
	},
};

/**
 * Server-level failure.
 *
 * Occurs when backend rejects onboarding submission.
 */
export const ServerErrorState: Story = {
	render: ControlledRender,
	args: {
		isSubmitting: false,
		isSkipping: false,
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
 * Midway filled state.
 *
 * Represents a realistic user filling the form.
 */
export const PartiallyFilled: Story = {
	render: () => {
		const form = useForm<CompleteOnboardingInput>({
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
				onSkip={() => {}}
				isSubmitting={false}
				isSkipping={false}
				serverError={null}
				serverSuggestion={null}
			/>
		);
	},
	parameters: {
		docs: {
			description: {
				story: 'Pre-filled state used for layout and visual regression stability.',
			},
		},
	},
};

/**
 * Narrow container stress test.
 *
 * Ensures layout holds on small screens.
 */
export const NarrowContainer: Story = {
	render: ControlledRender,
	args: {
		isSubmitting: false,
		isSkipping: false,
	},
	parameters: {
		layout: 'padded',
	},
	decorators: [
		(Story) => (
			<div className="max-w-sm mx-auto">
				<Story />
			</div>
		),
	],
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
		docs: {
			description: {
				story: 'Dark mode rendering with alert visibility and token contrast verification.',
			},
		},
	},

	globals: {
		theme: 'dark',
	},
};
