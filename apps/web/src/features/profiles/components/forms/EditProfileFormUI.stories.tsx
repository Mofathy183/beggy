import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useForm } from 'react-hook-form';
import type { EditProfileInput } from '@beggy/shared/types';
import { Gender } from '@beggy/shared/constants';

import EditProfileFormUI from './EditProfileFormUI';

const meta: Meta<typeof EditProfileFormUI> = {
	title: 'Features/Profiles/Forms/EditProfileFormUI',
	component: EditProfileFormUI,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
## EditProfileFormUI

### What it is
A profile editing form that allows users to update their personal information.

### When to use it
Use inside profile settings where a user can update previously saved details.

### When not to use it
Do not use during first-time onboarding — use OnboardingFormUI instead.

### Interaction Model
- PATCH semantics: all fields optional
- Empty field means “no change”
- Inline validation errors
- Reset button restores initial state
- Submit button enters loading state during save
- Server-level error appears as destructive alert

### Constraints & UX Rules
- Form must clearly communicate that fields are optional
- Reset must not break accessibility
- Server error must interrupt flow but remain readable
- Avatar URL requires helper text context

### Accessibility Guarantees
- All inputs labeled
- aria-invalid and aria-describedby wired
- Errors use role="alert"
- Server alert uses aria-live="polite"
- Fully keyboard navigable
- Focus states visible via tokens

### Design-System Notes
- Token-driven colors only
- Uses FieldGroup pattern for consistency
- No hardcoded color values
- Dark mode supported
- Layout stable for Chromatic
`,
			},
		},
	},
	argTypes: {
		isSubmitting: {
			description:
				'Disables actions and displays loading state on submit button.',
			control: 'boolean',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},
		serverError: {
			description:
				'Top-level error message displayed in destructive alert.',
			control: 'text',
			table: {
				type: { summary: 'string | null' },
			},
		},
		serverSuggestion: {
			description: 'Optional guidance shown under server error.',
			control: 'text',
			table: {
				type: { summary: 'string | null' },
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof EditProfileFormUI>;

/* -------------------------------------------------------------------------- */
/* Controlled Form Wrapper                                                    */
/* -------------------------------------------------------------------------- */

const ControlledRender = (args: any) => {
	const form = useForm<EditProfileInput>({
		defaultValues: {
			firstName: '',
			lastName: '',
			avatarUrl: '',
			gender: undefined,
			birthDate: undefined,
			country: '',
			city: '',
		},
	});

	return <EditProfileFormUI {...args} form={form} onSubmit={() => {}} />;
};

/* -------------------------------------------------------------------------- */
/* Stories                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Default edit state.
 *
 * Occurs when user opens profile settings.
 * All fields empty (PATCH semantics).
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
				story: 'Initial edit state with all fields optional and empty.',
			},
		},
	},
};

/**
 * Pre-filled profile data.
 *
 * Represents real-world scenario where
 * user already has saved information.
 *
 * Used for layout and Chromatic stability.
 */
export const WithExistingData: Story = {
	render: () => {
		const form = useForm<EditProfileInput>({
			defaultValues: {
				firstName: 'Mohamed',
				lastName: 'Fathy',
				avatarUrl: 'https://example.com/avatar.png',
				gender: Gender.MALE,
				birthDate: new Date('1998-04-15'),
				country: 'Egypt',
				city: 'Cairo',
			},
		});

		return (
			<EditProfileFormUI
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
				story: 'Represents a realistic edit state with previously saved data.',
			},
		},
	},
};

/**
 * Loading state during save.
 *
 * Prevents double submission and disables reset.
 */
export const SavingState: Story = {
	render: ControlledRender,
	args: {
		isSubmitting: true,
		serverError: null,
		serverSuggestion: null,
	},
	parameters: {
		docs: {
			description: {
				story: 'Submit button shows loading state and form actions are disabled.',
			},
		},
	},
};

/**
 * Server error state.
 *
 * Triggered when backend rejects update request.
 * Must be visually distinct and accessible.
 */
export const ServerErrorState: Story = {
	render: ControlledRender,
	args: {
		isSubmitting: false,
		serverError: 'Unable to save changes.',
		serverSuggestion: 'Please verify your information and try again.',
	},
	parameters: {
		docs: {
			description: {
				story: 'Displays destructive alert with optional recovery guidance.',
			},
		},
	},
};

/**
 * Dark mode verification.
 *
 * Ensures destructive alert, tokens, and
 * field contrast adapt correctly.
 */
export const DarkMode: Story = {
	render: ControlledRender,
	args: {
		isSubmitting: false,
		serverError: 'Unable to save changes.',
		serverSuggestion: 'Please verify your information and try again.',
	},
	parameters: {
		themes: { default: 'dark' },
		docs: {
			description: {
				story: 'Dark mode rendering to verify token-based styling and contrast.',
			},
		},
	},
};
