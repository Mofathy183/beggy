import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ListOrderBy from '../ListOrderBy';
import type { UiOrderByOption } from '@shared/ui/mappers';
import { OrderDirection } from '@beggy/shared/constants';

describe('ListOrderBy', () => {
	const options: UiOrderByOption<'createdAt' | 'email'>[] = [
		{
			value: {
				orderBy: 'createdAt',
				direction: OrderDirection.DESC,
			},
			label: 'Newest',
		},
		{
			value: {
				orderBy: 'createdAt',
				direction: OrderDirection.ASC,
			},
			label: 'Oldest',
		},
		{
			value: {
				orderBy: 'email',
				direction: OrderDirection.ASC,
			},
			label: 'Email',
		},
	];

	it('returns null when value is null', () => {
		const { container } = render(
			<ListOrderBy options={options} value={null} onChange={vi.fn()} />
		);

		expect(container.firstChild).toBeNull();
	});

	it('returns null when options are empty', () => {
		const { container } = render(
			<ListOrderBy
				options={[]}
				value={{
					orderBy: 'createdAt',
					direction: OrderDirection.DESC,
				}}
				onChange={vi.fn()}
			/>
		);

		expect(container.firstChild).toBeNull();
	});

	it('returns label of selected sort option', () => {
		render(
			<ListOrderBy
				options={options}
				value={{
					orderBy: 'createdAt',
					direction: OrderDirection.DESC,
				}}
				onChange={vi.fn()}
			/>
		);

		expect(screen.getByText('Newest')).toBeInTheDocument();
	});

	it('calls onChange with selected sort value when option is selected', async () => {
		const user = userEvent.setup();
		const handleChange = vi.fn();

		render(
			<ListOrderBy
				options={options}
				value={{
					orderBy: 'createdAt',
					direction: OrderDirection.DESC,
				}}
				onChange={handleChange}
			/>
		);

		await user.click(
			screen.getByRole('button', { name: /change sorting order/i })
		);

		const oldest = await screen.findByRole('menuitemradio', {
			name: 'Oldest',
		});

		await user.click(oldest);

		expect(handleChange).toHaveBeenCalledWith({
			orderBy: 'createdAt',
			direction: OrderDirection.ASC,
		});
	});
});
