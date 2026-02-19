import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import ListFilters from './ListFilters';
import { Input } from '@shadcn-ui/input';
import {
	Select,
	SelectItem,
	SelectValue,
	SelectContent,
	SelectTrigger,
} from '@shadcn-ui/select';
import { Label } from '@shadcn-ui/label';

const meta: Meta<typeof ListFilters<any>> = {
	title: 'UI/List/ListFilters',
	component: ListFilters,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
A stateless filter layout container that communicates user filter intent.

---

## What it is

A structured card surface that:

- Frames filter inputs
- Communicates filter intent
- Exposes **Apply** and **Reset** actions
- Delegates state and validation upward

It does not own business logic.

---

## When to use it

- Admin dashboards
- Data tables
- Search/filter panels
- Sidebars
- Advanced query builders

---

## When NOT to use it

- For inline filtering inside table headers
- For simple single-input filtering
- When no explicit Apply/Reset intent is required

---

## Interaction model

- Users adjust filter inputs
- Reset clears filter values
- Apply confirms intent explicitly
- No auto-submission

---

## Constraints

- Always renders Apply and Reset actions
- Does not validate inputs
- Does not fetch data
- Layout must remain stable in narrow containers

---

## Accessibility guarantees

- Buttons are keyboard accessible
- Header icon is decorative
- Clear visual hierarchy
- No color-only meaning

---

## Design-system notes

- Built on shadcn Card
- Token-driven styling
- Dark-mode compatible
- Deterministic rendering
        `,
			},
		},
	},
	argTypes: {
		title: {
			description: 'Optional header title. Defaults to "Filters".',
			control: 'text',
			table: {
				type: { summary: 'string' },
				defaultValue: { summary: '"Filters"' },
			},
		},
		className: {
			description: 'Optional additional class names.',
			control: false,
			table: {
				type: { summary: 'string' },
			},
		},
		value: { table: { disable: true } },
		onApply: { table: { disable: true } },
		onReset: { table: { disable: true } },
		children: { table: { disable: true } },
	},
};

export default meta;
type Story = StoryObj<typeof ListFilters<any>>;

/**
 * SearchAndStatus
 *
 * Common dashboard filtering pattern combining
 * text search and enum-based selection.
 */
export const SearchAndStatus: Story = {
	render: () => {
		const [filters, setFilters] = useState({
			search: '',
			status: 'all',
		});

		return (
			<ListFilters
				value={filters}
				onApply={(f) => console.log('apply', f)}
				onReset={() => setFilters({ search: '', status: 'all' })}
			>
				<div className="grid gap-1">
					<Label>Search</Label>
					<Input
						placeholder="Search by name or keyword"
						value={filters.search}
						onChange={(e) =>
							setFilters({ ...filters, search: e.target.value })
						}
					/>
				</div>

				<div className="grid gap-1">
					<Label>Status</Label>
					<Select
						value={filters.status}
						onValueChange={(value: string | null) => {
							setFilters({ ...filters, status: value ?? '' });
						}}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All</SelectItem>
							<SelectItem value="active">Active</SelectItem>
							<SelectItem value="archived">Archived</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</ListFilters>
		);
	},
	parameters: {
		docs: {
			description: {
				story: 'Represents a typical admin filtering experience combining search and status selection.',
			},
		},
	},
};

/**
 * NumberRange
 *
 * Used for numeric filtering such as weight,
 * price, capacity, or quantity ranges.
 */
export const NumberRange: Story = {
	render: () => {
		const [filters, setFilters] = useState({
			weight: {},
		});

		return (
			<ListFilters
				value={filters}
				onApply={(f) => console.log('apply', f)}
				onReset={() => setFilters({ weight: {} })}
			>
				<div className="grid grid-cols-2 gap-2">
					<Input
						type="number"
						placeholder="Min weight"
						onChange={(e) =>
							setFilters({
								weight: {
									...filters.weight,
									min: e.target.value
										? Number(e.target.value)
										: undefined,
								},
							})
						}
					/>
					<Input
						type="number"
						placeholder="Max weight"
						onChange={(e) =>
							setFilters({
								weight: {
									...filters.weight,
									max: e.target.value
										? Number(e.target.value)
										: undefined,
								},
							})
						}
					/>
				</div>
			</ListFilters>
		);
	},
};

/**
 * NoFilters
 *
 * Occurs when a list supports no filtering.
 * Important edge case for permissions or feature flags.
 */
export const NoFilters: Story = {
	render: () => (
		<ListFilters value={{}} onApply={() => {}} onReset={() => {}}>
			<p className="text-sm text-muted-foreground">
				No filters available for this list.
			</p>
		</ListFilters>
	),
};

/**
 * DarkMode
 *
 * Ensures token contrast and button hierarchy
 * remain accessible in dark theme.
 */
export const DarkMode: Story = {
	render: () => {
		const [filters, setFilters] = useState({
			search: '',
		});

		return (
			<ListFilters
				value={filters}
				onApply={() => {}}
				onReset={() => setFilters({ search: '' })}
			>
				<div className="grid gap-1">
					<Label>Search</Label>
					<Input
						value={filters.search}
						onChange={(e) => setFilters({ search: e.target.value })}
					/>
				</div>
			</ListFilters>
		);
	},
	parameters: {
		themes: { themeOverride: 'dark' },
	},
};

/**
 * NarrowContainer
 *
 * Verifies layout stability in constrained panels
 * such as sidebars or mobile drawers.
 */
export const NarrowContainer: Story = {
	render: () => {
		const [filters, setFilters] = useState({
			search: '',
		});

		return (
			<div className="w-[320px] border p-4">
				<ListFilters
					value={filters}
					onApply={() => {}}
					onReset={() => setFilters({ search: '' })}
				>
					<div className="grid gap-1">
						<Label>Search</Label>
						<Input
							value={filters.search}
							onChange={(e) =>
								setFilters({ search: e.target.value })
							}
						/>
					</div>
				</ListFilters>
			</div>
		);
	},
};
