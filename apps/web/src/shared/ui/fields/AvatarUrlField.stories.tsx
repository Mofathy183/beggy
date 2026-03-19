'use client';

import { useForm } from 'react-hook-form';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import AvatarUrlField from './AvatarUrlField';

type FormValues = {
	avatarUrl: string;
};

const meta: Meta<typeof AvatarUrlField> = {
	title: 'UI/Fields/AvatarUrlField',
	component: AvatarUrlField,
	tags: ['autodocs'],

	parameters: {
		layout: 'centered',

		docs: {
			description: {
				component: `
AvatarUrlField allows users to provide a public avatar image URL
and preview the result instantly inside the form.

The component combines a URL input with an avatar preview that
updates after a short debounce delay.

---

### What it is

A form field used to configure a user avatar by entering an image URL.

The preview shows four visual states:

• empty  
• loading  
• loaded  
• error  

---

### When to use it

Use this component in profile or onboarding forms where users
can supply a public avatar image.

Common examples include:

• profile settings  
• signup onboarding  
• community account creation  

---

### When not to use it

Do not use this component when:

• images are uploaded via file input  
• avatars are generated automatically  
• avatar preview is unnecessary  

---

### Interaction model

1. The user types a URL.
2. The preview waits briefly (debounced).
3. The avatar attempts to load the image.
4. The preview transitions between loading, success, or error.

Users can clear the URL using the clear button.

---

### Constraints

• Accepts public image URLs only  
• Broken images show a visual error state  
• Debounced updates prevent excessive network requests  

---

### Accessibility guarantees

• Avatar preview exposes \`role="img"\`  
• Loading state exposes \`aria-busy\`  
• Error hints use \`aria-live="polite"\`  
• Input uses \`aria-invalid\` when appropriate  

---

### Design-system notes

• Avatar uses shadcn Avatar primitives  
• Fallback initials derived from displayName  
• Skeleton loading pulse during image fetch  
• Designed for use inside a FieldGroup layout
`,
			},
		},
	},

	argTypes: {
		label: {
			control: 'text',
			description: 'Label displayed above the field.',
			table: {
				type: { summary: 'string' },
				defaultValue: { summary: 'Avatar URL' },
			},
		},

		description: {
			control: 'text',
			description: 'Helper text displayed below the input.',
			table: {
				type: { summary: 'string | null' },
			},
		},

		displayName: {
			control: 'text',
			description: 'Name used for avatar fallback initials.',
			table: {
				type: { summary: 'string' },
				defaultValue: { summary: 'User' },
			},
		},

		disabled: {
			control: 'boolean',
			description: 'Disables input interaction.',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},

		control: { table: { disable: true } },
		name: { table: { disable: true } },
		className: { table: { disable: true } },
	},
};

export default meta;

type Story = StoryObj<typeof AvatarUrlField>;

function FormWrapper(props: any) {
	const form = useForm<FormValues>({
		defaultValues: {
			avatarUrl: props.defaultValue ?? '',
		},
	});

	return (
		<div className="w-full">
			<AvatarUrlField
				control={form.control}
				displayName="Bruce Wayne"
				{...props}
			/>
		</div>
	);
}

/**
 * Default state with no avatar URL.
 *
 * The preview displays fallback initials derived
 * from the provided displayName.
 */
export const Default: Story = {
	render: (args) => <FormWrapper {...args} />,

	parameters: {
		docs: {
			description: {
				story: 'Initial empty state before the user enters a URL.',
			},
		},
	},
};

/**
 * Avatar successfully loaded.
 *
 * The preview shows the fetched image.
 */
export const LoadedPreview: Story = {
	render: (args) => (
		<FormWrapper {...args} defaultValue="https://i.pravatar.cc/200" />
	),

	parameters: {
		docs: {
			description: {
				story: 'Successful preview state when the avatar image loads.',
			},
		},
	},
};

/**
 * Broken image URL.
 *
 * The avatar shows an error fallback and the input
 * displays a destructive hint.
 */
export const BrokenImage: Story = {
	render: (args) => (
		<FormWrapper
			{...args}
			defaultValue="https://example.com/broken-avatar.jpg"
		/>
	),

	parameters: {
		docs: {
			description: {
				story: 'Error state shown when the provided URL does not resolve to a valid image.',
			},
		},
	},
};

/**
 * Disabled state.
 *
 * Interaction is blocked while the parent form is submitting.
 */
export const Disabled: Story = {
	render: (args) => <FormWrapper {...args} disabled />,

	parameters: {
		docs: {
			description: {
				story: 'Used when the parent form is submitting or locked.',
			},
		},
	},
};

/**
 * Layout constraint test.
 *
 * Ensures the field adapts correctly to narrow containers.
 */
export const NarrowContainer: Story = {
	render: (args) => (
		<div className="w-[220px]">
			<FormWrapper {...args} />
		</div>
	),

	parameters: {
		docs: {
			description: {
				story: 'Verifies layout stability when space is limited.',
			},
		},
	},
};

/**
 * Dark mode verification.
 *
 * Used to confirm token contrast and icon visibility.
 */
export const DarkMode: Story = {
	render: (args) => <FormWrapper {...args} />,

	parameters: {
		docs: {
			description: {
				story: 'Dark theme validation ensuring avatar fallback and borders remain visible.',
			},
		},
	},
	globals: {
		theme: 'dark',
	},
};
