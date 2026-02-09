import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import ListEmptyState from './ListEmptyState';

const meta: Meta<typeof ListEmptyState> = {
	title: 'UI/ListEmptyState',
	component: ListEmptyState,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
**ListEmptyState** communicates that a list has no visible results.

It is used *after loading completes* and should not be shown
during skeleton or loading states.
				`,
			},
		},
	},
};

export default meta;

/**
 * NoResults
 *
 * @remarks
 * Used when a list query succeeds but returns zero items.
 */
export const NoResults: StoryObj = {
	args: {
		title: 'No results found',
		description: 'Try adjusting your filters or search terms.',
	},
};

/**
 * FilteredOutResults
 *
 * @remarks
 * Shown when filters are applied and exclude all items.
 * Usually paired with a "Reset filters" action.
 */
export const FilteredOutResults: StoryObj = {
	args: {
		title: 'Nothing matches your filters',
		description: 'Reset filters to see all available items.',
		action: {
			label: 'Reset filters',
			onClick: () => console.log('reset filters'),
		},
	},
};

/**
 * FirstTimeEmpty
 *
 * @remarks
 * Used when no data exists yet (empty system state).
 * Common in onboarding or fresh accounts.
 */
export const FirstTimeEmpty: StoryObj = {
	args: {
		title: 'No items yet',
		description: 'Get started by creating your first item.',
		action: {
			label: 'Create item',
			onClick: () => console.log('create item'),
		},
	},
};

/**
 * NoPermission
 *
 * @remarks
 * Used when the user cannot see any items due to access restrictions.
 */
export const NoPermission: StoryObj = {
	args: {
		title: 'Nothing to show',
		description: 'You do not have access to any items in this list.',
	},
};
