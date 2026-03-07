import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import ItemFragileBadge from './ItemFragileBadge';

const meta: Meta<typeof ItemFragileBadge> = {
	title: 'Features/Items/Badges/ItemFragileBadge',
	component: ItemFragileBadge,
	tags: ['autodocs'],

	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component: `
## ItemFragileBadge

A compact visual indicator used to signal that an item **requires careful handling**.

The badge appears only when the item has the **fragile property**.  
If the item is not fragile, the component intentionally renders **nothing**.

This allows the badge to be rendered unconditionally in UI layouts without requiring conditional logic at the call site.

---

### When to use

Use \`ItemFragileBadge\` to visually communicate that an item must be handled with care.

Common product scenarios:

• suitcase packing lists  
• item detail views  
• inventory summaries  
• item cards and compact headers  
• packing review screens

The badge provides a quick **risk awareness signal** for the user.

---

### When not to use

Do **not** use this component:

• as a general warning message  
• for system errors or failures  
• for validation feedback  
• as an interactive control

The badge communicates **item metadata**, not application state.

---

### Interaction model

The badge is **non-interactive**.

Users cannot click, toggle, or dismiss it.  
Its role is purely **informational**.

Hover states exist only to maintain visual consistency with other badge tokens.

---

### Constraints

• The badge only renders when \`isFragile = true\`.  
• When \`isFragile = false\`, nothing is rendered.  
• The badge is designed to remain **compact and inline** with other item metadata.  
• In dense layouts the badge may render **icon-only**.

---

### Accessibility guarantees

The component communicates meaning using:

• \`role="status"\` to indicate a state change or important attribute  
• an accessible label describing the fragile condition  
• the icon is hidden from assistive technology to avoid duplicate announcements

Example screen reader output:

"Fragile item — handle with care"

---

### Design-system notes

• Uses the **soft destructive token pattern**  
• tinted background + full chroma text  
• avoids \`bg-destructive\` which represents error states

Fragile is a **property**, not a failure.

The visual tone is therefore **caution**, not **error**.

The badge must remain:

• visually subtle  
• clearly readable  
• consistent across light and dark themes
`,
			},
		},
	},

	argTypes: {
		isFragile: {
			control: 'boolean',
			description:
				'Determines whether the fragile indicator is displayed. When false the component renders nothing.',
			table: {
				type: { summary: 'boolean' },
			},
		},

		size: {
			control: 'radio',
			options: ['sm', 'md', 'lg'],
			description:
				'Controls badge density and icon scale for different layout contexts.',
			table: {
				type: { summary: '"sm" | "md" | "lg"' },
				defaultValue: { summary: 'md' },
			},
		},

		iconOnly: {
			control: 'boolean',
			description:
				'Renders only the fragile icon. Useful in compact layouts such as card headers.',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},

		className: {
			table: { disable: true },
		},
	},
};

export default meta;

type Story = StoryObj<typeof ItemFragileBadge>;

/**
 * Default fragile indicator.
 *
 * Displays the icon and label to communicate
 * that the item requires careful handling.
 */
export const Default: Story = {
	args: {
		isFragile: true,
	},
	parameters: {
		docs: {
			description: {
				story: 'Standard fragile badge showing both icon and label. This is the most common usage within item lists and packing summaries.',
			},
		},
	},
};

/**
 * Compact icon-only representation.
 *
 * Used when space is limited such as in card headers
 * or thumbnail overlays.
 */
export const IconOnly: Story = {
	args: {
		isFragile: true,
		iconOnly: true,
		size: 'sm',
	},
	parameters: {
		docs: {
			description: {
				story: 'Compact icon-only fragile indicator used in dense layouts where full labels would consume excessive space.',
			},
		},
	},
};

/**
 * Large badge variant.
 *
 * Emphasizes the fragile property in contexts
 * where item details are more prominent.
 */
export const Large: Story = {
	args: {
		isFragile: true,
		size: 'lg',
	},
	parameters: {
		docs: {
			description: {
				story: 'Expanded badge size used in detail views or summary cards where item properties are emphasized.',
			},
		},
	},
};

/**
 * Non-fragile state.
 *
 * Demonstrates that the component renders
 * nothing when the property is false.
 */
export const NotFragile: Story = {
	args: {
		isFragile: false,
	},
	parameters: {
		docs: {
			description: {
				story: 'When the item is not fragile the badge intentionally renders nothing. This allows developers to render the component without conditional checks.',
			},
		},
	},
};

/**
 * Dark mode validation.
 *
 * Ensures token contrast and readability
 * on dark UI surfaces.
 */
export const DarkMode: Story = {
	args: {
		isFragile: true,
	},
	parameters: {
		themes: { default: 'dark' },
		docs: {
			description: {
				story: 'Validates the soft destructive token pattern in dark mode to ensure proper contrast and visual clarity.',
			},
		},
	},
};
