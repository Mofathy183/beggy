import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import ListPagination from './ListPagination';

import type { PaginationMeta } from '@beggy/shared/types';

/**
 * Storybook configuration for ListPagination.
 *
 * This file documents:
 * - Controlled behavior
 * - Disabled states
 * - Edge cases (first/last page)
 * - Null rendering behavior
 *
 * The component is intentionally minimal and API-driven.
 */
const meta: Meta<typeof ListPagination> = {
	title: 'UI/List/ListPagination',
	component: ListPagination,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
A minimal, controlled pagination component designed for API-driven lists.

### Key Characteristics
- Fully controlled (stateless)
- Defensive against invalid metadata
- Designed for dashboards, tables, and admin panels
- Prevents invalid navigation states

If \`meta\` is \`null\`, the component renders nothing.
        `,
			},
		},
	},
	argTypes: {
		meta: {
			description: `
Pagination metadata returned from the API.

Structure:
- page (number, 1-based)
- totalPages (number)
- hasNextPage (boolean)
- hasPreviousPage (boolean)

If null, pagination will not render.
      `,
			control: 'object',
		},
		onPageChange: {
			description: `
Callback triggered when user navigates to a new page.

This component does NOT manage state internally.
      `,
			action: 'pageChanged',
			table: {
				category: 'Events',
			},
		},
		isDisabled: {
			description: `
Disables all pagination interaction.

Useful during loading or mutation states.
      `,
			control: 'boolean',
			defaultValue: false,
		},
	},
};

export default meta;
type Story = StoryObj<typeof ListPagination>;

const baseMeta: PaginationMeta = {
	page: 1,
	limit: 10,
	count: 10,
	totalItems: 50,
	totalPages: 5,
	hasNextPage: true,
	hasPreviousPage: false,
};

/**
 * Default state.
 *
 * Represents a typical middle-page scenario.
 */
export const Default: Story = {
	args: {
		meta: {
			...baseMeta,
			page: 3,
			totalPages: 10,
			hasNextPage: true,
			hasPreviousPage: true,
		},
		isDisabled: false,
	},
};

/**
 * First page state.
 *
 * Previous button should be disabled.
 */
export const FirstPage: Story = {
	args: {
		meta: {
			...baseMeta,
			page: 1,
			totalPages: 10,
			hasNextPage: true,
			hasPreviousPage: false,
		},
	},
};

/**
 * Last page state.
 *
 * Next button should be disabled.
 */
export const LastPage: Story = {
	args: {
		meta: {
			...baseMeta,
			page: 10,
			totalPages: 10,
			hasNextPage: false,
			hasPreviousPage: true,
		},
	},
};

/**
 * Disabled state.
 *
 * Interaction is fully blocked regardless of metadata.
 */
export const Disabled: Story = {
	args: {
		meta: {
			...baseMeta,
			page: 4,
			totalPages: 10,
			hasNextPage: true,
			hasPreviousPage: true,
		},
		isDisabled: true,
	},
};

/**
 * Null metadata.
 *
 * Component returns null.
 */
export const NoMeta: Story = {
	args: {
		meta: null,
	},
};

/**
 * Interactive demo.
 *
 * Demonstrates fully controlled behavior inside Storybook.
 */
export const Interactive: Story = {
	render: () => {
		const [page, setPage] = useState(1);
		const totalPages = 5;

		return (
			<ListPagination
				meta={{
					...baseMeta,
					page,
					totalPages,
					hasNextPage: page < totalPages,
					hasPreviousPage: page > 1,
				}}
				onPageChange={setPage}
			/>
		);
	},
};

/**
 * DarkMode.
 *
 * Ensures outline button, badge, and pagination
 * render correctly in dark theme with interactive.
 */
export const DarkMode: Story = {
	render: () => {
		const [page, setPage] = useState(1);
		const totalPages = 5;

		return (
			<div className="dark bg-background p-6">
				<ListPagination
					meta={{
						...baseMeta,
						page,
						totalPages,
						hasNextPage: page < totalPages,
						hasPreviousPage: page > 1,
					}}
					onPageChange={setPage}
				/>
			</div>
		);
	},
};
