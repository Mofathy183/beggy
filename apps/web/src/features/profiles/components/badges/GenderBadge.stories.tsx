import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import GenderBadge from './GenderBadge';
import { Gender } from '@beggy/shared/constants';

const meta = {
	title: 'Features/Profiles/Badges/GenderBadge',
	component: GenderBadge,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
**GenderBadge** is a semantic identity indicator built on top of the shadcn Badge primitive.

It maps a domain-level \`Gender\` enum to design tokens, ensuring that:
- No raw color values are used
- Visual meaning remains token-driven
- The badge disappears when gender is undefined

---

### When to use

- Profile headers
- User cards
- Compact list items
- Identity metadata rows

---

### When not to use

- As a selectable input
- As a filter control
- As a replacement for full demographic forms

---

### Interaction Model

- Non-interactive display element
- No click behavior
- No hover dependency for meaning
- Accessible via aria-label

---

### Constraints

- Renders nothing if gender is null or unknown
- Designed to remain visually subtle (informational, not status-critical)
- Color mapping is semantic — not gender-stereotyped

---

### Accessibility Guarantees

- Uses \`role="img"\`
- Provides descriptive \`aria-label\`
- Meaning does not rely on color alone (icon + text)
- Keyboard focus not required (non-interactive)

---

### Design-System Notes

- Built using CVA
- Token-driven (primary / accent / muted)
- Supports size variants
- Fully compatible with dark mode tokens
`,
			},
		},
	},
	argTypes: {
		gender: {
			description:
				'Gender identity to display. If undefined, the component renders nothing.',
			control: { type: 'select' },
			options: [Gender.MALE, Gender.FEMALE, Gender.OTHER],
			table: {
				type: { summary: 'Gender enum' },
				defaultValue: { summary: 'OTHER' },
			},
		},
		size: {
			description: 'Controls badge density and text scale.',
			control: { type: 'radio' },
			options: ['sm', 'md', 'lg'],
			table: {
				type: { summary: '"sm" | "md" | "lg"' },
				defaultValue: { summary: 'md' },
			},
		},
		iconOnly: {
			description:
				'Removes the text label and renders icon only. Used in compact layouts.',
			control: { type: 'boolean' },
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},
		className: {
			table: { disable: true },
		},
	},
} satisfies Meta<typeof GenderBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default male identity badge.
 *
 * Occurs in profile headers where gender is defined.
 * The user sees a subtle token-based primary tint with icon + label.
 */
export const Male: Story = {
	args: {
		gender: Gender.MALE,
	},
	parameters: {
		docs: {
			description: {
				story: 'Displays male identity using primary token mapping.',
			},
		},
	},
};

/**
 * Female identity badge.
 *
 * Appears in profile contexts when gender is FEMALE.
 * Uses accent token mapping while remaining brand-aligned.
 */
export const Female: Story = {
	args: {
		gender: Gender.FEMALE,
	},
	parameters: {
		docs: {
			description: {
				story: 'Displays female identity using accent token mapping.',
			},
		},
	},
};

/**
 * Neutral gender state.
 *
 * Used when user selects OTHER.
 * Intentionally styled with muted tokens to remain neutral and respectful.
 */
export const Other: Story = {
	args: {
		gender: Gender.OTHER,
	},
	parameters: {
		docs: {
			description: {
				story: 'Displays neutral identity state using muted semantic tokens.',
			},
		},
	},
};

/**
 * Size variants demonstrate density scaling.
 *
 * Used in:
 * - Compact cards (sm)
 * - Standard layouts (md)
 * - Profile hero sections (lg)
 */
export const Sizes = {
	render: () => (
		<div className="flex items-center gap-4">
			<GenderBadge gender={Gender.MALE} size="sm" />
			<GenderBadge gender={Gender.MALE} size="md" />
			<GenderBadge gender={Gender.MALE} size="lg" />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Demonstrates density scaling across layout contexts.',
			},
		},
	},
} satisfies StoryObj<typeof GenderBadge>;

/**
 * Compact icon-only usage.
 *
 * Used in:
 * - Sidebar profile summaries
 * - Table rows
 * - Avatar overlays
 *
 * Text is visually removed but aria-label preserves meaning.
 */
export const IconOnly: Story = {
	args: {
		gender: Gender.FEMALE,
		iconOnly: true,
		size: 'sm',
	},
	parameters: {
		docs: {
			description: {
				story: 'Compact representation for dense UI areas while maintaining accessibility.',
			},
		},
	},
};

/**
 * Dark mode validation.
 *
 * Ensures:
 * - Token contrast remains accessible
 * - Borders remain visible
 * - Muted variant does not disappear
 */
export const DarkMode: Story = {
	args: {
		gender: Gender.OTHER,
	},
	parameters: {
		themes: {
			themeOverride: 'dark',
		},
		docs: {
			description: {
				story: 'Validates token contrast and semantic mapping in dark mode.',
			},
		},
	},
};

/**
 * Accessibility reference state.
 *
 * Used to verify:
 * - aria-label presence
 * - No color-only meaning
 * - Icon + text pairing
 */
export const AccessibilityReference: Story = {
	args: {
		gender: Gender.MALE,
	},
	parameters: {
		docs: {
			description: {
				story: 'Reference state for a11y validation using addon-a11y.',
			},
		},
	},
};
