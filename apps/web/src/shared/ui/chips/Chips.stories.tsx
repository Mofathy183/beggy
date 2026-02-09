import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import Chips from './Chips';
import { BagType } from '@beggy/shared/constants';

/**
 * Example bag type options used across stories.
 * In real usage, these often represent filters or category selectors.
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
**Chips** represent a set of compact, selectable options.

They are best suited for:
- Filtering lists or search results
- Tag-style selection
- Category pickers with quick feedback

### Selection modes
- **multiple**: behaves like checkboxes (0..n selected)
- **single**: behaves like radio buttons (0..1 selected)

### Selection limits
In **multiple** mode, selection can be constrained using \`maxSelected\`.

- Once the limit is reached, remaining unselected chips become disabled
- Selected chips can always be deselected
- A helper hint is shown when a limit is active

> Use \`mode="single"\` when the choice is mutually exclusive.  
> Use the default \`multiple\` mode when users may select more than one option.
`,
			},
		},
	},
	argTypes: {
		mode: {
			control: 'radio',
			options: ['multiple', 'single'],
			description:
				'Controls whether one or multiple chips can be selected.',
		},
		disabled: {
			control: 'boolean',
			description: 'Disables all chip interactions.',
		},
		maxSelected: {
			control: { type: 'number', min: 1 },
			description:
				'Maximum number of chips that can be selected in multiple mode. Defaults to 5.',
			table: {
				type: { summary: 'number' },
				defaultValue: { summary: '5' },
			},
		},
		value: {
			control: false,
			description:
				'Controlled selection value. Shape depends on the selected mode.',
		},
		onChange: {
			action: 'change',
			description: 'Called whenever the selection changes.',
		},
	},
};

export default meta;

type MultipleStory = StoryObj<{
	options: typeof options;
	mode?: 'multiple';
	value: BagType[];
	disabled?: boolean;
	maxSelected?: number;
}>;

type SingleStory = StoryObj<{
	options: typeof options;
	mode: 'single';
	value: BagType | null;
	disabled?: boolean;
}>;

/**
 * Default multiple-selection behavior.
 *
 * Allows users to select zero or more options.
 * Ideal for filters, tags, or category selection.
 */
export const Default: MultipleStory = {
	args: {
		options,
		mode: 'multiple',
		value: [],
	},
	render: (args) => {
		const [value, setValue] = useState<BagType[]>(args.value);

		return <Chips {...args} value={value} onChange={setValue} />;
	},
};

/**
 * Multiple chips pre-selected.
 *
 * Demonstrates a common "applied filters" state
 * where some options are already active.
 */
export const WithSelection: MultipleStory = {
	args: {
		options,
		mode: 'multiple',
		maxSelected: 5,
		value: [BagType.BACKPACK, BagType.DUFFEL],
	},
	render: (args) => {
		const [value, setValue] = useState<BagType[]>(args.value);

		return <Chips {...args} value={value} onChange={setValue} />;
	},
};

/**
 * Multiple selection with maximum reached.
 *
 * Demonstrates behavior when the selection
 * limit is reached and remaining options are disabled.
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
 * Single-selection (radio-like) behavior.
 *
 * Only one chip can be selected at a time.
 * Selecting an active chip will deselect it.
 *
 * Use this when the options are mutually exclusive.
 */
export const SingleSelection: SingleStory = {
	args: {
		options,
		mode: 'single',
		value: BagType.BACKPACK,
	},
	render: (args) => {
		const [value, setValue] = useState<BagType | null>(args.value);

		return <Chips {...args} value={value} onChange={setValue} />;
	},
};

/**
 * Entire group disabled.
 *
 * Used when selection is read-only, loading,
 * or controlled by external conditions.
 */
export const Disabled: MultipleStory = {
	args: {
		options,
		mode: 'multiple',
		value: [BagType.BACKPACK],
		disabled: true,
	},
	render: (args) => (
		<Chips
			options={args.options}
			mode="multiple"
			value={args.value}
			onChange={() => {}}
			disabled
		/>
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
