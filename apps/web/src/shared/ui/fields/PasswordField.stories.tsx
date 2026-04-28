'use client';

import { useForm } from 'react-hook-form';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import PasswordField from './PasswordField';

type FormValues = {
	password: string;
	confirmPassword?: string;
};

const meta: Meta<typeof PasswordField> = {
	title: 'UI/Fields/PasswordField',
	component: PasswordField,
	tags: ['autodocs'],

	parameters: {
		layout: 'centered',

		docs: {
			description: {
				component: `
PasswordField is a reusable password input component for forms using
react-hook-form.

It supports both **single password flows** (login) and **dual password flows**
(signup, reset password) with built-in visibility toggles and accessibility
support.

---

### What it is

A form field pair that manages:

• password input  
• optional confirm password input  
• visibility toggle controls  

The component integrates with react-hook-form using Controller.

---

### When to use it

Use this component in authentication flows:

• Account signup  
• Password reset  
• Account login (password-only mode)

---

### When not to use it

Do not use this component when:

• passwords are generated automatically
• password entry is not required
• custom password rules require alternative UI

---

### Interaction model

Users interact with the component through:

• typing into password fields  
• toggling visibility icons  
• submitting the form  

Visibility toggles switch between **password masking** and **plain text**.

---

### Constraints

• Password inputs always include visibility toggles  
• Confirm field can be disabled via \`confirmPasswordName={null}\`  
• Password rules are enforced by the parent validation schema

---

### Accessibility guarantees

The component provides:

• labelled inputs via \`FieldLabel\`  
• aria-invalid for validation states  
• aria-describedby for error messaging  
• toggle buttons with aria-pressed  

Focus remains inside the input during visibility toggling.

---

### Design system notes

• Inputs follow shadcn form field tokens  
• Visibility toggle icons animate using scale/opacity  
• Layout designed to live inside a FieldGroup container
`,
			},
		},
	},

	argTypes: {
		passwordLabel: {
			control: 'text',
			description: 'Label text for the password field.',
			table: {
				type: { summary: 'string' },
				defaultValue: { summary: 'Password' },
			},
		},

		confirmPasswordLabel: {
			control: 'text',
			description: 'Label text for the confirm password field.',
			table: {
				type: { summary: 'string' },
				defaultValue: { summary: 'Confirm Password' },
			},
		},

		passwordDescription: {
			control: 'text',
			description: 'Optional helper text shown below the password field.',
			table: {
				type: { summary: 'string | null' },
			},
		},

		passwordAutoComplete: {
			control: 'radio',
			options: ['current-password', 'new-password'],
			description: 'Browser autocomplete behavior.',
			table: {
				type: { summary: "'current-password' | 'new-password'" },
				defaultValue: { summary: 'new-password' },
			},
		},

		disabled: {
			control: 'boolean',
			description: 'Disables both password inputs.',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},

		control: { table: { disable: true } },
		passwordName: { table: { disable: true } },
		confirmPasswordName: { table: { disable: true } },
		className: { table: { disable: true } },
	},
};

export default meta;

type Story = StoryObj<typeof PasswordField>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FormWrapper(props: any) {
	const form = useForm<FormValues>({
		defaultValues: {
			password: '',
			confirmPassword: '',
		},
	});

	return (
		<div className="w-[320px] space-y-4">
			<PasswordField control={form.control} {...props} />
		</div>
	);
}

/**
 * Default signup flow.
 *
 * Displays both password and confirm password fields.
 */
export const Default: Story = {
	render: (args) => <FormWrapper {...args} />,
	parameters: {
		docs: {
			description: {
				story: 'Primary usage scenario for signup forms with password confirmation.',
			},
		},
	},
};

/**
 * Login form configuration.
 *
 * Only the password field is rendered.
 */
export const PasswordOnly: Story = {
	render: (args) => (
		<FormWrapper
			{...args}
			confirmPasswordName={null}
			passwordAutoComplete="current-password"
			passwordDescription={null}
		/>
	),
	parameters: {
		docs: {
			description: {
				story: 'Used in login forms where only a single password field is required.',
			},
		},
	},
};

/**
 * Disabled state.
 *
 * Used while authentication requests are in progress.
 */
export const Disabled: Story = {
	render: (args) => <FormWrapper {...args} disabled />,
	parameters: {
		docs: {
			description: {
				story: 'Interaction is disabled while the form is submitting.',
			},
		},
	},
};

/**
 * Layout constraint test.
 *
 * Ensures the component adapts correctly to narrow containers.
 */
export const NarrowContainer: Story = {
	render: (args) => (
		<div className="w-[240px]">
			<FormWrapper {...args} />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Stress test verifying layout stability in constrained containers.',
			},
		},
	},
};

/**
 * Dark mode verification.
 *
 * Ensures icon contrast and focus visibility remain accessible.
 */
export const DarkMode: Story = {
	render: (args) => <FormWrapper {...args} />,
	parameters: {
		docs: {
			description: {
				story: 'Dark theme validation ensuring icons, focus rings, and text remain readable.',
			},
		},
	},
	globals: {
		theme: 'dark',
	},
};
