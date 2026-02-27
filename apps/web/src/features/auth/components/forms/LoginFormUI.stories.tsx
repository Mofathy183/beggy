import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useForm } from 'react-hook-form';
import type { LoginInput } from '@beggy/shared/types';
import LoginFormUI from './LoginFormUI';

const meta: Meta<typeof LoginFormUI> = {
	title: 'Features/Auth/Forms/LoginFormUI',
	component: LoginFormUI,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
**LoginFormUI** is the presentational login form used for user authentication.

It contains zero business logic and zero API integration.
Validation and submission lifecycle are owned by the container.

---

## What it is
A controlled authentication form powered by react-hook-form.

## When to use it
- Login pages
- Auth modals
- Session re-auth flows

## When NOT to use it
- Registration
- Password reset
- Social login flows
- Inline credential prompts

---

## Interaction Model
- Email → Password → Remember me → Submit
- Validation errors appear inline
- Server error appears above submit
- All inputs disabled during submission
- Submit button text changes during loading

---

## UX Constraints
- Email is identity-first
- Password uses secure masking
- Server error positioned before retry attempt
- Submit button spans full width
- Form spacing consistent (gap-5)

---

## Accessibility Guarantees
- aria-invalid for invalid fields
- FieldError uses role="alert"
- Required fields use aria-required
- Label + Input properly associated
- Fully keyboard navigable

---

## Design System Notes
- Uses shadcn primitives
- Token-driven destructive color
- No browser native validation (noValidate)
- Dark mode safe
        `,
			},
		},
	},
	argTypes: {
		isSubmitting: {
			description:
				'Disables inputs and shows loading state in submit button.',
			control: 'boolean',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},
		serverError: {
			description: 'Server-side error message shown above submit button.',
			control: 'text',
			table: {
				type: { summary: 'string | null' },
			},
		},
		form: {
			control: false,
			table: { type: { summary: 'UseFormReturn<LoginInput>' } },
		},
		onSubmit: {
			control: false,
			table: { type: { summary: '(values: LoginInput) => void' } },
		},
	},
};

export default meta;
type Story = StoryObj<typeof LoginFormUI>;

/**
 * Initial state before user interaction.
 * No validation errors.
 * No server errors.
 */
export const Default: Story = {
	render: (args) => {
		const form = useForm<LoginInput>({
			defaultValues: {
				email: '',
				password: '',
				rememberMe: false,
			},
			mode: 'onSubmit',
		});

		return <LoginFormUI {...args} form={form} onSubmit={() => {}} />;
	},
};

/**
 * Represents form after failed validation attempt.
 * Errors are visible inline.
 */
export const WithValidationErrors: Story = {
	render: (args) => {
		const form = useForm<LoginInput>({
			defaultValues: {
				email: '',
				password: '',
				rememberMe: false,
			},
		});

		// Manually inject errors for visual documentation
		form.setError('email', {
			type: 'manual',
			message: 'Email is required',
		});

		form.setError('password', {
			type: 'manual',
			message: 'Password must be at least 8 characters',
		});

		return <LoginFormUI {...args} form={form} onSubmit={() => {}} />;
	},
};

/**
 * Occurs when backend rejects credentials.
 * Shown above submit button.
 */
export const WithServerError: Story = {
	render: (args) => {
		const form = useForm<LoginInput>({
			defaultValues: {
				email: 'user@example.com',
				password: 'wrong-password',
				rememberMe: false,
			},
		});

		return (
			<LoginFormUI
				{...args}
				form={form}
				serverError="Invalid email or password."
				onSubmit={() => {}}
			/>
		);
	},
};

/**
 * Mutation in progress.
 * All inputs disabled.
 * Submit button shows loading label.
 */
export const Submitting: Story = {
	render: (args) => {
		const form = useForm<LoginInput>({
			defaultValues: {
				email: 'user@example.com',
				password: 'password123',
				rememberMe: true,
			},
		});

		return (
			<LoginFormUI
				{...args}
				form={form}
				isSubmitting
				onSubmit={() => {}}
			/>
		);
	},
};

/**
 * Validates destructive errors and muted labels
 * in dark theme.
 */
export const DarkMode: Story = {
	render: (args) => {
		const form = useForm<LoginInput>({
			defaultValues: {
				email: '',
				password: '',
				rememberMe: false,
			},
		});

		return <LoginFormUI {...args} form={form} onSubmit={() => {}} />;
	},
	parameters: {
		themes: {
			default: 'dark',
		},
	},
};
