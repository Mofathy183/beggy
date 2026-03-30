import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Size } from '@beggy/shared/constants';
import SizeBadge from './SizeBadge';

const SIZE_VALUES = Object.values(Size);

const meta: Meta<typeof SizeBadge> = {
	title: 'UI/Badges/SizeBadge',
	component: SizeBadge,
	tags: ['autodocs'],

	parameters: {
		docs: {
			description: {
				component: `
A compact, read-only badge used to represent size metadata in a quiet, non-dominant visual style.

### What it is
SizeBadge displays a single size value (e.g. "S", "M", "L") using a muted badge style. It is designed to communicate supplementary information without competing with primary UI elements.

### When to use it
- Card headers showing item size
- Compact metadata rows
- Secondary attribute displays

### When not to use it
- Interactive filters or selectors
- Primary labels or status indicators
- Situations requiring emphasis (use stronger variants instead)

### Interaction model
- Fully non-interactive
- No click or keyboard behavior
- Purely informational

### Constraints
- Renders nothing if value is null or undefined
- Unknown enum values are silently ignored
- Short display is default for space efficiency
- No icons (size is universally understood)

### Accessibility guarantees
- Uses role="img" with descriptive aria-label
- Always exposes full label for assistive technologies
- No focusable elements (non-interactive)

### Design-system notes
- Uses muted tokens for low visual priority
- CVA-driven sizing (sm, md, lg)
- Designed to align with other metadata badges
- Token-based styling ensures theme compatibility
        `,
			},
		},
	},

	argTypes: {
		value: {
			control: 'select',
			options: SIZE_VALUES,
			description: 'Size enum value to display.',
			table: {
				type: { summary: 'Size | null | undefined' },
			},
		},

		display: {
			control: 'radio',
			options: ['short', 'full'],
			description: 'Controls whether short or full label is rendered.',
			table: {
				type: { summary: `'short' | 'full'` },
				defaultValue: { summary: 'short' },
			},
		},

		size: {
			control: 'select',
			options: ['sm', 'md', 'lg'],
			description: 'Controls visual density of the badge.',
			table: {
				type: { summary: `'sm' | 'md' | 'lg'` },
				defaultValue: { summary: 'md' },
			},
		},

		className: { table: { disable: true } },
	},
};

export default meta;

type Story = StoryObj<typeof SizeBadge>;

/**
 * Default compact size badge.
 *
 * Used in card headers where space is limited.
 */
export const Default: Story = {
	args: {
		value: Size.MEDIUM,
		display: 'short',
		size: 'md',
	},
	parameters: {
		docs: {
			description: {
				story: 'Displays the short size label ("M") using muted styling. This is the most common usage in compact layouts.',
			},
		},
	},
};

/**
 * Full label display.
 *
 * Used in detailed contexts where clarity is preferred over compactness.
 */
export const FullLabel: Story = {
	args: {
		value: Size.LARGE,
		display: 'full',
	},
	parameters: {
		docs: {
			description: {
				story: 'Renders the full label ("Large") instead of the short form. Useful in detail pages or expanded views.',
			},
		},
	},
};

/**
 * Small density variant.
 *
 * Used in tight UI areas or dense metadata rows.
 */
export const SmallSize: Story = {
	args: {
		value: Size.SMALL,
		size: 'sm',
	},
	parameters: {
		docs: {
			description: {
				story: 'Uses the smallest badge size for dense layouts. Maintains readability while minimizing visual footprint.',
			},
		},
	},
};

/**
 * Large density variant.
 *
 * Used when the badge needs slightly more emphasis.
 */
export const LargeSize: Story = {
	args: {
		value: Size.EXTRA_LARGE,
		size: 'lg',
	},
	parameters: {
		docs: {
			description: {
				story: 'Larger badge size improves readability and presence without changing its informational role.',
			},
		},
	},
};

/**
 * Empty state.
 *
 * Component renders nothing when value is missing.
 */
export const Empty: Story = {
	args: {
		value: null,
	},
	parameters: {
		docs: {
			description: {
				story: 'When no value is provided, the component renders nothing. This prevents unnecessary placeholders in the UI.',
			},
		},
	},
};

/**
 * Narrow container.
 *
 * Validates layout behavior in constrained spaces.
 */
export const NarrowContainer: Story = {
	args: {
		value: Size.MEDIUM,
	},
	render: (args) => (
		<div className="w-[80px] border p-2 flex justify-center">
			<SizeBadge {...args} />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Ensures the badge remains visually stable and centered in narrow layouts without overflow.',
			},
		},
	},
};

/**
 * Dark mode validation.
 *
 * Ensures muted tokens maintain contrast and readability.
 */
export const DarkMode: Story = {
	args: {
		value: Size.LARGE,
	},
	globals: {
		theme: 'dark',
	},
	parameters: {
		docs: {
			description: {
				story: 'Validates contrast, border visibility, and readability of muted badge tokens in dark mode.',
			},
		},
	},
};
