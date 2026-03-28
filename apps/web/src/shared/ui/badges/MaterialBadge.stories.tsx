import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Material } from '@beggy/shared/constants';
import MaterialBadge from './MaterialBadge';

const MATERIAL_VALUES = Object.values(Material);

const meta: Meta<typeof MaterialBadge> = {
	title: 'UI/Badges/MaterialBadge',
	component: MaterialBadge,
	tags: ['autodocs'],

	parameters: {
		docs: {
			description: {
				component: `
A compact, read-only badge representing material metadata using icon + label.

### What it is
MaterialBadge displays a material value with an optional icon, using a muted visual style to indicate secondary importance in the UI hierarchy.

### When to use it
- Displaying material in product cards
- Metadata rows alongside size/type
- Compact summaries with icon support

### When not to use it
- Interactive filtering or selection
- Primary status indicators
- Critical or high-priority information

### Interaction model
- Fully non-interactive
- No hover/click/focus behavior beyond visual feedback
- Icon + label or icon-only display modes

### Constraints
- Renders nothing when value is null or undefined
- Unknown enum values are silently ignored
- iconOnly removes text but keeps accessibility label
- Icon presence depends on mapper configuration

### Accessibility guarantees
- Uses role="img" with descriptive aria-label
- Always exposes full label even in iconOnly mode
- No focusable elements (non-interactive)
- Icon is decorative (aria handled at container level)

### Design-system notes
- Muted tokens ensure low visual priority
- CVA controls size and spacing
- Icon scales with size variant
- Designed to align with SizeBadge and TypeBadge
        `,
			},
		},
	},

	argTypes: {
		value: {
			control: 'select',
			options: MATERIAL_VALUES,
			description: 'Material enum value to display.',
			table: {
				type: { summary: 'Material | null | undefined' },
			},
		},

		iconOnly: {
			control: 'boolean',
			description: 'When true, renders only the icon without text.',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},

		size: {
			control: 'select',
			options: ['sm', 'md', 'lg'],
			description: 'Controls badge size and icon scaling.',
			table: {
				type: { summary: `'sm' | 'md' | 'lg'` },
				defaultValue: { summary: 'md' },
			},
		},

		className: { table: { disable: true } },
	},
};

export default meta;

type Story = StoryObj<typeof MaterialBadge>;

/**
 * Default material badge.
 *
 * Displays icon and label in standard density.
 */
export const Default: Story = {
	args: {
		value: Material.LEATHER,
		size: 'md',
		iconOnly: false,
	},
	parameters: {
		docs: {
			description: {
				story: 'Displays both icon and label using muted styling. This is the standard usage in cards and summaries.',
			},
		},
	},
};

/**
 * Icon-only mode.
 *
 * Used in very compact UI contexts.
 */
export const IconOnly: Story = {
	args: {
		value: Material.POLYESTER,
		iconOnly: true,
		size: 'sm',
	},
	parameters: {
		docs: {
			description: {
				story: 'Renders only the icon while preserving accessibility via aria-label. Ideal for dense layouts.',
			},
		},
	},
};

/**
 * Large size variant.
 *
 * Improves readability and presence slightly.
 */
export const LargeSize: Story = {
	args: {
		value: Material.CANVAS,
		size: 'lg',
	},
	parameters: {
		docs: {
			description: {
				story: 'Uses a larger size for improved readability while maintaining its secondary visual role.',
			},
		},
	},
};

/**
 * All materials overview.
 *
 * Useful for visual regression and design validation.
 */
export const AllMaterials: Story = {
	render: () => (
		<div className="flex flex-wrap gap-2">
			{MATERIAL_VALUES.map((value) => (
				<MaterialBadge key={value} value={value} />
			))}
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Displays all material variants to validate icon consistency, spacing, and visual alignment.',
			},
		},
	},
};

/**
 * Empty state.
 *
 * Component renders nothing.
 */
export const Empty: Story = {
	args: {
		value: null,
	},
	parameters: {
		docs: {
			description: {
				story: 'When value is null or undefined, the component renders nothing. This avoids placeholder noise in the UI.',
			},
		},
	},
};

/**
 * Narrow container.
 *
 * Tests layout resilience.
 */
export const NarrowContainer: Story = {
	args: {
		value: Material.FABRIC,
	},
	render: (args) => (
		<div className="w-[100px] border p-2 flex justify-center">
			<MaterialBadge {...args} />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Ensures the badge remains visually stable and properly aligned in constrained layouts.',
			},
		},
	},
};

/**
 * Dark mode validation.
 *
 * Ensures proper contrast and icon visibility.
 */
export const DarkMode: Story = {
	args: {
		value: Material.NYLON,
	},
	globals: {
		theme: 'dark',
	},
	parameters: {
		docs: {
			description: {
				story: 'Validates muted tokens, icon visibility, and border contrast in dark mode.',
			},
		},
	},
};
