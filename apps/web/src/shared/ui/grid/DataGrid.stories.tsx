import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import DataGrid from './DataGrid';
import { Card, CardContent } from '@shadcn-ui/card';

const MockCard = ({ label }: { label: string }) => (
	<Card className="h-32">
		<CardContent className="flex h-full items-center justify-center text-sm font-medium">
			{label}
		</CardContent>
	</Card>
);

const meta: Meta<typeof DataGrid> = {
	title: 'UI/Grid/DataGrid',
	component: DataGrid,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
A responsive layout grid used to display collections of cards or structured content.

### What it is
A responsive multi-column grid that adapts across breakpoints to present content in a dense but readable layout.

### When to use it
- Displaying collections of cards (users, products, posts, etc.)
- Structured content that benefits from consistent spacing
- Responsive gallery-style layouts

### When not to use it
- For tabular data (use a table component instead)
- For single-column content layouts
- For masonry-style irregular heights

### Interaction model
DataGrid itself has no interaction logic.
It is purely a layout container and forwards interaction responsibility to its children.

### Constraints
- 1 column on mobile
- 2 columns on small screens
- 3 columns on large screens
- 4 columns on extra-large screens
- Fixed gap spacing
- Children must manage their own height behavior

### Accessibility guarantees
- No semantic role assumptions
- Does not alter child semantics
- Keyboard behavior is delegated to children

### Design-system notes
- Token-based spacing
- Tailwind utility composition
- Safe for dark mode (no hardcoded colors)
- Designed for card-like children
        `,
			},
		},
	},
	argTypes: {
		children: {
			control: false,
			description: 'Content rendered inside the grid layout.',
			table: {
				type: { summary: 'ReactNode' },
			},
		},
		isLoading: {
			control: 'boolean',
			description:
				'Indicates loading state. Layout remains stable while data is loading.',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},
		empty: {
			control: false,
			description:
				'Element displayed when there are no children and not loading.',
			table: {
				type: { summary: 'ReactNode' },
			},
		},
		className: {
			control: false,
			description: 'Additional layout overrides.',
			table: {
				type: { summary: 'string' },
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof DataGrid>;

/**
 * Represents a populated collection of items.
 *
 * This is the primary state where the grid
 * distributes content across responsive columns.
 */
export const Default: Story = {
	render: () => (
		<DataGrid>
			{Array.from({ length: 8 }).map((_, i) => (
				<MockCard key={i} label={`Item ${i + 1}`} />
			))}
		</DataGrid>
	),
	parameters: {
		docs: {
			description: {
				story: 'Standard responsive grid displaying multiple items across breakpoints.',
			},
		},
	},
};

/**
 * Represents a collection with no available items.
 *
 * When no children exist and not loading,
 * the grid renders the provided empty state instead.
 */
export const EmptyState: Story = {
	render: () => (
		<DataGrid
			empty={
				<div className="flex h-40 items-center justify-center text-muted-foreground">
					No items found
				</div>
			}
			children={null}
		/>
	),
	parameters: {
		docs: {
			description: {
				story: 'Displays a custom empty state when no items are present.',
			},
		},
	},
};

/**
 * Demonstrates layout stability during loading.
 *
 * The grid maintains its structure while
 * skeleton or placeholder content is rendered.
 */
export const LoadingState: Story = {
	render: () => (
		<DataGrid isLoading>
			{Array.from({ length: 8 }).map((_, i) => (
				<Card key={i} className="h-32 animate-pulse" />
			))}
		</DataGrid>
	),
	parameters: {
		docs: {
			description: {
				story: 'Shows how the grid behaves when loading placeholders are rendered as children.',
			},
		},
	},
};

/**
 * Validates spacing, contrast neutrality,
 * and visual stability in dark theme.
 */
export const DarkMode: Story = {
	render: () => (
		<DataGrid>
			{Array.from({ length: 8 }).map((_, i) => (
				<MockCard key={i} label={`Item ${i + 1}`} />
			))}
		</DataGrid>
	),
	parameters: {
		themes: {
			default: 'dark',
		},
		docs: {
			description: {
				story: 'Dark mode validation ensuring layout tokens and spacing remain visually consistent.',
			},
		},
	},
};
