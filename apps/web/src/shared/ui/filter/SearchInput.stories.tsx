import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import SearchInput from './SearchInput';

const meta: Meta<typeof SearchInput> = {
	title: 'UI/Filters/SearchInput',
	component: SearchInput,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
SearchInput is a debounced free-text filtering control.

It is designed for list filtering and search-driven views where user input
updates results progressively rather than submitting a form.

### When to use
- Filtering tables or lists
- Search-based dashboards
- Client-side or server-side query updates

### When not to use
- Full search pages with submit buttons
- Immediate validation-heavy forms
- Complex multi-field filtering UIs

### Interaction Model
- Typing updates local state immediately
- Parent is notified after debounce delay
- Clear button appears when text exists
- Escape key clears input
- Loading state replaces clear action

### Constraints
- Emits undefined when empty
- Trimmed values only
- Single-line input only

### Accessibility
- Always requires visible label
- Clear button has aria-label
- Keyboard accessible (Escape clears)
- Error and description text are readable
- Focus styles are preserved

### Design-System Notes
- Uses token-driven colors
- Adapts to dark mode
- Icons are decorative except clear button
- Supports density and layout flexibility
        `,
			},
		},
	},
	argTypes: {
		label: {
			description: 'Visible label describing the search purpose.',
			control: 'text',
			table: {
				type: { summary: 'string' },
			},
		},
		placeholder: {
			description: 'Placeholder hint shown when input is empty.',
			control: 'text',
			table: {
				type: { summary: 'string' },
				defaultValue: { summary: 'Search…' },
			},
		},
		description: {
			description: 'Helper text shown below the input.',
			control: 'text',
			table: {
				type: { summary: 'string' },
			},
		},
		error: {
			description: 'Validation or contextual error message.',
			control: 'text',
			table: {
				type: { summary: 'string' },
			},
		},
		debounceMs: {
			description: 'Delay before notifying parent of changes.',
			control: 'number',
			table: {
				type: { summary: 'number' },
				defaultValue: { summary: '400' },
			},
		},
		isLoading: {
			description: 'Replaces clear button with loading indicator.',
			control: 'boolean',
			table: {
				type: { summary: 'boolean' },
			},
		},
		autoFocus: {
			description: 'Focuses the input when mounted.',
			control: 'boolean',
			table: {
				type: { summary: 'boolean' },
			},
		},

		// ❌ DO NOT expose controlled value
		value: { control: false },
		onChange: { table: { disable: true } },
	},
};

export default meta;

type Story = StoryObj<typeof SearchInput>;

/**
 * Default idle state.
 *
 * The user sees an empty search input with no active query.
 * No loading or error state is present.
 */
export const Default: Story = {
	args: {
		label: 'Search users',
		placeholder: 'Search by name or email…',
	},
	render: (args) => {
		const [value, setValue] = useState<string | undefined>(undefined);

		return <SearchInput {...args} value={value} onChange={setValue} />;
	},
	parameters: {
		docs: {
			description: {
				story: 'Initial idle state with no active query. Clear button is hidden.',
			},
		},
	},
};

/**
 * Represents an active search query.
 *
 * Clear button becomes visible.
 */
export const WithValue: Story = {
	args: {
		label: 'Search users',
		value: 'Mohamed',
	},
	render: (args) => {
		const [value, setValue] = useState<string | undefined>(args.value);

		return <SearchInput {...args} value={value} onChange={setValue} />;
	},
	parameters: {
		docs: {
			description: {
				story: 'Displays clear action when a query is active.',
			},
		},
	},
};

/**
 * Occurs while results are being fetched.
 *
 * Clear button is replaced with loading spinner.
 */
export const Loading: Story = {
	args: {
		label: 'Search users',
		value: 'John',
		isLoading: true,
	},
	render: (args) => {
		const [value, setValue] = useState<string | undefined>(args.value);

		return <SearchInput {...args} value={value} onChange={setValue} />;
	},
	parameters: {
		docs: {
			description: {
				story: 'Shows loading indicator to communicate background query activity.',
			},
		},
	},
};

/**
 * Provides contextual guidance for the search.
 */
export const WithDescription: Story = {
	args: {
		label: 'Search users',
		description: 'Search by full name, email, or role.',
	},
	render: (args) => {
		const [value, setValue] = useState<string | undefined>();

		return <SearchInput {...args} value={value} onChange={setValue} />;
	},
};

/**
 * Represents invalid or restricted input.
 *
 * Error messaging overrides helper text.
 */
export const ErrorState: Story = {
	args: {
		label: 'Search users',
		value: '!!!',
		error: 'Search query contains unsupported characters.',
	},
	render: (args) => {
		const [value, setValue] = useState<string | undefined>(args.value);

		return <SearchInput {...args} value={value} onChange={setValue} />;
	},
};

/**
 * Verifies token-based theming and contrast in dark mode.
 */
export const DarkMode: Story = {
	args: {
		label: 'Search users',
	},
	render: (args) => {
		const [value, setValue] = useState<string | undefined>();

		return (
			<div className="bg-background p-6">
				<SearchInput {...args} value={value} onChange={setValue} />
			</div>
		);
	},
	parameters: {
		themes: {
			default: 'dark',
		},
		docs: {
			description: {
				story: 'Ensures proper token contrast and icon visibility in dark mode.',
			},
		},
	},
};

/**
 * Represents the component inside a constrained sidebar layout.
 *
 * Validates icon spacing, clear button positioning,
 * and text wrapping under narrow width conditions.
 */
export const NarrowContainer: Story = {
	args: {
		label: 'Search users',
		value: 'Alexandria Logistics Department',
		description: 'Search by name or department.',
	},
	render: (args) => {
		const [value, setValue] = useState<string | undefined>(args.value);

		return (
			<div className="w-[280px] border p-4">
				<SearchInput {...args} value={value} onChange={setValue} />
			</div>
		);
	},
	parameters: {
		docs: {
			description: {
				story: 'Ensures proper spacing and interaction behavior inside narrow containers such as filter sidebars or mobile layouts.',
			},
		},
	},
};
