import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import ListMeta from './ListMeta';
import type { PaginationMeta } from '@beggy/shared/types';

const meta: Meta<typeof ListMeta> = {
	title: 'UI/ListMeta',
	component: ListMeta,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
**ListMeta** provides contextual feedback about a list query.

It explains:
- How many results are visible
- How many exist in total
- Which page the user is on

It should not be rendered during errors or before the first request.
				`,
			},
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
 * NoResults
 *
 * @remarks
 * Used when the query succeeds but returns zero items.
 */
export const NoResults: StoryObj = {
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
 * WithResults
 *
 * @remarks
 * Standard list state with visible results.
 */
export const WithResults: StoryObj = {
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
