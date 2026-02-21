import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import UserDetailsHeader from './UserDetailsHeader';
import { AdminUserDTO } from '@beggy/shared/types';
import { Role } from '@beggy/shared/constants';

/* -------------------------------------------------------------------------- */
/*                               MOCK DATA                                    */
/* -------------------------------------------------------------------------- */

const mockUser: AdminUserDTO = {
	id: 'user-1',
	email: 'admin@beggy.app',
	isActive: true,
	role: Role.USER,
	isEmailVerified: false,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
};

/* -------------------------------------------------------------------------- */
/*                                   META                                     */
/* -------------------------------------------------------------------------- */

const meta: Meta<typeof UserDetailsHeader> = {
	title: 'Features/Users/Details/UserDetailsHeader',
	component: UserDetailsHeader,
	tags: ['autodocs'],
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component: `
### UserDetailsHeader

#### What it is
A contextual administrative page header used on the **User Details** screen.
It establishes navigation context, displays primary identity (email),
and exposes privileged management actions.

---

#### Where it lives
Admin → Users → User Details

---

#### When to use it
- At the top of an admin user details page.
- When administrators need quick access to user management actions.
- In layouts where identity clarity is required before actions.

---

#### When NOT to use it
- Public profile pages.
- End-user self-service account screens.
- Inside cards, modals, or embedded panels.

---

#### Interaction Model
- **Back to users** triggers router.back().
- Email is rendered as the primary page heading (h1).
- Right-side action cluster is controlled by:
  - \`isActive\`
  - \`isCurrentUser\`
- \`onEdit\` triggers edit flow.

---

#### Layout & Visual Constraints
- Horizontal split layout.
- Left: navigation + title stack.
- Right: action cluster.
- Must sit inside a container (not full-bleed).
- Spacing tokens only (no hardcoded pixel values).

---

#### Accessibility Guarantees
- Semantic \`h1\` for page identity.
- Back button is keyboard accessible.
- Action controls must preserve visible focus states.
- Clear contrast for interactive elements.

---

#### Design-System Notes
- Typography tokens only.
- Uses muted-foreground for supporting text.
- Action group right-aligned.
- No layout shift between active/inactive states.
        `,
			},
		},
	},
	argTypes: {
		user: {
			description: 'Admin user object driving identity and state.',
			table: {
				type: { summary: 'AdminUserDTO' },
			},
			control: false,
		},
		isCurrentUser: {
			description:
				'True when the viewed user matches the logged-in admin. Used to restrict destructive actions.',
			table: {
				type: { summary: 'boolean' },
			},
			control: false,
		},
		onEdit: {
			description: 'Callback triggered when Edit action is selected.',
			table: { type: { summary: '() => void' } },
			control: false,
		},
		className: {
			description: 'Optional layout extension hook.',
			table: { type: { summary: 'string' } },
			control: false,
		},
	},
};

export default meta;
type Story = StoryObj<typeof UserDetailsHeader>;

/* -------------------------------------------------------------------------- */
/*                                   STORIES                                  */
/* -------------------------------------------------------------------------- */

export const Default: Story = {
	args: {
		user: mockUser,
	},
};

export const InactiveUser: Story = {
	args: {
		user: {
			...mockUser,
			isActive: false,
		},
	},
};

export const ViewingSelf: Story = {
	args: {
		user: mockUser,
		isCurrentUser: true,
	},
};

export const DarkMode: Story = {
	args: {
		user: mockUser,
	},
	decorators: [
		(Story) => (
			<div className="dark bg-background p-6">
				<Story />
			</div>
		),
	],
};
