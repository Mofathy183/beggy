import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
	Backpack01Icon,
	Briefcase01Icon,
	ShoppingBag01Icon,
} from '@hugeicons/core-free-icons';
import { useState } from 'react';
import Chips, { type ChipsProps } from './Chips';
import { BagType } from '@beggy/shared/constants';

/**
 * Example filter options used across stories.
 * These simulate real-world product filtering scenarios.
 */
const options = [
	{ label: 'Backpack', value: BagType.BACKPACK },
	{ label: 'Duffel Bag', value: BagType.DUFFEL },
	{ label: 'Tote Bag', value: BagType.TOTE, disabled: true },
	{ label: 'Messenger Bag', value: BagType.MESSENGER },
	{ label: 'Laptop Bag', value: BagType.LAPTOP_BAG },
	{ label: 'Travel Bag', value: BagType.TRAVEL_BAG },
	{ label: 'Handbag', value: BagType.HANDBAG },
	{ label: 'Crossbody Bag', value: BagType.CROSSBODY },
	{ label: 'Shoulder Bag', value: BagType.SHOULDER_BAG },
];

const meta: Meta<typeof Chips> = {
	title: 'UI/Chips',
	component: Chips,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
**Chips** provide compact, selectable options for filtering, tagging, or category selection.

---

### What it is
A grouped selection control rendered as compact buttons.

### When to use
- Product filters
- Tag selection
- Multi-category classification
- Lightweight alternative to checkbox groups

### When not to use
- Large datasets (use searchable select)
- Hierarchical selection
- Complex multi-step logic

---

### Interaction Model
- Multiple mode: behaves like checkboxes
- Single mode: behaves like radio buttons
- Clicking toggles selection
- Selection limits visually disable blocked options

---

### Constraints
- Optional max/min selection limits
- Disabled options respected
- Entire group can be disabled
- Shows helper hint when limits apply

---

### Accessibility
- Uses radiogroup in single mode
- Uses group in multiple mode
- aria-required and aria-invalid supported
- Keyboard navigable
- Visible focus ring
- Disabled semantics preserved

---

### Design System Notes
- Token-driven color system
- Variant-based selected styling
- Dark mode supported
- Chromatic-stable states only
`,
			},
		},
	},
	argTypes: {
		mode: {
			control: 'radio',
			options: ['multiple', 'single'],
			description: 'Selection behavior pattern.',
			table: { type: { summary: '"multiple" | "single"' } },
		},
		variant: {
			control: 'radio',
			options: ['default', 'primary', 'accent', 'destructive'],
			description: 'Visual emphasis for selected chips.',
			table: { type: { summary: 'ChipVariant' } },
		},
		disabled: {
			control: 'boolean',
			description: 'Disables all interaction.',
			table: { type: { summary: 'boolean' } },
		},
		maxSelected: {
			control: { type: 'number', min: 1 },
			description: 'Maximum allowed selections (multiple mode only).',
			table: { type: { summary: 'number' } },
		},
		minSelected: {
			control: { type: 'number', min: 0 },
			description: 'Minimum required selections (multiple mode only).',
			table: { type: { summary: 'number' } },
		},
	},
};

export default meta;

type ChipsBagTypeProps = ChipsProps<BagType>;

type MultipleArgs = Extract<ChipsBagTypeProps, { mode?: 'multiple' }>;

type SingleArgs = Extract<ChipsBagTypeProps, { mode: 'single' }>;

type MultipleStory = StoryObj<MultipleArgs>;
type SingleStory = StoryObj<SingleArgs>;
/**
 * Default filter state.
 *
 * No selections yet.
 * Users may select zero or more bag types.
 */
export const Default: MultipleStory = {
	args: {
		options,
		mode: 'multiple',
		value: [],
		label: 'Bag Types',
		description: 'Select one or more bag types.',
	},
	render: (args) => {
		const [value, setValue] = useState<BagType[]>(args.value);

		return <Chips {...args} value={value} onChange={setValue} />;
	},
};

/**
 * Applied filters state.
 *
 * Demonstrates a realistic scenario where
 * some filters are already active.
 */
export const WithSelection: MultipleStory = {
	args: {
		options,
		mode: 'multiple',
		value: [BagType.BACKPACK, BagType.DUFFEL],
		maxSelected: 5,
		variant: 'primary',
	},
	render: (args) => {
		const [value, setValue] = useState<BagType[]>(args.value);

		return <Chips {...args} value={value} onChange={setValue} />;
	},
};

/**
 * Maximum selection reached.
 *
 * Remaining unselected chips become disabled.
 * Selected chips remain interactive.
 */
export const MaxReached: MultipleStory = {
	args: {
		options,
		mode: 'multiple',
		maxSelected: 3,
		value: [BagType.BACKPACK, BagType.DUFFEL, BagType.MESSENGER],
	},
	render: (args) => {
		const [value, setValue] = useState<BagType[]>(args.value);

		return <Chips {...args} value={value} onChange={setValue} />;
	},
};

/**
 * Minimum constraint enforced.
 *
 * Selected chips cannot be deselected
 * once the minimum threshold is reached.
 */
export const MinReached: MultipleStory = {
	args: {
		options,
		mode: 'multiple',
		minSelected: 2,
		value: [BagType.BACKPACK, BagType.DUFFEL],
	},
	render: (args) => {
		const [value, setValue] = useState<BagType[]>(args.value);

		return <Chips {...args} value={value} onChange={setValue} />;
	},
};

/**
 * Validation error state.
 *
 * Communicates unmet requirement visually
 * and via aria-invalid.
 */
export const ErrorState: MultipleStory = {
	args: {
		options,
		mode: 'multiple',
		value: [],
		error: 'Please select at least one bag type.',
		required: true,
		label: 'Bag Types',
	},
	render: (args) => {
		const [value, setValue] = useState<BagType[]>(args.value);

		return <Chips {...args} value={value} onChange={setValue} />;
	},
};

/**
 * Single-selection mode.
 *
 * Only one chip may be active at a time.
 * Behaves like a radio group.
 */
export const SingleSelection: SingleStory = {
	args: {
		options,
		mode: 'single',
		value: BagType.BACKPACK,
		label: 'Primary Bag Type',
	},
	render: (args) => {
		const [value, setValue] = useState<BagType | null>(args.value);

		return <Chips {...args} value={value} onChange={setValue} />;
	},
};

/**
 * Chips with icons.
 *
 * Demonstrates alignment, spacing, and truncation
 * when leading icons are present.
 *
 * Ensures:
 * - Proper gap spacing
 * - Icon does not shrink unexpectedly
 * - Label truncation remains intact
 * - Selected styling applies consistently
 */
export const WithIcons: MultipleStory = {
	args: {
		options: [
			{
				label: 'Backpack',
				value: BagType.BACKPACK,
				icon: Backpack01Icon,
			},
			{
				label: 'Duffel Bag',
				value: BagType.DUFFEL,
				icon: Briefcase01Icon,
			},
			{
				label: 'Travel Bag',
				value: BagType.TRAVEL_BAG,
				icon: ShoppingBag01Icon,
			},
		],
		mode: 'multiple',
		value: [BagType.BACKPACK],
		variant: 'primary',
	},
	render: (args) => {
		const [value, setValue] = useState<BagType[]>(args.value);

		return <Chips {...args} value={value} onChange={setValue} />;
	},
};

/**
 * Entire group disabled.
 *
 * Used in read-only or loading states.
 */
export const Disabled: MultipleStory = {
	args: {
		options,
		mode: 'multiple',
		value: [BagType.BACKPACK],
		disabled: true,
	},
	render: (args) => (
		<Chips {...args} value={args.value} onChange={() => {}} disabled />
	),
};

/**
 * No chip selected.
 *
 * Demonstrates the empty/default state
 * before any user interaction.
 */
export const Empty: MultipleStory = {
	args: {
		options,
		mode: 'multiple',
		value: [],
	},
	render: (args) => {
		const [value, setValue] = useState<BagType[]>([]);

		return <Chips {...args} value={value} onChange={setValue} />;
	},
};

/**
 * Layout constraint verification.
 *
 * Ensures wrapping and spacing
 * remain stable in narrow containers.
 */
export const NarrowContainer: MultipleStory = {
	args: {
		options,
		mode: 'multiple',
		maxSelected: 4,
		value: [BagType.BACKPACK, BagType.DUFFEL],
	},
	render: (args) => {
		const [value, setValue] = useState<BagType[]>(args.value);

		return (
			<div className="w-[260px] border p-4">
				<Chips {...args} value={value} onChange={setValue} />
			</div>
		);
	},
};

/**
 * Dark theme verification.
 *
 * Confirms token-based contrast and
 * selected styling remain accessible.
 */
export const DarkMode: MultipleStory = {
	args: {
		options,
		mode: 'multiple',
		variant: 'accent',
		value: [BagType.BACKPACK],
	},
	render: (args) => {
		const [value, setValue] = useState<BagType[]>(args.value);

		return <Chips {...args} value={value} onChange={setValue} />;
	},
	parameters: {
		themes: { default: 'dark' },
	},
};
