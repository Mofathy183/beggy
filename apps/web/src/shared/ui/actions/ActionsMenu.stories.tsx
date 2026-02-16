import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import ActionsMenu, { type ActionsMenuItem } from './ActionsMenu';

import {
	PencilEdit01Icon,
	Delete02Icon,
	Share08Icon,
} from '@hugeicons/core-free-icons';

const meta: Meta<typeof ActionsMenu> = {
	title: 'UI/Actions/ActionsMenu',
	component: ActionsMenu,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
A compact contextual actions menu triggered by an icon button.

### What it is
A kebab-style dropdown menu (three vertical dots) used to expose secondary or contextual actions for a specific entity such as a table row, card, or list item.

### When to use it
- When actions are contextual to a specific item
- When primary UI must remain visually minimal
- When destructive actions should be visually separated from safe actions

### When not to use it
- For primary page actions
- For navigation
- When actions must always be visible for clarity

### Interaction model
- Triggered via icon button (mouse or keyboard)
- Opens a dropdown aligned to the trigger
- Items can be disabled
- Destructive actions are visually emphasized
- Keyboard navigable via Radix primitives

### Constraints
- Menu width is fixed for consistency
- Designed for short action labels
- Not intended for complex nested actions

### Accessibility guarantees
- Fully keyboard navigable
- Proper focus management via Radix
- Disabled items are semantically marked
- Destructive styling does not rely on color alone (text + focus state)

### Design-system notes
- Built using shadcn + Radix primitives
- Token-driven destructive color usage
- Ghost icon button trigger
- Supports dark mode via theme tokens
        `,
			},
		},
	},
	argTypes: {
		items: {
			description:
				'Array of contextual action items displayed inside the dropdown.',
			control: false,
			table: {
				type: { summary: 'ActionsMenuItem[]' },
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof ActionsMenu>;

const baseItems: ActionsMenuItem[] = [
	{
		id: 'edit',
		label: 'Edit',
		icon: PencilEdit01Icon,
		onSelect: () => {},
	},
	{
		id: 'share',
		label: 'Share',
		icon: Share08Icon,
		onSelect: () => {},
	},
	{
		id: 'delete',
		label: 'Delete',
		icon: Delete02Icon,
		variant: 'destructive',
		showSeparatorBefore: true,
		onSelect: () => {},
	},
];

/**
 * Default contextual menu used inside list rows or cards.
 *
 * This represents the typical case where multiple safe actions
 * are available along with one destructive action separated visually.
 */
export const Default: Story = {
	args: {
		items: baseItems,
	},
	parameters: {
		docs: {
			description: {
				story: 'Standard contextual menu with grouped safe actions and a destructive action separated for clarity.',
			},
		},
	},
};

/**
 * Represents a scenario where an action is temporarily unavailable.
 *
 * The disabled state is visually muted and non-interactive.
 */
export const WithDisabledItem: Story = {
	args: {
		items: [
			...baseItems,
			{
				id: 'archive',
				label: 'Archive (Unavailable)',
				disabled: true,
				onSelect: () => {},
			},
		],
	},
	parameters: {
		docs: {
			description: {
				story: 'Demonstrates disabled action state where the option is visible but not interactive.',
			},
		},
	},
};

/**
 * Used when only safe secondary actions are available.
 *
 * No separator or destructive styling is present.
 */
export const SafeActionsOnly: Story = {
	args: {
		items: baseItems.filter((item) => item.variant !== 'destructive'),
	},
	parameters: {
		docs: {
			description: {
				story: 'Menu containing only safe actions without destructive emphasis.',
			},
		},
	},
};

/**
 * Validates visual contrast and token correctness in dark theme.
 *
 * Ensures destructive and disabled states remain accessible.
 */
export const DarkMode: Story = {
	args: {
		items: baseItems,
	},
	parameters: {
		themes: {
			default: 'dark',
		},
		docs: {
			description: {
				story: 'Dark mode verification ensuring destructive color tokens and focus states maintain contrast.',
			},
		},
	},
};
