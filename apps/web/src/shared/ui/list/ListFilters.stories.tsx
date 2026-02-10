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

type SearchAndStatus = {
	search?: string;
	status?: 'all' | 'active' | 'archived';
};

type NumberRange = {
	weight?: {
		min?: number;
		max?: number;
	};
};

type DateRange = {
	createdAt?: {
		from?: string;
		to?: string;
	};
};

const meta: Meta<typeof ListFilters<any>> = {
	title: 'UI/List/ListFilters',
	component: ListFilters,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
**ListFilters** is a stateless layout container that frames filter inputs
and exposes clear **Apply / Reset** user intent.

It is intentionally schema-agnostic and works with:
- Zod query schemas
- REST filters
- Prisma where conditions

State, validation, and mapping live outside this component.
				`,
			},
		},
	},
};

export default meta;

/**
 * SearchAndStatus
 *
 * @remarks
 * - Common list filtering pattern
 * - Mirrors simple text + enum Zod schemas
 * - Typical for admin tables and dashboards
 */
export const SearchAndStatus: StoryObj = {
	render: () => {
		const [filters, setFilters] = useState<SearchAndStatus>({
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
						value={filters.search ?? ''}
						onChange={(e) =>
							setFilters({ ...filters, search: e.target.value })
						}
					/>
				</div>

				<div className="grid gap-1">
					<Label>Status</Label>
					<Select
						value={filters.status}
						onValueChange={(value) =>
							setFilters({
								...filters,
								status: value as SearchAndStatus['status'],
							})
						}
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
};

/**
 * NumberRange
 *
 * @remarks
 * - Mirrors numberRangeSchema from Zod
 * - Supports optional min / max boundaries
 * - Common for weight, capacity, volume, price
 */
export const NumberRange: StoryObj = {
	render: () => {
		const [filters, setFilters] = useState<NumberRange>({
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
						value={filters.weight?.min ?? ''}
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
						value={filters.weight?.max ?? ''}
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
 * DateRange
 *
 * @remarks
 * - Mirrors dateRangeSchema used in query filters
 * - Common for createdAt / updatedAt filtering
 * - Works with ISO strings or Date adapters
 */
export const DateRange: StoryObj = {
	render: () => {
		const [filters, setFilters] = useState<DateRange>({
			createdAt: {},
		});

		return (
			<ListFilters
				value={filters}
				onApply={(f) => console.log('apply', f)}
				onReset={() => setFilters({ createdAt: {} })}
			>
				<div className="grid grid-cols-2 gap-2">
					<Input
						type="date"
						value={filters.createdAt?.from ?? ''}
						onChange={(e) =>
							setFilters({
								createdAt: {
									...filters.createdAt,
									from: e.target.value || undefined,
								},
							})
						}
					/>
					<Input
						type="date"
						value={filters.createdAt?.to ?? ''}
						onChange={(e) =>
							setFilters({
								createdAt: {
									...filters.createdAt,
									to: e.target.value || undefined,
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
 * @remarks
 * - Used when a list has no filterable fields
 * - Important UX edge case for permissions or feature flags
 */
export const NoFilters: StoryObj = {
	render: () => (
		<ListFilters value={{}} onApply={() => {}} onReset={() => {}}>
			<p className="text-sm text-muted-foreground">
				No filters available for this list.
			</p>
		</ListFilters>
	),
};
