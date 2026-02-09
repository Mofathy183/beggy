import { render, screen } from '@testing-library/react';
import ListMeta from '../ListMeta';
import type { PaginationMeta } from '@beggy/shared/types';

describe('ListMeta', () => {
	it('shows loading state', () => {
		const { container } = render(<ListMeta meta={null} isLoading />);

		// Skeleton renders divs, so we assert container is not empty
		expect(container.firstChild).toBeTruthy();
	});

	it('renders nothing when no metadata is provided', () => {
		const { container } = render(<ListMeta meta={null} />);

		expect(container.firstChild).toBeNull();
	});

	it('shows empty state when there are no results', () => {
		render(
			<ListMeta
				meta={
					{
						page: 1,
						limit: 10,
						count: 0,
						totalItems: 0,
						totalPages: 0,
					} as PaginationMeta
				}
				label="users"
			/>
		);

		expect(screen.getByText(/no users found/i)).toBeInTheDocument();
	});

	it('shows result range and total count', () => {
		render(
			<ListMeta
				meta={
					{
						page: 2,
						limit: 10,
						count: 5,
						totalItems: 25,
						totalPages: 3,
					} as PaginationMeta
				}
				label="items"
			/>
		);

		expect(screen.getByText(/showing/i)).toBeInTheDocument();
		expect(screen.getByText('11–15')).toBeInTheDocument();
		expect(screen.getByText('25')).toBeInTheDocument();
		expect(screen.getByText(/items/i)).toBeInTheDocument();
	});

	it('shows a valid range when total count is missing', () => {
		render(
			<ListMeta
				meta={
					{
						page: 1,
						limit: 10,
						count: 7,
						totalPages: 1,
					} as PaginationMeta
				}
			/>
		);

		expect(screen.getByText('1–7')).toBeInTheDocument();
	});

	it('shows page information only when multiple pages exist', () => {
		const { rerender } = render(
			<ListMeta
				meta={
					{
						page: 1,
						limit: 10,
						count: 10,
						totalPages: 1,
					} as PaginationMeta
				}
			/>
		);

		expect(screen.queryByText(/page/i)).not.toBeInTheDocument();

		rerender(
			<ListMeta
				meta={
					{
						page: 2,
						limit: 10,
						count: 10,
						totalPages: 3,
					} as PaginationMeta
				}
			/>
		);

		expect(
			screen.getByText(
				(_content, element) =>
					element?.textContent?.toLowerCase() === 'page 2 of 3'
			)
		).toBeInTheDocument();
	});
});
