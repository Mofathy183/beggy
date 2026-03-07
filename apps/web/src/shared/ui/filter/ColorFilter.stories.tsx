import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import ColorFilter from './ColorFilter';

const meta: Meta<typeof ColorFilter> = {
	title: 'UI/Filters/ColorFilter',
	component: ColorFilter,
	tags: ['autodocs'],

	parameters: {
		layout: 'centered',

		docs: {
			description: {
				component: `
## ColorFilter

A color-based filtering control used within item filter panels.

The component supports **two selection methods**:

• **Quick-pick swatches** for common colors  
• **Free-text input** for custom color names

The filter is **controlled**, meaning the parent component owns the state.

---

### Behavior

**Quick-pick swatches**

• Clicking a swatch immediately emits the value  
• Clicking an active swatch deselects it  
• No debounce is applied

**Free-text input**

• Typing emits a debounced update  
• Input values are normalized to lowercase  
• Empty values clear the filter

**Clear actions**

• Clear button resets the filter  
• Escape key clears the current input

---

### Usage context

Use this component inside:

• item filter sidebars  
• search refinement panels  
• packing inventory filters

---

### Accessibility

The component includes:

• accessible label association  
• ARIA group for quick-pick swatches  
• keyboard clear with Escape  
• proper error and description associations
`,
			},
		},
	},

	argTypes: {
		label: {
			control: 'text',
			description: 'Accessible label shown above the filter input.',
		},

		value: {
			control: false,
			description: 'Controlled color filter value.',
		},

		onChange: {
			action: 'changed',
			description: 'Emitted whenever the selected color changes.',
		},

		debounceMs: {
			control: { type: 'number', min: 0, step: 100 },
			description: 'Debounce delay for text input.',
		},

		description: {
			control: 'text',
			description: 'Helper text displayed below the input.',
		},

		error: {
			control: 'text',
			description: 'Validation error message.',
		},

		className: {
			table: { disable: true },
		},
	},
};

export default meta;

type Story = StoryObj<typeof ColorFilter>;

const ControlledTemplate = (args: any) => {
	const [value, setValue] = useState<string | undefined>(args.value);

	return (
		<ColorFilter
			{...args}
			value={value}
			onChange={(v) => {
				setValue(v);
				args.onChange?.(v);
			}}
		/>
	);
};

export const Default: Story = {
	render: ControlledTemplate,

	args: {
		label: 'Color',
		value: undefined,
		description: 'Filter items by their color.',
	},

	parameters: {
		docs: {
			description: {
				story: 'Default empty state of the color filter with no active value.',
			},
		},
	},
};

export const WithQuickPickSelected: Story = {
	render: ControlledTemplate,

	args: {
		value: 'blue',
		label: 'Color',
		description: 'Quick color selection via swatches.',
	},

	parameters: {
		docs: {
			description: {
				story: 'Demonstrates the UI when a quick-pick color swatch is selected.',
			},
		},
	},
};

export const WithCustomColor: Story = {
	render: ControlledTemplate,

	args: {
		value: 'olive',
		label: 'Color',
		description: 'Custom color entered manually.',
	},

	parameters: {
		docs: {
			description: {
				story: 'Displays the badge indicator used when filtering by a custom text color.',
			},
		},
	},
};

export const WithLongInput: Story = {
	render: ControlledTemplate,

	args: {
		value: 'dark olive green',
		label: 'Color',
		description: 'Tests layout with longer color descriptions.',
	},

	parameters: {
		docs: {
			description: {
				story: 'Stress test ensuring the filter UI remains stable with longer input values.',
			},
		},
	},
};

export const ErrorState: Story = {
	render: ControlledTemplate,

	args: {
		value: 'blue',
		label: 'Color',
		error: 'Invalid color format.',
	},

	parameters: {
		docs: {
			description: {
				story: 'Displays the validation error state used when filter input fails validation.',
			},
		},
	},
};

export const DarkMode: Story = {
	render: ControlledTemplate,

	args: {
		value: 'navy',
		label: 'Color',
		description: 'Dark mode theme validation.',
	},

	parameters: {
		themes: { default: 'dark' },

		docs: {
			description: {
				story: 'Validates swatch contrast, borders, and focus states in dark mode.',
			},
		},
	},
};
