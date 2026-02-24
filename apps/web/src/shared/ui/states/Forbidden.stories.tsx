import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from '@shadcn-ui/button';
import Forbidden from './Forbidden';
import { ErrorCode } from '@beggy/shared/constants';

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
		/**
		 * Mounts the Next.js App Router context before rendering.
		 * Required because ForbiddenState calls useRouter() — even though
		 * the router is only used inside click handlers, the hook itself
		 * must be called at mount and needs the App Router context.
		 */
		nextjs: {
			appDirectory: true,
		},
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
		errorCode: {
			description:
				'ErrorCode from @beggy/shared/constants returned by the API.',
			control: false,
			table: { type: { summary: 'ErrorCode' } },
		},
		requiredPermission: {
			description: 'CASL permission string that was denied.',
			control: 'text',
			table: { type: { summary: 'string' } },
		},
		onBack: {
			description:
				'Pass true to use router.back(), or a function for custom behavior.',
			action: 'backClicked',
			table: { category: 'Events' },
		},
		action: {
			description:
				'Optional custom action node — e.g. "Request access", "Upgrade plan".',
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
		errorCode: ErrorCode.ACCESS_DENIED,
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
		errorCode: ErrorCode.ROLE_RESTRICTED,
		onBack: () => {},
	},
};

export const WithRequiredPermission: Story = {
	args: {
		title: 'Insufficient permissions',
		description: 'Your role does not include access to this resource.',
		errorCode: ErrorCode.ROLE_RESTRICTED,
		requiredPermission: 'update:Bag',
	},
};

export const WithBothCodeAndPermission: Story = {
	name: 'Error code + Required permission (two-column)',
	args: {
		errorCode: ErrorCode.ACCESS_DENIED,
		requiredPermission: 'manage:User',
	},
};

export const WithCustomAction: Story = {
	args: {
		title: 'Upgrade required',
		description: 'Your current plan does not include this feature.',
		errorCode: ErrorCode.ACCESS_DENIED,
		action: <Button>Upgrade plan</Button>,
	},
};

export const WithBackAndAction: Story = {
	args: {
		title: 'Restricted area',
		description:
			'Contact your administrator if you believe this is an error.',
		errorCode: ErrorCode.ROLE_RESTRICTED,
		onBack: () => {},
		action: <Button variant="secondary">Contact admin</Button>,
	},
};

export const DarkMode: Story = {
	args: {
		errorCode: ErrorCode.ACCESS_DENIED,
		onBack: () => {},
	},
	parameters: {
		themes: { default: 'dark' },
		docs: {
			description: {
				story: 'Validates warning tokens maintain contrast in dark mode.',
			},
		},
	},
};
