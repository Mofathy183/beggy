import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import SignupFormUI from './SignupFormUI';
import type { SignUpInput } from '@beggy/shared/types';

const meta: Meta<typeof SignupFormUI> = {
	title: 'Features/Auth/Forms/SignupFormUI',
	component: SignupFormUI,
	tags: ['autodocs'],

	parameters: {
		layout: 'centered',

		docs: {
			description: {
				component: `
SignupFormUI is the **presentational account creation form** used during registration.

The component contains **no API calls, routing, or mutation logic**.
All lifecycle management happens in the container.

---

### Interaction flow

First name → Last name → Email → Password → Confirm password → Submit

Validation errors appear inline while **server errors appear above the submit button**.

---

### Design Principles

• Identity-first signup flow  
• Clear password expectations  
• Prevent duplicate submissions  
• Consistent spacing using design tokens  

---

### Accessibility

• aria-invalid for invalid fields  
• role="alert" for validation errors  
• label/input associations  
• keyboard navigable  

---

### Architecture

Container responsibilities:

• validation schema  
• API requests  
• error mapping  
• navigation

UI responsibilities:

• rendering fields  
• showing validation state  
• showing loading state
`,
			},
		},
	},

	argTypes: {
		isSubmitting: {
			control: 'boolean',
		},

		serverError: {
			control: 'text',
		},

		serverSuggestion: {
			control: 'text',
		},

		form: { control: false },
		onSubmit: { control: false },
	},
};

export default meta;
type Story = StoryObj<typeof SignupFormUI>;

const Wrapper = ({ children }: { children: React.ReactNode }) => (
	<div className="w-[420px]">{children}</div>
);

function useSignupForm(initial?: Partial<SignUpInput>) {
	return useForm<SignUpInput>({
		defaultValues: {
			firstName: '',
			lastName: '',
			email: '',
			password: '',
			confirmPassword: '',
			...initial,
		},
		mode: 'onBlur',
	});
}

export const Default: Story = {
	render: (args) => {
		const form = useSignupForm();

		return (
			<Wrapper>
				<SignupFormUI {...args} form={form} onSubmit={() => {}} />
			</Wrapper>
		);
	},
};

export const FilledForm: Story = {
	render: (args) => {
		const form = useSignupForm({
			firstName: 'Bruce',
			lastName: 'Wayne',
			email: 'bruce@wayneenterprises.com',
			password: 'IamBatman123',
			confirmPassword: 'IamBatman123',
		});

		return (
			<Wrapper>
				<SignupFormUI {...args} form={form} onSubmit={() => {}} />
			</Wrapper>
		);
	},
};

export const WithFieldErrors: Story = {
	render: (args) => {
		const form = useSignupForm();

		useEffect(() => {
			form.setError('email', {
				type: 'manual',
				message: 'Invalid email address.',
			});

			form.setError('password', {
				type: 'manual',
				message: 'Must be at least 8 characters.',
			});

			form.setError('confirmPassword', {
				type: 'manual',
				message: 'Passwords do not match.',
			});
		}, [form]);

		return (
			<Wrapper>
				<SignupFormUI {...args} form={form} onSubmit={() => {}} />
			</Wrapper>
		);
	},
};

export const WithServerError: Story = {
	render: (args) => {
		const form = useSignupForm({
			email: 'existing@example.com',
		});

		return (
			<Wrapper>
				<SignupFormUI
					{...args}
					form={form}
					serverError="An account with this email already exists."
					onSubmit={() => {}}
				/>
			</Wrapper>
		);
	},
};

export const WithServerSuggestion: Story = {
	render: (args) => {
		const form = useSignupForm({
			email: 'existing@example.com',
		});

		return (
			<Wrapper>
				<SignupFormUI
					{...args}
					form={form}
					serverError="We couldn't create your account."
					serverSuggestion="Try signing in instead or use another email."
					onSubmit={() => {}}
				/>
			</Wrapper>
		);
	},
};

export const Submitting: Story = {
	render: (args) => {
		const form = useSignupForm({
			firstName: 'Mohamed',
			lastName: 'Fathy',
			email: 'mohamed@example.com',
		});

		return (
			<Wrapper>
				<SignupFormUI
					{...args}
					form={form}
					isSubmitting
					onSubmit={() => {}}
				/>
			</Wrapper>
		);
	},
};

export const DarkMode: Story = {
	render: (args) => {
		const form = useSignupForm();

		return (
			<Wrapper>
				<SignupFormUI {...args} form={form} onSubmit={() => {}} />
			</Wrapper>
		);
	},

	parameters: {
		themes: { default: 'dark' },
	},
};
