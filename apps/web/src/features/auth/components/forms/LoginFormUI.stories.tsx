import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { LoginInput } from '@beggy/shared/types';

import LoginFormUI from './LoginFormUI';

const meta: Meta<typeof LoginFormUI> = {
	title: 'Features/Auth/Forms/LoginFormUI',
	component: LoginFormUI,
	tags: ['autodocs'],

	parameters: {
		layout: 'centered',

		docs: {
			description: {
				component: `
LoginFormUI is the **pure presentational authentication form** used by Beggy.

The component contains **no business logic**, **no API calls**, and **no routing**.
All lifecycle control is handled by the container layer.

---

### Interaction flow

Email → Password → Remember me → Submit

Validation errors appear inline while **server errors appear above the submit button**.

---

### Design Principles

• Identity-first input ordering  
• Prevent double submission during requests  
• Clear error recovery path  
• Consistent spacing (gap-5)  

---

### Accessibility

• aria-invalid for invalid fields  
• role="alert" for validation errors  
• required + aria-required for mandatory fields  
• label/input associations  

---

### Architecture

Container component responsibilities:

• validation schema  
• API mutations  
• routing  
• server error mapping  

UI component responsibilities:

• rendering fields  
• showing validation state  
• showing loading state  
• accessibility semantics
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
type Story = StoryObj<typeof LoginFormUI>;

const Wrapper = ({ children }: { children: React.ReactNode }) => (
	<div className="w-[420px]">{children}</div>
);

export const Default: Story = {
	render: (args) => {
		const form = useForm<LoginInput>({
			defaultValues: {
				email: '',
				password: '',
				rememberMe: false,
			},
		});

		return (
			<Wrapper>
				<LoginFormUI {...args} form={form} onSubmit={() => {}} />
			</Wrapper>
		);
	},
};

export const FilledForm: Story = {
	render: (args) => {
		const form = useForm<LoginInput>({
			defaultValues: {
				email: 'traveler@example.com',
				password: 'securePassword123',
				rememberMe: true,
			},
		});

		return (
			<Wrapper>
				<LoginFormUI {...args} form={form} onSubmit={() => {}} />
			</Wrapper>
		);
	},
};

export const WithValidationErrors: Story = {
	render: (args) => {
		const form = useForm<LoginInput>({
			defaultValues: {
				email: '',
				password: '',
				rememberMe: false,
			},
		});

		useEffect(() => {
			form.setError('email', {
				type: 'manual',
				message: 'Email is required',
			});

			form.setError('password', {
				type: 'manual',
				message: 'Password must be at least 8 characters',
			});
		}, [form]);

		return (
			<Wrapper>
				<LoginFormUI {...args} form={form} onSubmit={() => {}} />
			</Wrapper>
		);
	},
};

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
			<Wrapper>
				<LoginFormUI
					{...args}
					form={form}
					serverError="Invalid email or password."
					onSubmit={() => {}}
				/>
			</Wrapper>
		);
	},
};

export const WithServerSuggestion: Story = {
	render: (args) => {
		const form = useForm<LoginInput>({
			defaultValues: {
				email: 'user@example.com',
				password: 'wrong-password',
				rememberMe: false,
			},
		});

		return (
			<Wrapper>
				<LoginFormUI
					{...args}
					form={form}
					serverError="We couldn't sign you in."
					serverSuggestion="Double-check your email and password, then try again."
					onSubmit={() => {}}
				/>
			</Wrapper>
		);
	},
};

export const Submitting: Story = {
	render: (args) => {
		const form = useForm<LoginInput>({
			defaultValues: {
				email: 'traveler@example.com',
				password: 'securePassword123',
				rememberMe: true,
			},
		});

		return (
			<Wrapper>
				<LoginFormUI
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
		const form = useForm<LoginInput>({
			defaultValues: {
				email: '',
				password: '',
				rememberMe: false,
			},
		});

		return (
			<Wrapper>
				<LoginFormUI {...args} form={form} onSubmit={() => {}} />
			</Wrapper>
		);
	},

	globals: {
		theme: 'dark',
	},
};
