import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import FormServerError from './FormServerError';

const meta: Meta<typeof FormServerError> = {
	title: 'UI/Error/FormServerError',
	component: FormServerError,
	tags: ['autodocs'],

	parameters: {
		layout: 'centered',

		docs: {
			description: {
				component: `
FormServerError displays API validation or server failures inside forms.

It is designed to map directly to backend responses where the server
returns a **human-readable error message** and optionally a **recovery suggestion**.

---

### What it is

A soft-destructive alert used inside forms to communicate failures that
occur after form submission.

It renders nothing when \`message\` is null or undefined, allowing the
component to always be mounted without conditional rendering.

---

### When to use it

Use this component when the server rejects a form submission.

Typical examples:

• authentication errors  
• validation failures returned from the API  
• permission errors  
• temporary server issues  

---

### When not to use it

Do not use this component for:

• client-side validation errors  
• field-specific validation messages  
• success confirmations  

Field-level validation should use the form field's \`FieldError\`.

---

### Interaction model

The component is **non-interactive**.

Users read the message and may follow the optional suggestion to recover.

---

### Constraints

• Requires a \`message\` to render  
• Suggestion text is optional  
• Intended to appear **above the submit button**

---

### Accessibility guarantees

• Uses \`role="alert"\` for immediate announcement  
• Includes \`aria-live="polite"\` for screen reader updates  
• Semantic alert structure via shadcn Alert primitives

---

### Design-system notes

• Uses the **soft destructive pattern**  
• Tinted background with destructive border  
• High-contrast icon and title text  
• Muted suggestion text for secondary guidance
`,
			},
		},
	},

	argTypes: {
		message: {
			control: 'text',
			description:
				'Primary server error message shown as the alert title.',
			table: {
				type: { summary: 'string | null | undefined' },
			},
		},

		suggestion: {
			control: 'text',
			description:
				'Optional recovery suggestion shown below the main message.',
			table: {
				type: { summary: 'string | null' },
			},
		},

		className: {
			table: { disable: true },
		},
	},
};

export default meta;

type Story = StoryObj<typeof FormServerError>;

/**
 * Default server error.
 *
 * Shows the main error message returned by the API.
 */
export const Default: Story = {
	args: {
		message: 'Something went wrong while saving your profile.',
	},

	parameters: {
		docs: {
			description: {
				story: 'Basic server error with a single message.',
			},
		},
	},
};

/**
 * Error with recovery suggestion.
 *
 * The server provides guidance on how the user can resolve the issue.
 */
export const WithSuggestion: Story = {
	args: {
		message: 'Unable to update your password.',
		suggestion:
			'Please ensure your current password is correct and try again.',
	},

	parameters: {
		docs: {
			description: {
				story: 'Displays both the error message and a suggested recovery action.',
			},
		},
	},
};

/**
 * Form layout example.
 *
 * Demonstrates how the error appears inside a typical form layout.
 */
export const InsideFormLayout: Story = {
	render: (args) => (
		<div className="w-[360px] space-y-4">
			<div className="border rounded-lg p-4 space-y-4">
				<div className="text-sm text-muted-foreground">
					Form content placeholder
				</div>

				<FormServerError {...args} />

				<button className="w-full bg-primary text-primary-foreground rounded-md py-2 text-sm">
					Submit
				</button>
			</div>
		</div>
	),

	args: {
		message: 'Your session expired.',
		suggestion: 'Please sign in again to continue.',
	},

	parameters: {
		docs: {
			description: {
				story: 'Shows how the component appears inside a form above the submit button.',
			},
		},
	},
};

/**
 * Layout stress test.
 *
 * Ensures the alert wraps correctly in narrow containers.
 */
export const NarrowContainer: Story = {
	render: (args) => (
		<div className="w-[240px]">
			<FormServerError {...args} />
		</div>
	),

	args: {
		message: 'We could not update your profile.',
		suggestion: 'Please check your internet connection and try again.',
	},

	parameters: {
		docs: {
			description: {
				story: 'Verifies wrapping behavior in constrained layouts.',
			},
		},
	},
};

/**
 * Dark mode verification.
 *
 * Used to confirm destructive tokens maintain accessible contrast.
 */
export const DarkMode: Story = {
	args: {
		message: 'Unable to connect to the server.',
		suggestion: 'Please try again in a few minutes.',
	},

	parameters: {
		docs: {
			description: {
				story: 'Dark theme validation ensuring destructive colors remain readable.',
			},
		},
	},
	globals: {
		theme: 'dark',
	},
};
