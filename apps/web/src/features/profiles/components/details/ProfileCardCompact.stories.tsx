import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import ProfileCardCompact, {
	ProfileCardCompactSkeleton,
} from './ProfileCardCompact';
import { Gender } from '@beggy/shared/constants';
import type { ProfileDTO } from '@beggy/shared/types';

// ─────────────────────────────────────────────────────────────
// Deterministic Mock Profiles (Chromatic-safe)
// ─────────────────────────────────────────────────────────────

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
	birthDate: null,
	age: undefined,
	createdAt: '2022-01-15T00:00:00.000Z',
	updatedAt: '2022-01-15T00:00:00.000Z',
};

const LONG_NAME_PROFILE: ProfileDTO = {
	...BASE_PROFILE,
	displayName: 'Maximilian Alexander von Habsburg-Lothringen the Third',
};

const NO_LOCATION_PROFILE: ProfileDTO = {
	...BASE_PROFILE,
	city: null,
	country: null,
};

const MINIMAL_PROFILE: ProfileDTO = {
	...BASE_PROFILE,
	displayName: undefined,
	city: null,
	country: null,
	gender: null,
};

// ─────────────────────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────────────────────

const meta = {
	title: 'Features/Profiles/UI/ProfileCardCompact',
	component: ProfileCardCompact,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
**ProfileCardCompact** is a dense, single-row identity summary component.

It presents:
- Avatar
- Display name
- Optional gender badge (icon-only)
- Location (or subtle placeholder)
- Optional directional affordance when interactive

---

### When to use

- Sidebar footer identity
- Dropdown trigger rows
- Compact navigation headers
- Dense account panels

---

### When not to use

- Full profile summaries
- Editable profile forms
- Multi-row profile layouts
- Public profile pages

---

### Interaction Model

- Static by default
- Becomes interactive when \`onClick\` is provided
- Interactive state uses ghost Button variant
- Tooltip clarifies navigation intent
- Arrow affordance appears only when clickable

---

### UX Rules Enforced

- Display name falls back to first + last
- GenderBadge renders only when enabled
- Location placeholder is subtle (not disruptive)
- Layout remains stable across states
- Truncation prevents layout breaking

---

### Accessibility Guarantees

- Button semantics when interactive
- Visible focus ring
- Tooltip keyboard accessible
- Decorative icons are aria-hidden
- No color-only meaning

---

### Design-System Notes

- Built with shadcn primitives
- Token-driven color usage
- Sidebar accent hover tokens supported
- Stable single-row density
- Fully dark-mode compatible
`,
			},
		},
	},
	argTypes: {
		profile: { table: { disable: true } },
		onClick: { table: { disable: true } },
		className: { table: { disable: true } },
		showGender: {
			description: 'Displays inline icon-only GenderBadge.',
			control: { type: 'boolean' },
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},
		withCard: {
			description: 'Wraps the row inside a Card container.',
			control: { type: 'boolean' },
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},
	},
} satisfies Meta<typeof ProfileCardCompact>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────────

/**
 * Default static row.
 *
 * Used in sidebar footers where parent controls layout.
 */
export const Default: Story = {
	args: {
		profile: BASE_PROFILE,
	},
	parameters: {
		docs: {
			description: {
				story: 'Static compact profile row without interaction.',
			},
		},
	},
};

/**
 * Interactive state.
 *
 * Entire row becomes ghost Button with arrow affordance.
 */
export const Clickable: Story = {
	args: {
		profile: BASE_PROFILE,
		onClick: () => {},
	},
	parameters: {
		docs: {
			description: {
				story: 'Interactive variant with ghost button and directional arrow.',
			},
		},
	},
};

/**
 * Gender badge visible.
 *
 * Icon-only inline badge for dense layout.
 */
export const WithGenderBadge: Story = {
	args: {
		profile: BASE_PROFILE,
		showGender: true,
	},
	parameters: {
		docs: {
			description: {
				story: 'Displays inline icon-only GenderBadge.',
			},
		},
	},
};

/**
 * Missing location state.
 *
 * Placeholder remains subtle to preserve density.
 */
export const NoLocation: Story = {
	args: {
		profile: NO_LOCATION_PROFILE,
	},
	parameters: {
		docs: {
			description: {
				story: 'Demonstrates subtle placeholder when location is absent.',
			},
		},
	},
};

/**
 * Minimal data.
 *
 * Gender omitted.
 * No location.
 * Display name fallback engaged.
 */
export const MinimalData: Story = {
	args: {
		profile: MINIMAL_PROFILE,
		showGender: true,
	},
	parameters: {
		docs: {
			description: {
				story: 'Validates silent omission behavior and layout stability.',
			},
		},
	},
};

/**
 * Long name truncation.
 *
 * Ensures layout stability under extreme content.
 */
export const LongName: Story = {
	args: {
		profile: LONG_NAME_PROFILE,
	},
	parameters: {
		docs: {
			description: {
				story: 'Validates truncation handling for long display names.',
			},
		},
	},
};

/**
 * Card-wrapped usage.
 *
 * Used in settings panels and dashboard summaries.
 */
export const WithCard: Story = {
	args: {
		profile: BASE_PROFILE,
		withCard: true,
		showGender: true,
	},
	parameters: {
		docs: {
			description: {
				story: 'Wrapped inside Card container for panel contexts.',
			},
		},
	},
};

/**
 * Loading placeholder.
 *
 * Layout matches final row for seamless transition.
 */
export const LoadingSkeleton = {
	render: () => <ProfileCardCompactSkeleton />,
	parameters: {
		docs: {
			description: {
				story: 'Skeleton state shown while compact profile data loads.',
			},
		},
	},
} satisfies StoryObj<typeof ProfileCardCompactSkeleton>;

/**
 * Dark mode validation.
 *
 * Ensures:
 * - Sidebar accent hover tokens visible
 * - Muted foreground readable
 * - Arrow contrast balanced
 * - Focus ring accessible
 */
export const DarkMode: Story = {
	args: {
		profile: BASE_PROFILE,
		onClick: () => {},
		showGender: true,
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
 * Accessibility reference.
 *
 * Validate with addon-a11y:
 * - Button semantics
 * - Focus ring
 * - Tooltip keyboard support
 * - Decorative icons aria-hidden
 */
export const AccessibilityReference: Story = {
	args: {
		profile: BASE_PROFILE,
		onClick: () => {},
		showGender: true,
		withCard: true,
	},
	parameters: {
		docs: {
			description: {
				story: 'Reference state for accessibility validation.',
			},
		},
	},
};
