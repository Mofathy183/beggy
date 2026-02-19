import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useForm } from 'react-hook-form';
import type { ChangeRoleInput } from '@beggy/shared/types';
import { ChangeRoleFormUI } from './ChangeRoleFormUI';
import { Role } from '@beggy/shared/constants';

const meta: Meta<typeof ChangeRoleFormUI> = {
	title: 'Features/Users/Form/ChangeRoleFormUI',
	component: ChangeRoleFormUI,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
Administrative form used to update a user's role.

## What it is
A focused form that allows administrators to change a user's access level using a controlled select component.

## When to use it
- Admin panel role management
- User moderation flows
- Permission adjustments

## When not to use it
- Self-service profile edits
- Role suggestion previews
- Read-only user summaries

## Interaction Model
- Role is selected via accessible dropdown.
- Field is required.
- Validation feedback appears inline.
- Server errors appear at form level.
- Submit reflects loading state.

## Constraints
- Only predefined Role enum values are selectable.
- Role change has immediate permission impact.
- Submit is disabled during update.

## Accessibility Guarantees
- Radix-based Select with keyboard navigation.
- Proper label association.
- aria-invalid applied on validation error.
- aria-describedby connects description and error.
- Errors use role="alert".

## Design-System Notes
- Card layout ensures visual grouping.
- Select follows system density and token-based styling.
- Button hierarchy reflects secondary (cancel) and primary (update).
- Dark mode supported via tokens.
`,
			},
		},
	},
	argTypes: {
		form: {
			description: 'React Hook Form instance controlling the form.',
			control: false,
			table: {
				type: { summary: 'UseFormReturn<ChangeRoleInput>' },
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
				'Disables submit button and shows loading feedback while updating role.',
			control: { type: 'boolean' },
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},
		serverError: {
			description:
				'Displays a generic server-level error when role update fails.',
			control: false,
			table: {
				type: { summary: 'unknown' },
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof ChangeRoleFormUI>;

/**
 * Default administrative state.
 *
 * The current role is preselected.
 * No validation errors are visible.
 */
export const Default: Story = {
	render: () => {
		const form = useForm<ChangeRoleInput>({
			defaultValues: {
				role: Role.USER,
			},
		});

		return (
			<ChangeRoleFormUI
				form={form}
				onSubmit={form.handleSubmit(() => {})}
			/>
		);
	},
	parameters: {
		docs: {
			description: {
				story: 'Initial state with the current user role preselected.',
			},
		},
	},
};

/**
 * Occurs if submission is attempted without selecting a role.
 *
 * Inline validation error becomes visible.
 * aria-invalid is applied to the select trigger.
 */
export const WithValidationError: Story = {
	render: () => {
		const form = useForm<ChangeRoleInput>({
			defaultValues: {
				role: undefined as any,
			},
		});

		form.setError('role', {
			message: 'Role is required.',
		});

		return (
			<ChangeRoleFormUI
				form={form}
				onSubmit={form.handleSubmit(() => {})}
			/>
		);
	},
	parameters: {
		docs: {
			description: {
				story: 'Displays inline validation feedback when no role is selected.',
			},
		},
	},
};

/**
 * Occurs when backend rejects the role update.
 *
 * A generic form-level error appears.
 */
export const WithServerError: Story = {
	render: () => {
		const form = useForm<ChangeRoleInput>({
			defaultValues: {
				role: Role.ADMIN,
			},
		});

		return (
			<ChangeRoleFormUI
				form={form}
				serverError={new Error('Update failed')}
				onSubmit={form.handleSubmit(() => {})}
			/>
		);
	},
	parameters: {
		docs: {
			description: {
				story: 'Displays a server-level error after a failed update attempt.',
			},
		},
	},
};

/**
 * Occurs after the update action is triggered.
 *
 * Submit button is disabled and displays loading feedback.
 */
export const Submitting: Story = {
	args: {
		isSubmitting: true,
	},
	render: (args) => {
		const form = useForm<ChangeRoleInput>({
			defaultValues: {
				role: Role.MODERATOR,
			},
		});

		return (
			<ChangeRoleFormUI
				{...args}
				form={form}
				onSubmit={form.handleSubmit(() => {})}
			/>
		);
	},
	parameters: {
		docs: {
			description: {
				story: 'Update button locked during role update request.',
			},
		},
	},
};

/**
 * Ensures contrast, focus states,
 * and select dropdown readability in dark mode.
 */
export const DarkMode: Story = {
	parameters: {
		themes: {
			default: 'dark',
		},
		docs: {
			description: {
				story: 'Validates visual parity and accessibility in dark theme.',
			},
		},
	},
	render: () => {
		const form = useForm<ChangeRoleInput>({
			defaultValues: {
				role: Role.USER,
			},
		});

		return (
			<ChangeRoleFormUI
				form={form}
				onSubmit={form.handleSubmit(() => {})}
			/>
		);
	},
};
