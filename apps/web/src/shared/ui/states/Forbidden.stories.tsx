import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from '@shadcn-ui/button';
import Forbidden from './Forbidden';

/**
 * Storybook configuration for Forbidden component.
 *
 * Represents an authorization denial UI state.
 * This component is intentionally presentational and stateless.
 */
const meta: Meta<typeof Forbidden> = {
	title: 'UI/States/Forbidden',
	component: Forbidden,
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component: `
A presentational UI state representing **authorization denial**.

### Philosophy

- Authorization denial is a valid state — not an error.
- Neutral visual tone (no danger styling).
- Provides optional escape hatches.

### Responsibilities

✔ Render access restriction message  
✔ Provide optional back navigation  
✔ Allow contextual action injection  

### Non-Responsibilities

✖ Does NOT check permissions  
✖ Does NOT redirect  
✖ Does NOT infer roles  
        `,
			},
		},
	},
	argTypes: {
		title: {
			description: 'Optional title explaining the restriction.',
			control: 'text',
		},
		description: {
			description: 'Optional description providing context to the user.',
			control: 'text',
		},
		onBack: {
			description: `
Optional callback triggered when "Go back" is clicked.

Typically wired to router.back() or navigate(-1).
      `,
			action: 'backClicked',
			table: {
				category: 'Events',
			},
		},
		action: {
			description: `
Optional custom action element.

Examples:
- Request access
- Contact admin
- Upgrade plan
      `,
			control: false,
		},
	},
};

export default meta;
type Story = StoryObj<typeof Forbidden>;

/**
 * Default minimal state.
 *
 * No actions provided.
 */
export const Default: Story = {
	args: {
		title: 'Access restricted',
		description: 'You do not have permission to view this content.',
	},
};

/**
 * With Back button.
 *
 * Typical page-level usage.
 */
export const WithBackButton: Story = {
	args: {
		title: 'Admins only',
		description: 'Only administrators can manage user accounts.',
		onBack: () => {},
	},
};

/**
 * With Custom Action.
 *
 * Demonstrates injected contextual action.
 */
export const WithCustomAction: Story = {
	args: {
		title: 'Upgrade required',
		description: 'Your current plan does not include this feature.',
		action: <Button>Upgrade plan</Button>,
	},
};

/**
 * Full variant.
 *
 * Includes both back button and custom action.
 */
export const WithBackAndAction: Story = {
	args: {
		title: 'Restricted area',
		description:
			'Contact your administrator if you believe this is an error.',
		onBack: () => {},
		action: <Button variant="secondary">Contact admin</Button>,
	},
};
