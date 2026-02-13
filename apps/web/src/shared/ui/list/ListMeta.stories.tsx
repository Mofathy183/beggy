import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import ListMeta from './ListMeta';
import type { PaginationMeta } from '@beggy/shared/types';

const meta: Meta<typeof ListMeta> = {
	title: 'UI/List/ListMeta',
	component: ListMeta,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
**ListMeta** provides contextual feedback about a list query.

It translates pagination metadata into clear, human-readable context.

It communicates:
- How many results are visible
- How many exist in total
- Which page the user is on

It is a presentation component only:
- It does not control pagination
- It does not trigger navigation
- It does not fetch data

It should not be rendered during errors or before the first request.

				`,
			},
		},
	},
	argTypes: {
		label: {
			control: 'text',
			description: 'Entity label displayed to the user',
		},
		isLoading: {
			control: 'boolean',
		},
		meta: {
			control: false,
		},
	},
};

export default meta;

const baseMeta: PaginationMeta = {
	page: 1,
	limit: 10,
	count: 10,
	totalItems: 42,
	totalPages: 5,
	hasNextPage: true,
	hasPreviousPage: false,
};

/**
 * Loading
 *
 * @remarks
 * Displayed while the list query is in progress.
 */
export const Loading: StoryObj = {
	args: {
		isLoading: true,
		meta: null,
	},
};

/**
 * Empty
 *
 * @remarks
 * Used when the query succeeds but returns zero items.
 */
export const Empty: StoryObj = {
	args: {
		meta: {
			...baseMeta,
			count: 0,
			totalItems: 0,
			totalPages: 0,
		},
		label: 'users',
	},
};

/**
 * FirstPage
 *
 * @remarks
 * Standard list state with visible results.
 */
export const FirstPage: StoryObj = {
	args: {
		meta: baseMeta,
		label: 'items',
	},
};

/**
 * MiddlePage
 *
 * @remarks
 * Indicates pagination context when the user is not on the first page.
 */
export const MiddlePage: StoryObj = {
	args: {
		meta: {
			...baseMeta,
			page: 3,
			hasNextPage: true,
			hasPreviousPage: true,
		},
		label: 'bags',
	},
};

export const DarkMode: StoryObj<typeof ListMeta> = {
	args: {
		meta: baseMeta,
		label: 'items',
	},
	render: (args) => (
		<div className="dark bg-background p-6">
			<ListMeta {...args} />
		</div>
	),
	parameters: {
		themes: {
			default: 'dark',
		},
	},
};
