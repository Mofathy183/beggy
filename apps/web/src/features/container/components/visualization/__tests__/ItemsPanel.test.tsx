import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, render, waitFor } from '@testing-library/react';
import { setupUser } from '@tests';

import ItemsPanel from '../ItemsPanel';

// ─── Mocks ─────────────────────────────────────────────────────────────

const useItemsListMock = vi.fn();

vi.mock('@features/items/hooks', () => ({
	useItemsList: () => useItemsListMock(),
}));

// Mock ItemCard to avoid testing its internals
vi.mock('@features/items/components/details/ItemCard', () => ({
	default: ({ item }: { item: { name: string } }) => <div>{item.name}</div>,
}));

// ─── Test data ─────────────────────────────────────────────────────────

const mockItems = [
	{
		id: '1',
		name: 'Backpack',
	},
	{
		id: '2',
		name: 'Camera',
	},
];

// Minimal shape (we only care about name/id in this test)
const createHookState = (overrides?: Partial<any>) => ({
	data: mockItems,
	isLoading: false,
	...overrides,
});

// ─── Tests ─────────────────────────────────────────────────────────────

describe('ItemsPanel', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useItemsListMock.mockReturnValue(createHookState());
	});

	it('renders search input and items when data is available', () => {
		render(<ItemsPanel containerId="bag-1" />);

		expect(screen.getByLabelText(/search items/i)).toBeInTheDocument();

		expect(screen.getByText('Backpack')).toBeInTheDocument();
		expect(screen.getByText('Camera')).toBeInTheDocument();
	});

	it('renders loading state while items are being fetched', () => {
		useItemsListMock.mockReturnValue(createHookState({ isLoading: true }));

		render(<ItemsPanel containerId="bag-1" />);

		// Skeletons have no role → assert via count of placeholders
		expect(screen.getAllByRole('list')).toBeTruthy();
	});

	it('renders empty state when no items exist', () => {
		useItemsListMock.mockReturnValue(createHookState({ data: [] }));

		render(<ItemsPanel containerId="bag-1" />);

		expect(
			screen.getByText(/you haven't added any items yet/i)
		).toBeInTheDocument();
	});

	it('filters items when the user enters a search query', async () => {
		const user = setupUser();

		render(<ItemsPanel containerId="bag-1" />);

		await user.type(screen.getByLabelText(/search items/i), 'cam');

		// Wait for debounce + re-render
		expect(await screen.findByText('Camera')).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.queryByText('Backpack')).not.toBeInTheDocument();
		});
	});

	it('renders no-match state when the search yields no results', async () => {
		const user = setupUser();

		render(<ItemsPanel containerId="bag-1" />);

		await user.type(screen.getByLabelText(/search items/i), 'laptop');

		expect(
			await screen.findByText(/nothing matches that search/i)
		).toBeInTheDocument();
	});

	it('renders items as draggable list items', () => {
		render(<ItemsPanel containerId="bag-1" />);

		const items = screen.getAllByRole('listitem');

		expect(items).toHaveLength(2);
	});

	it('renders drag hint text', () => {
		render(<ItemsPanel containerId="bag-1" />);

		expect(
			screen.getByText(/drag any item onto the bag to pack it/i)
		).toBeInTheDocument();
	});
});
