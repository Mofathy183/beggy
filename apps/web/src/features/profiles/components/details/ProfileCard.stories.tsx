import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import ProfileCard, { ProfileCardSkeleton } from './ProfileCard';
import { Gender } from '@beggy/shared/constants';
import type { ProfileDTO } from '@beggy/shared/types';

const BASE_PROFILE: ProfileDTO = {
	id: '1',
	userId: '1',
	firstName: 'Mohamed',
	lastName: 'Fathy',
	displayName: 'Mohamed Fathy',
	avatarUrl: 'https://i.pravatar.cc/300?img=12',
	gender: Gender.MALE,
	city: 'Cairo',
	country: 'Egypt',
	birthDate: '1998-04-12',
	age: 27,
	createdAt: '2022-01-15T00:00:00.000Z',
	updatedAt: '2022-01-15T00:00:00.000Z',
};

const DISPLAY_NAME_DIFFERS: ProfileDTO = {
	...BASE_PROFILE,
	displayName: 'Mo Dev',
};

const MINIMAL_PROFILE: ProfileDTO = {
	...BASE_PROFILE,
	displayName: undefined,
	city: null,
	country: null,
	birthDate: null,
	age: undefined,
	gender: null,
};

const meta = {
	title: 'Features/Profiles/UI/ProfileCard',
	component: ProfileCard,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
**ProfileCard** is a read-only identity summary card for the authenticated user.

It presents:
- Avatar
- Display name
- Optional sub-name
- Gender badge
- Location
- Birthday (with tooltip age)
- Optional "Member since"
- Optional Edit affordance

---

### When to use

- Settings pages
- Dashboard overview
- Account summaries
- Authenticated identity panels

---

### When not to use

- Editable forms
- Public profile pages with dynamic layout
- As a list row (use compact variant instead)

---

### Interaction Model

- Non-editable by default
- Edit button appears only when handler provided
- Tooltips enhance metadata clarity
- Hover elevation is decorative only

---

### UX Rules Enforced

- Empty fields are silently omitted
- No "Not set" placeholders
- Sub-name appears only when displayName differs
- GenderBadge omission is automatic
- Member since is opt-in

---

### Accessibility Guarantees

- Avatar alt text provided
- Tooltip accessible via keyboard
- Edit button has aria-label
- Icons are decorative (aria-hidden)

---

### Design-System Notes

- Built with shadcn Card primitives
- Token-driven color usage
- Subtle hover shadow lift
- Layout remains stable across states
- Fully dark-mode compatible
`,
			},
		},
	},
	argTypes: {
		profile: { table: { disable: true } },
		onEdit: { table: { disable: true } },
		showMemberSince: {
			description: 'Displays the "Member since" metadata row.',
			control: { type: 'boolean' },
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},
		className: { table: { disable: true } },
	},
} satisfies Meta<typeof ProfileCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default read-only state.
 *
 * Occurs on dashboard overview surfaces.
 * No edit action.
 */
export const Default: Story = {
	args: {
		profile: BASE_PROFILE,
	},
	parameters: {
		docs: {
			description: {
				story: 'Standard identity summary without edit affordance.',
			},
		},
	},
};

/**
 * Settings page usage.
 *
 * Edit button appears when handler is provided.
 * Button is ghost variant with tooltip.
 */
export const WithEditAction: Story = {
	args: {
		profile: BASE_PROFILE,
		onEdit: () => {},
	},
	parameters: {
		docs: {
			description: {
				story: 'Displays edit affordance when onEdit is provided.',
			},
		},
	},
};

/**
 * Account page usage.
 *
 * Member since row is opt-in and used when
 * account context adds value.
 */
export const WithMemberSince: Story = {
	args: {
		profile: BASE_PROFILE,
		showMemberSince: true,
	},
	parameters: {
		docs: {
			description: {
				story: 'Displays membership metadata for account context.',
			},
		},
	},
};

/**
 * Sub-name state.
 *
 * Occurs when displayName differs from first + last.
 * Sub-name appears beneath primary heading.
 */
export const DisplayNameDiffers: Story = {
	args: {
		profile: DISPLAY_NAME_DIFFERS,
	},
	parameters: {
		docs: {
			description: {
				story: 'Shows secondary full name when displayName differs.',
			},
		},
	},
};

/**
 * Minimal data state.
 *
 * Demonstrates silent omission:
 * - No location
 * - No birthday
 * - No gender
 * - No sub-name
 *
 * Layout remains visually balanced.
 */
export const MinimalData: Story = {
	args: {
		profile: MINIMAL_PROFILE,
	},
	parameters: {
		docs: {
			description: {
				story: 'Demonstrates omission behavior when optional fields are absent.',
			},
		},
	},
};

/**
 * Loading placeholder.
 *
 * Used during profile fetch.
 * Layout matches final card exactly for seamless transition.
 */
export const LoadingSkeleton = {
	render: () => <ProfileCardSkeleton />,
	parameters: {
		docs: {
			description: {
				story: 'Skeleton state shown while profile data is loading.',
			},
		},
	},
} satisfies StoryObj<typeof ProfileCardSkeleton>;

/**
 * Dark mode validation.
 *
 * Ensures:
 * - Card contrast remains accessible
 * - Hover shadow subtlety remains correct
 * - Muted containers visible
 * - Badge tokens remain balanced
 */
export const DarkMode: Story = {
	args: {
		profile: BASE_PROFILE,
		showMemberSince: true,
		onEdit: () => {},
	},
	parameters: {
		themes: {
			themeOverride: 'dark',
		},
		docs: {
			description: {
				story: 'Validates token usage and contrast in dark mode.',
			},
		},
	},
};

/**
 * Accessibility validation state.
 *
 * Use addon-a11y to verify:
 * - aria-label on edit button
 * - Tooltip keyboard access
 * - Avatar alt text
 * - No color-only meaning
 */
export const AccessibilityReference: Story = {
	args: {
		profile: BASE_PROFILE,
		showMemberSince: true,
		onEdit: () => {},
	},
	parameters: {
		docs: {
			description: {
				story: 'Reference state for accessibility validation.',
			},
		},
	},
};
