import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ListMeta from '../ListMeta';
import type { PaginationMeta } from '@beggy/shared/types';

describe('ListMeta', () => {
	it('returns loading state when isLoading is true', () => {
		const { container } = render(
			<ListMeta meta={null} isLoading label="users" />
		);

		expect(container.firstChild).toBeTruthy();
		expect(screen.queryByText(/showing/i)).not.toBeInTheDocument();
	});

	it('returns null when meta is null and not loading', () => {
		const { container } = render(
			<ListMeta meta={null} isLoading={false} label="users" />
		);

		expect(container.firstChild).toBeNull();
	});

	it('returns empty message when count is 0', () => {
		const meta: PaginationMeta = {
			page: 1,
			limit: 10,
			count: 0,
			totalItems: 0,
			totalPages: 0,
			hasNextPage: false,
			hasPreviousPage: false,
		};

		render(<ListMeta meta={meta} label="users" />);

		expect(screen.getByText('No users found')).toBeInTheDocument();
	});

	it('returns visible range and total when data exists', () => {
		const meta: PaginationMeta = {
			page: 2,
			limit: 10,
			count: 10,
			totalItems: 100,
			totalPages: 10,
			hasNextPage: false,
			hasPreviousPage: false,
		};

		render(<ListMeta meta={meta} label="users" />);

		expect(screen.getByText(/showing/i)).toBeInTheDocument();
		expect(screen.getByText('11–20')).toBeInTheDocument();
		expect(screen.getByText('100')).toBeInTheDocument();
		expect(screen.getByText('users')).toBeInTheDocument();
	});

	it('returns end value when totalItems is undefined', () => {
		const meta: PaginationMeta = {
			page: 2,
			limit: 10,
			count: 5,
			totalItems: undefined,
			totalPages: 2,
			hasNextPage: false,
			hasPreviousPage: false,
		};

		render(<ListMeta meta={meta} label="orders" />);

		expect(screen.getByText('11–15')).toBeInTheDocument();
		expect(screen.getByText('15')).toBeInTheDocument();
	});

	it('returns page indicator when multiple pages exist', () => {
		const meta: PaginationMeta = {
			page: 3,
			limit: 10,
			count: 10,
			totalItems: 50,
			totalPages: 5,
			hasNextPage: false,
			hasPreviousPage: false,
		};

		render(<ListMeta meta={meta} label="products" />);

		expect(screen.getByText(/page/i)).toBeInTheDocument();
		expect(screen.getByText('3')).toBeInTheDocument();
		expect(screen.getByText('5')).toBeInTheDocument();
	});

	it('does not return page indicator when only one page exists', () => {
		const meta: PaginationMeta = {
			page: 1,
			limit: 10,
			count: 10,
			totalItems: 10,
			totalPages: 1,
			hasNextPage: false,
			hasPreviousPage: false,
		};

		render(<ListMeta meta={meta} label="products" />);

		expect(screen.queryByText(/page/i)).not.toBeInTheDocument();
	});
});
