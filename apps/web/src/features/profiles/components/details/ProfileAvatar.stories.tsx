import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import ProfileAvatar from './ProfileAvatar';
import { ProfileDTO } from '@beggy/shared/types';

const MOCK_PROFILE: ProfileDTO = {
	id: '1',
	userId: '1',
	firstName: 'Mohamed',
	lastName: 'Fathy',
	displayName: 'Mohamed Fathy',
	avatarUrl: 'https://i.pravatar.cc/300?img=12',
	gender: null,
	birthDate: null,
	country: null,
	city: null,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
};

const MOCK_NO_IMAGE: ProfileDTO = {
	id: '1',
	userId: '1',
	firstName: 'Layla',
	lastName: 'Hassan',
	displayName: 'Layla Hassan',
	avatarUrl: null,
	gender: null,
	birthDate: null,
	country: null,
	city: null,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
};

const MOCK_DISPLAY_ONLY: ProfileDTO = {
	id: '1',
	userId: '1',
	firstName: '',
	lastName: '',
	displayName: 'Sound Scene',
	avatarUrl: null,
	gender: null,
	birthDate: null,
	country: null,
	city: null,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
};

const meta = {
	title: 'Features/Profiles/UI/ProfileAvatar',
	component: ProfileAvatar,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
**ProfileAvatar** visually represents a user identity using either:

- A profile image
- Derived initials fallback
- Optional presence indicator

It is built on accessible shadcn Avatar primitives and follows token-driven design rules.

---

### When to use

- User headers
- Navigation bars
- Comment threads
- Profile cards
- Messaging lists

---

### When not to use

- As a button (wrap in interactive component instead)
- As a status badge replacement
- For decorative-only imagery

---

### Interaction Model

- Non-interactive display element
- Image loading handled by Radix internally
- Fallback automatically appears when image is missing or broken

---

### Constraints

- Max two-letter initials
- Always circular
- Ring ensures clean cut edge across surfaces
- Online indicator is visual-only (not presence system logic)

---

### Accessibility Guarantees

- Image includes alt text
- Fallback text is readable
- Online indicator includes aria-label
- No color-only meaning

---

### Design-System Notes

- Size controlled via CVA
- Uses token-based ring and fallback colors
- Presence dot uses \`--success\` token
- Fully compatible with dark mode tokens
`,
			},
		},
	},
	argTypes: {
		size: {
			description:
				'Controls avatar dimensions and fallback text scaling.',
			control: { type: 'select' },
			options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
			table: {
				type: { summary: '"xs" | "sm" | "md" | "lg" | "xl" | "2xl"' },
				defaultValue: { summary: 'md' },
			},
		},
		showOnline: {
			description: 'Displays a success token presence indicator.',
			control: { type: 'boolean' },
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},
		profile: {
			table: { disable: true },
		},
		className: {
			table: { disable: true },
		},
		alt: {
			description: 'Overrides the computed alt text.',
			control: false,
			table: {
				type: { summary: 'string' },
			},
		},
	},
} satisfies Meta<typeof ProfileAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Standard avatar with profile image.
 *
 * Occurs when user has uploaded a profile picture.
 * Image is cropped and fills container.
 */
export const WithImage: Story = {
	args: {
		profile: MOCK_PROFILE,
	},
	parameters: {
		docs: {
			description: {
				story: 'Displays user image with automatic object-fit cropping.',
			},
		},
	},
};

/**
 * Fallback state when avatarUrl is missing.
 *
 * Initials are derived from displayName or name fields.
 * Uses primary token tint to remain visually soft.
 */
export const FallbackInitials: Story = {
	args: {
		profile: MOCK_NO_IMAGE,
	},
	parameters: {
		docs: {
			description: {
				story: 'Displays derived initials when no image is provided.',
			},
		},
	},
};

/**
 * Fallback derived from displayName only.
 *
 * Occurs for organizations or accounts without first/last names.
 */
export const DisplayNameFallback: Story = {
	args: {
		profile: MOCK_DISPLAY_ONLY,
	},
	parameters: {
		docs: {
			description: {
				story: 'Demonstrates initials derived from displayName.',
			},
		},
	},
};

/**
 * Avatar with presence indicator.
 *
 * Used in chat lists, messaging systems, and active user surfaces.
 * Indicator uses semantic success token.
 */
export const OnlineState: Story = {
	args: {
		profile: MOCK_PROFILE,
		showOnline: true,
	},
	parameters: {
		docs: {
			description: {
				story: 'Displays success-token presence indicator in bottom-right corner.',
			},
		},
	},
};

/**
 * Size scale matrix.
 *
 * Demonstrates density behavior across layouts:
 * - xs/sm → compact lists
 * - md → default cards
 * - lg/xl → profile headers
 * - 2xl → hero sections
 */
export const Sizes = {
	render: () => (
		<div className="flex items-end gap-6">
			<ProfileAvatar profile={MOCK_PROFILE} size="xs" />
			<ProfileAvatar profile={MOCK_PROFILE} size="sm" />
			<ProfileAvatar profile={MOCK_PROFILE} size="md" />
			<ProfileAvatar profile={MOCK_PROFILE} size="lg" />
			<ProfileAvatar profile={MOCK_PROFILE} size="xl" />
			<ProfileAvatar profile={MOCK_PROFILE} size="2xl" />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Visual density scaling across supported size variants.',
			},
		},
	},
} satisfies StoryObj<typeof ProfileAvatar>;

/**
 * Dark mode validation.
 *
 * Ensures:
 * - Ring contrast remains visible
 * - Fallback tint is legible
 * - Success indicator does not glow incorrectly
 */
export const DarkMode: Story = {
	args: {
		profile: MOCK_NO_IMAGE,
		showOnline: true,
	},
	parameters: {
		themes: {
			themeOverride: 'dark',
		},
		docs: {
			description: {
				story: 'Validates token contrast and fallback readability in dark mode.',
			},
		},
	},
};

/**
 * Accessibility reference state.
 *
 * Used with addon-a11y to verify:
 * - alt text presence
 * - fallback readability
 * - aria-label on presence indicator
 */
export const AccessibilityReference: Story = {
	args: {
		profile: MOCK_PROFILE,
		showOnline: true,
	},
	parameters: {
		docs: {
			description: {
				story: 'Reference state for accessibility validation.',
			},
		},
	},
};
