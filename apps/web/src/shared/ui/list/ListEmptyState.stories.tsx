import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import ListEmptyState from './ListEmptyState';

/**
 * ListEmptyState
 *
 * A semantic empty state component used to communicate that
 * a list query returned zero visible results.
 */
const meta: Meta<typeof ListEmptyState> = {
	title: 'UI/List/ListEmptyState',
	component: ListEmptyState,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
A structured empty state for list-based interfaces.

---

## What it is

A centered feedback component that communicates:
- No results found
- Filters exclude all items
- No data exists yet
- Access restrictions prevent visibility

---

## When to use it

- After successful data fetch
- When result set is empty
- When no error is present
- When loading has completed

---

## When NOT to use it

- During loading (use skeletons)
- For error states (use error state component)
- As a placeholder for missing configuration

---

## Interaction model

- Displays optional call-to-action button
- Action is explicit and user-driven
- Does not auto-trigger behavior

---

## Constraints

- Always vertically centered
- Icon remains decorative
- Action is optional but limited to one primary button
- Must remain visually balanced in narrow layouts

---

## Accessibility guarantees

- Uses semantic heading hierarchy
- Button is keyboard accessible
- No color-only meaning
- Decorative icon does not convey critical information

---

## Design-system notes

- Token-driven styling (bg-muted, text-muted-foreground)
- Built on shadcn Card
- Dark-mode compatible
- Deterministic rendering (Chromatic safe)
        `,
			},
		},
	},
	argTypes: {
		title: {
			description: 'Primary empty state message.',
			control: 'text',
			table: {
				type: { summary: 'string' },
			},
		},
		description: {
			description: 'Secondary supportive guidance text.',
			control: 'text',
			table: {
				type: { summary: 'string' },
			},
		},
		icon: {
			description:
				'Optional custom icon. Defaults to InboxIcon. Should remain decorative.',
			control: false,
			table: {
				type: { summary: 'IconSvgElement' },
				defaultValue: { summary: 'InboxIcon' },
			},
		},
		action: {
			description:
				'Optional call-to-action button. Used for reset, create, or onboarding flows.',
			control: false,
			table: {
				type: {
					summary: '{ label: string; onClick: () => void }',
				},
			},
		},
		className: {
			description: 'Optional additional class names.',
			control: false,
			table: {
				type: { summary: 'string' },
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof ListEmptyState>;

/**
 * NoResults
 *
 * Occurs when a list query succeeds but returns zero items.
 */
export const NoResults: Story = {
	args: {
		title: 'No results found',
		description: 'Try adjusting your filters or search terms.',
	},
	parameters: {
		docs: {
			description: {
				story: 'Represents a successful query that returned no matching items.',
			},
		},
	},
};

/**
 * FilteredEmpty
 *
 * Occurs when active filters exclude all items.
 * Action typically resets filters.
 */
export const FilteredEmpty: Story = {
	args: {
		title: 'Nothing matches your filters',
		description: 'Reset filters to see all available items.',
		action: {
			label: 'Reset filters',
			onClick: () => {},
		},
	},
	parameters: {
		docs: {
			description: {
				story: 'Used when filtering removes all visible items from the dataset.',
			},
		},
	},
};

/**
 * NoDataYet
 *
 * Occurs when the system has no data yet.
 * Often seen in new accounts or onboarding flows.
 */
export const NoDataYet: Story = {
	args: {
		title: 'No items yet',
		description: 'Get started by creating your first item.',
		action: {
			label: 'Create item',
			onClick: () => {},
		},
	},
	parameters: {
		docs: {
			description: {
				story: 'Represents an initial empty system state before any data exists.',
			},
		},
	},
};

/**
 * NoAccess
 *
 * Occurs when the user lacks permission to view any items.
 */
export const NoAccess: Story = {
	args: {
		title: 'Nothing to show',
		description: 'You do not have access to any items in this list.',
	},
	parameters: {
		docs: {
			description: {
				story: 'Represents a permission-based empty state where visibility is restricted.',
			},
		},
	},
};

/**
 * DarkMode
 *
 * Validates token contrast, icon visibility,
 * and outline button clarity in dark theme.
 */
export const DarkMode: Story = {
	args: {
		title: 'No results found',
		description: 'Try adjusting your filters or search terms.',
		action: {
			label: 'Reset filters',
			onClick: () => {},
		},
	},
	parameters: {
		themes: { themeOverride: 'dark' },
		docs: {
			description: {
				story: 'Ensures visual parity and accessible contrast in dark mode.',
			},
		},
	},
};

/**
 * NarrowContainer
 *
 * Verifies wrapping behavior and vertical balance
 * inside constrained layouts such as sidebars or mobile views.
 */
export const NarrowContainer: Story = {
	args: {
		title: 'No results found',
		description:
			'Try adjusting your filters or search terms to find what you are looking for.',
		action: {
			label: 'Reset filters',
			onClick: () => {},
		},
	},
	render: (args) => (
		<div className="w-[320px] border p-4">
			<ListEmptyState {...args} />
		</div>
	),
};
