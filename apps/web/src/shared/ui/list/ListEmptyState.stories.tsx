import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import ListEmptyState from './ListEmptyState';

const meta: Meta<typeof ListEmptyState> = {
	title: 'UI/List/ListEmptyState',
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
	argTypes: {
		title: {
			control: 'text',
			description: 'Primary empty state message',
		},
		description: {
			control: 'text',
			description: 'Secondary guidance text',
		},
		action: {
			control: false,
			description: 'Optional call to action (label + handler)',
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
 * FilteredEmpty
 *
 * @remarks
 * Shown when filters are applied and exclude all items.
 * Usually paired with a "Reset filters" action.
 */
export const FilteredEmpty: StoryObj = {
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
 * NoDataYet
 *
 * @remarks
 * Used when no data exists yet (empty system state).
 * Common in onboarding or fresh accounts.
 */
export const NoDataYet: StoryObj = {
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
 * NoAccess
 *
 * @remarks
 * Used when the user cannot see any items due to access restrictions.
 */
export const NoAccess: StoryObj = {
	args: {
		title: 'Nothing to show',
		description: 'You do not have access to any items in this list.',
	},
};
