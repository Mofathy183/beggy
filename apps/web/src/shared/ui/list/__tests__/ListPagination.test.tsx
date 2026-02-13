import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ListPagination from '../ListPagination';
import type { PaginationMeta } from '@beggy/shared/types';

describe('ListPagination', () => {
	const baseMeta: PaginationMeta = {
		page: 2,
		totalPages: 5,
		hasNextPage: true,
		hasPreviousPage: true,
		count: 50,
		limit: 10,
	};

	it('returns null when meta is null', () => {
		const { container } = render(
			<ListPagination meta={null} onPageChange={vi.fn()} />
		);

		expect(container.firstChild).toBeNull();
	});

	it('returns current page and total pages', () => {
		render(<ListPagination meta={baseMeta} onPageChange={vi.fn()} />);

		expect(screen.getByText(/page 2 of 5/i)).toBeInTheDocument();
	});

	it('calls onPageChange with previous page when previous is clicked', async () => {
		const user = userEvent.setup();
		const handleChange = vi.fn();

		render(<ListPagination meta={baseMeta} onPageChange={handleChange} />);

		const previous = screen.getByLabelText(/go to previous page/i);

		await user.click(previous);

		expect(handleChange).toHaveBeenCalledWith(1);
	});

	it('calls onPageChange with next page when next is clicked', async () => {
		const user = userEvent.setup();
		const handleChange = vi.fn();

		render(<ListPagination meta={baseMeta} onPageChange={handleChange} />);

		const next = screen.getByLabelText(/go to next page/i);

		await user.click(next);

		expect(handleChange).toHaveBeenCalledWith(3);
	});

	it('does not call onPageChange when previous page is unavailable', async () => {
		const user = userEvent.setup();
		const handleChange = vi.fn();

		const meta: PaginationMeta = {
			...baseMeta,
			hasPreviousPage: false,
		};

		render(<ListPagination meta={meta} onPageChange={handleChange} />);

		const previous = screen.getByLabelText(/go to previous page/i);

		await user.click(previous);

		expect(handleChange).not.toHaveBeenCalled();
	});

	it('does not call onPageChange when next page is unavailable', async () => {
		const user = userEvent.setup();
		const handleChange = vi.fn();

		const meta: PaginationMeta = {
			...baseMeta,
			hasNextPage: false,
		};

		render(<ListPagination meta={meta} onPageChange={handleChange} />);

		const next = screen.getByLabelText(/go to next page/i);

		await user.click(next);

		expect(handleChange).not.toHaveBeenCalled();
	});

	it('does not call onPageChange when component is disabled', async () => {
		const user = userEvent.setup();
		const handleChange = vi.fn();

		render(
			<ListPagination
				meta={baseMeta}
				onPageChange={handleChange}
				isDisabled
			/>
		);

		const next = screen.getByLabelText(/go to next page/i);

		await user.click(next);

		expect(handleChange).not.toHaveBeenCalled();
	});
});
