import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ListFilters from '../ListFilters';

type TestFilters = {
	search: string;
	status: 'active' | 'inactive';
};

const filters: TestFilters = {
	search: 'hello',
	status: 'active',
};

describe('ListFilters', () => {
	it('renders filter controls and actions', () => {
		render(
			<ListFilters value={filters} onApply={vi.fn()} onReset={vi.fn()}>
				<div>Filter Control</div>
			</ListFilters>
		);

		expect(screen.getByText('Filters')).toBeInTheDocument();
		expect(screen.getByText('Filter Control')).toBeInTheDocument();

		expect(
			screen.getByRole('button', { name: /apply/i })
		).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: /reset/i })
		).toBeInTheDocument();
	});

	it('applies the current filter value', async () => {
		const user = userEvent.setup();
		const onApply = vi.fn();

		render(
			<ListFilters value={filters} onApply={onApply} onReset={vi.fn()}>
				<div />
			</ListFilters>
		);

		await user.click(screen.getByRole('button', { name: /apply/i }));

		expect(onApply).toHaveBeenCalledTimes(1);
		expect(onApply).toHaveBeenCalledWith(filters);
	});

	it('resets filters', async () => {
		const user = userEvent.setup();
		const onReset = vi.fn();

		render(
			<ListFilters value={filters} onApply={vi.fn()} onReset={onReset}>
				<div />
			</ListFilters>
		);

		await user.click(screen.getByRole('button', { name: /reset/i }));

		expect(onReset).toHaveBeenCalledTimes(1);
	});
});
