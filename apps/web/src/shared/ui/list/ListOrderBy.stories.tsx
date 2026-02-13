import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import ListOrderBy from './ListOrderBy';
import { OrderDirection } from '@beggy/shared/constants';
import type { UiOrderByOption } from '@shared/ui/mappers';

type Field = 'createdAt' | 'email' | 'role';

const options: UiOrderByOption<Field>[] = [
	{
		value: { orderBy: 'createdAt', direction: OrderDirection.DESC },
		label: 'Newest',
	},
	{
		value: { orderBy: 'createdAt', direction: OrderDirection.ASC },
		label: 'Oldest',
	},
	{
		value: { orderBy: 'email', direction: OrderDirection.ASC },
		label: 'Email A–Z',
	},
	{
		value: { orderBy: 'role', direction: OrderDirection.ASC },
		label: 'Role',
	},
];

const meta: Meta<typeof ListOrderBy<Field>> = {
	title: 'UI/List/ListOrderBy',
	component: ListOrderBy<Field>,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
**ListOrderBy** provides semantic sorting selection.

Unlike traditional field + direction pickers,
each option represents a complete backend-compatible sorting strategy
(e.g. "Newest", "Email A–Z").

It:
- Is fully controlled
- Emits sorting intent upward
- Does not manage internal state
- Does not fetch data

If value is null or options are empty,
the component renders nothing.
        `,
			},
		},
	},
	argTypes: {
		options: { control: false },
		value: { control: false },
		onChange: { control: false },
	},
};

export default meta;

type Story = StoryObj<typeof ListOrderBy<Field>>;

/**
 * Interactive
 *
 * Demonstrates controlled semantic sorting.
 * Parent owns sorting state and reacts to changes.
 */
export const Interactive: Story = {
	render: () => {
		const [value, setValue] = useState({
			orderBy: 'createdAt' as Field,
			direction: OrderDirection.DESC,
		});

		return (
			<ListOrderBy
				options={options}
				value={value}
				onChange={(next) => {
					console.log('sort change', next);
					setValue(next);
				}}
			/>
		);
	},
};

/**
 * DisabledOption
 *
 * Shows how certain strategies can be disabled
 * (e.g. permission-based restrictions).
 */
export const DisabledOption: Story = {
	render: () => {
		const [value, setValue] = useState({
			orderBy: 'createdAt' as Field,
			direction: OrderDirection.DESC,
		});

		const modifiedOptions = [
			...options,
			{
				value: {
					orderBy: 'role' as Field,
					direction: OrderDirection.ASC,
				},
				label: 'Role (Admin only)',
				disabled: true,
			},
		];

		return (
			<ListOrderBy
				options={modifiedOptions}
				value={value}
				onChange={setValue}
			/>
		);
	},
};

/**
 * NoValue
 *
 * When value is null, the component renders nothing.
 * Prevents uncontrolled or partial sort UI.
 */
export const NoValue: Story = {
	args: {
		options,
		value: null,
		onChange: (next) => console.log(next),
	},
};

/**
 * DarkMode
 *
 * Ensures outline button, badge, and dropdown
 * render correctly in dark theme.
 */
export const DarkMode: Story = {
	args: {
		options,
		value: {
			orderBy: 'createdAt',
			direction: OrderDirection.DESC,
		},
		onChange: (next) => console.log(next),
	},
	render: (args) => (
		<div className="dark bg-background p-6">
			<ListOrderBy {...args} />
		</div>
	),
	parameters: {
		themes: {
			default: 'dark',
		},
	},
};

/**
 * NarrowContainer
 *
 * Validates button and dropdown alignment
 * inside constrained layouts (e.g. sidebar).
 */
export const NarrowContainer: Story = {
	args: {
		options,
		value: {
			orderBy: 'email',
			direction: OrderDirection.ASC,
		},
		onChange: (next) => console.log(next),
	},
	render: (args) => (
		<div className="w-[260px] border p-4">
			<ListOrderBy {...args} />
		</div>
	),
};
