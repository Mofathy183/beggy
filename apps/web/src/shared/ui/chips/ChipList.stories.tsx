import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { BAG_FEATURE_OPTIONS } from '@shared-ui/mappers';
import ChipList from './ChipList';

const FEATURE_OPTIONS = BAG_FEATURE_OPTIONS;

const meta: Meta<typeof ChipList> = {
	title: 'UI/Chips/ChipList',
	component: ChipList,
	tags: ['autodocs'],

	parameters: {
		docs: {
			description: {
				component: `
A read-only collection of chips representing selected enum-based values.

### What it is
ChipList renders a compact, non-interactive set of selected features using Chip primitives. It translates raw enum values into user-friendly labels via a provided options map.

### When to use it
- Displaying selected features on cards (bags, suitcases, items)
- Summarizing attributes in compact layouts
- Showing metadata tags in read-only contexts

### When not to use it
- Editable or selectable chip groups (use interactive ChipGroup instead)
- Filtering or input controls
- Situations requiring user interaction

### Interaction model
- Fully non-interactive
- Chips are visually static
- No hover, click, or keyboard actions
- Overflow is summarized via "+N" chip

### Constraints
- Renders nothing when values are empty or null
- Unknown values are silently ignored
- maxVisible limits layout expansion
- Overflow chip summarizes hidden values

### Accessibility guarantees
- Uses semantic list roles (list / listitem)
- Each chip has an aria-label
- Overflow chip exposes hidden labels via aria-label
- No focusable elements (read-only by design)

### Design-system notes
- Uses Chip primitive variants (CVA-driven)
- Token-based spacing and colors
- Supports density via wrapping
- Designed for responsive containers
        `,
			},
		},
	},

	argTypes: {
		options: {
			description: 'Mapping of enum values to display labels and icons.',
			table: { type: { summary: 'UiEnumOptions[]' } },
			control: false,
		},

		maxVisible: {
			control: 'number',
			description: 'Maximum number of visible chips before overflow.',
			table: {
				type: { summary: 'number | Infinity' },
				defaultValue: { summary: '3' },
			},
		},

		display: {
			control: 'radio',
			options: ['short', 'full'],
			description: 'Controls label verbosity.',
			table: {
				type: { summary: `'short' | 'full'` },
				defaultValue: { summary: 'short' },
			},
		},

		variant: {
			control: 'select',
			options: ['default', 'primary', 'accent', 'destructive'],
			description: 'Visual variant applied to all chips.',
			table: {
				type: { summary: 'ChipVariant' },
				defaultValue: { summary: 'default' },
			},
		},

		groupLabel: {
			control: 'text',
			description: 'Accessible label for the chip group.',
			table: {
				type: { summary: 'string' },
				defaultValue: { summary: 'Features' },
			},
		},

		values: { table: { disable: true } },
		className: { table: { disable: true } },
	},
};

export default meta;

type Story = StoryObj<typeof ChipList>;

/**
 * Default feature display.
 *
 * Shows a typical compact feature set inside a card.
 * Overflow is handled automatically.
 */
export const Default: Story = {
	args: {
		options: FEATURE_OPTIONS,
		maxVisible: 3,
		display: 'short',
		variant: 'default',
		groupLabel: 'Bag features',
	},
	render: (args) => {
		const values = ['lightweight', 'waterproof', 'expandable', 'usb_port'];
		return <ChipList {...args} values={values} />;
	},
	parameters: {
		docs: {
			description: {
				story: 'Displays a standard feature list with overflow handling. Only the first 3 chips are visible, remaining items are summarized.',
			},
		},
	},
};

/**
 * All features visible.
 *
 * Used in detailed views where space is not constrained.
 */
export const AllVisible: Story = {
	args: {
		options: FEATURE_OPTIONS,
		maxVisible: Infinity,
		display: 'full',
		variant: 'primary',
		groupLabel: 'Suitcase features',
	},
	render: (args) => {
		const values = [
			'lightweight',
			'waterproof',
			'expandable',
			'secure_lock',
			'usb_port',
		];
		return <ChipList {...args} values={values} />;
	},
	parameters: {
		docs: {
			description: {
				story: 'All chips are displayed with full labels. No overflow behavior is applied when maxVisible is Infinity.',
			},
		},
	},
};

/**
 * Overflow state.
 *
 * Demonstrates "+N" summarization behavior.
 */
export const WithOverflow: Story = {
	args: {
		options: FEATURE_OPTIONS,
		maxVisible: 2,
		display: 'short',
	},
	render: (args) => {
		const values = [
			'lightweight',
			'waterproof',
			'expandable',
			'secure_lock',
		];
		return <ChipList {...args} values={values} />;
	},
	parameters: {
		docs: {
			description: {
				story: 'Only two chips are visible. Remaining values are collapsed into a "+N" chip with accessible labeling.',
			},
		},
	},
};

/**
 * Destructive variant.
 *
 * Used for status or warning-related tags.
 */
export const DestructiveVariant: Story = {
	args: {
		options: FEATURE_OPTIONS,
		variant: 'destructive',
		maxVisible: Infinity,
		groupLabel: 'Status reasons',
	},
	render: (args) => {
		const values = ['secure_lock', 'usb_port'];
		return <ChipList {...args} values={values} />;
	},
	parameters: {
		docs: {
			description: {
				story: 'Applies destructive styling to communicate warnings or negative states while remaining non-interactive.',
			},
		},
	},
};

/**
 * Empty state.
 *
 * Component does not render anything.
 */
export const Empty: Story = {
	args: {
		options: FEATURE_OPTIONS,
	},
	render: (args) => {
		return <ChipList {...args} values={[]} />;
	},
	parameters: {
		docs: {
			description: {
				story: 'When no values are provided, the component renders nothing. This prevents unnecessary UI noise.',
			},
		},
	},
};

/**
 * Narrow container.
 *
 * Tests wrapping and layout resilience.
 */
export const NarrowContainer: Story = {
	args: {
		options: FEATURE_OPTIONS,
		maxVisible: Infinity,
	},
	render: (args) => {
		const values = [
			'lightweight',
			'waterproof',
			'expandable',
			'secure_lock',
			'usb_port',
		];

		return (
			<div className="w-[180px] border p-2">
				<ChipList {...args} values={values} />
			</div>
		);
	},
	parameters: {
		docs: {
			description: {
				story: 'Validates wrapping behavior in constrained layouts. Chips should wrap cleanly without overflow or clipping.',
			},
		},
	},
};

/**
 * Dark mode validation.
 *
 * Ensures token contrast and readability.
 */
export const DarkMode: Story = {
	args: {
		options: FEATURE_OPTIONS,
		variant: 'accent',
	},
	render: (args) => {
		const values = ['lightweight', 'waterproof', 'expandable'];
		return <ChipList {...args} values={values} />;
	},
	globals: {
		theme: 'dark',
	},
	parameters: {
		docs: {
			description: {
				story: 'Verifies visual contrast, readability, and token correctness in dark mode.',
			},
		},
	},
};
