'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import FormDialog from './FormDialog';

import { Button } from '@shadcn-ui/button';
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from '@shadcn-ui/card';
import { Input } from '@shadcn-ui/input';
import { Label } from '@shadcn-ui/label';

/**
 * Mock short form used in multiple stories.
 */
function ShortForm({ onCancel }: { onCancel: () => void }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Create user</CardTitle>
				<CardDescription>
					Small form example used for dialog stories.
				</CardDescription>
			</CardHeader>

			<CardContent className="space-y-4">
				<div className="space-y-2">
					<Label>Name</Label>
					<Input placeholder="Jane Doe" />
				</div>

				<div className="space-y-2">
					<Label>Email</Label>
					<Input placeholder="jane@example.com" />
				</div>
			</CardContent>

			<CardFooter className="flex justify-end gap-2">
				<Button variant="outline" onClick={onCancel}>
					Cancel
				</Button>

				<Button>Create</Button>
			</CardFooter>
		</Card>
	);
}

/**
 * Mock long form used to demonstrate scroll behaviour.
 */
function LongForm({ onCancel }: { onCancel: () => void }) {
	const FIELDS = Array.from({ length: 12 });

	return (
		<Card>
			<CardHeader>
				<CardTitle>Create Item</CardTitle>
				<CardDescription>
					Example long form to demonstrate scroll layout.
				</CardDescription>
			</CardHeader>

			<CardContent className="space-y-4">
				{FIELDS.map((_, i) => (
					<div key={i} className="space-y-2">
						<Label>Field {i + 1}</Label>
						<Input placeholder={`Value ${i + 1}`} />
					</div>
				))}
			</CardContent>

			<CardFooter className="flex justify-end gap-2">
				<Button variant="outline" onClick={onCancel}>
					Cancel
				</Button>

				<Button>Create</Button>
			</CardFooter>
		</Card>
	);
}

const meta = {
	title: 'UI/Dialogs/FormDialog',
	component: FormDialog,
	tags: ['autodocs'],

	parameters: {
		docs: {
			description: {
				component: `
FormDialog renders a **form container inside a modal dialog surface**.

The component acts as a structural wrapper for existing form containers
(CreateItemForm, CreateUserForm, EditProfileForm, etc.) without requiring
any changes to the form implementation.

Forms are provided through a **render prop** that receives an \`onCancel\`
function. The form passes this function to its Cancel button so the dialog
can close itself.

---

### When to use it

Use FormDialog when a form should appear as a **focused modal workflow**:

• Create item  
• Create user  
• Edit profile  
• Update entity  
• Change role  

These actions temporarily interrupt the page but do not require navigation.

---

### When not to use it

Avoid dialogs for:

• large editing flows  
• multi-step wizards  
• onboarding experiences  
• long configuration pages  

Those should use **dedicated pages**.

---

### Interaction model

1. User activates a trigger element.
2. Dialog opens with the form content.
3. The form handles submission internally.
4. The Cancel button triggers the provided \`onCancel\`.
5. Dialog closes via Cancel, Escape, or backdrop click.

---

### Layout constraints

Dialog width is controlled by the \`size\` prop:

sm → compact forms  
md → standard editing forms  
lg → wide layouts

When \`scrollable=true\`:

• CardHeader stays fixed  
• CardFooter stays fixed  
• CardContent becomes scrollable

This ensures action buttons remain visible.

---

### Accessibility guarantees

Because FormDialog uses Radix Dialog primitives:

• focus is trapped within the dialog  
• Escape closes the dialog  
• aria roles are applied automatically  
• screen readers detect modal context  
• keyboard navigation is preserved

---

### Design system notes

The dialog surface replaces the Card's visual surface.

Card border, shadow, and background are neutralized
through data-slot CSS selectors while preserving spacing.
        `,
			},
		},
	},

	argTypes: {
		trigger: {
			control: false,
			description: 'Interactive element that opens the dialog.',
			table: {
				type: { summary: 'ReactElement' },
			},
		},

		form: {
			control: false,
			description:
				'Render prop receiving an onCancel function used to close the dialog.',
			table: {
				type: { summary: '(onCancel: () => void) => ReactNode' },
			},
		},

		size: {
			control: 'select',
			options: ['sm', 'md', 'lg'],
			description: 'Maximum width of the dialog.',
			table: {
				type: { summary: "'sm' | 'md' | 'lg'" },
				defaultValue: { summary: 'sm' },
			},
		},

		scrollable: {
			control: 'boolean',
			description:
				'When enabled the CardContent region scrolls while header and footer remain visible.',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'true' },
			},
		},

		className: { table: { disable: true } },
	},
} satisfies Meta<typeof FormDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default modal workflow.
 *
 * A button opens the dialog and reveals a standard form layout.
 */
export const Default: Story = {
	args: {
		trigger: <Button>Create user</Button>,
		form: (onCancel) => <ShortForm onCancel={onCancel} />,
	},

	parameters: {
		docs: {
			description: {
				story: 'Standard dialog usage with a short form that fits without scrolling.',
			},
		},
	},
};

/**
 * Wider dialog used for editing workflows.
 */
export const MediumWidth: Story = {
	args: {
		size: 'md',
		trigger: <Button>Edit profile</Button>,
		form: (onCancel) => <ShortForm onCancel={onCancel} />,
	},

	parameters: {
		docs: {
			description: {
				story: 'A wider dialog layout used for forms with additional inputs.',
			},
		},
	},
};

/**
 * Non-scrollable dialog layout.
 *
 * Used when the form is small enough to
 * fit completely inside the dialog panel.
 */
export const NoScroll: Story = {
	args: {
		scrollable: false,
		trigger: <Button variant="outline">Change role</Button>,
		form: (onCancel) => <ShortForm onCancel={onCancel} />,
	},

	parameters: {
		docs: {
			description: {
				story: 'Used for single-field or compact forms where scrolling is unnecessary.',
			},
		},
	},
};

/**
 * Scroll stress test.
 *
 * Demonstrates the frozen header and footer layout
 * when form content exceeds the viewport height.
 */
export const ScrollableForm: Story = {
	args: {
		size: 'md',
		scrollable: true,
		trigger: <Button>Add item</Button>,
		form: (onCancel) => <LongForm onCancel={onCancel} />,
	},

	parameters: {
		docs: {
			description: {
				story: `
Demonstrates the **scroll layout mode**.

When the form becomes taller than the viewport:

• Dialog height is capped at 90vh  
• CardHeader stays visible  
• CardFooter stays visible  
• CardContent scrolls independently

This ensures users can always reach
the **Cancel and Submit buttons**.
        `,
			},
		},
	},
};

/**
 * Dark mode validation.
 *
 * Ensures dialog tokens and borders remain
 * accessible in dark themes.
 */
export const DarkMode: Story = {
	args: {
		trigger: <Button>Create user</Button>,
		form: (onCancel) => <ShortForm onCancel={onCancel} />,
	},

	parameters: {
		themes: { default: 'dark' },

		docs: {
			description: {
				story: 'Validates contrast, focus rings, and dialog surface tokens in dark mode.',
			},
		},
	},
};
