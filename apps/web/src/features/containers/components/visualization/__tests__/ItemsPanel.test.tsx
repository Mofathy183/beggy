import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, render, waitFor } from '@testing-library/react';
import { setupUser } from '@tests';

import ItemsPanel from '../ItemsPanel';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const useItemsListMock = vi.fn();

vi.mock('@features/items/hooks', () => ({
	useItemsList: () => useItemsListMock(),
}));

// Avoid testing ItemCard internals — just render the name
vi.mock('@features/items/components/details/ItemCard', () => ({
	default: ({ item }: { item: { name: string } }) => <div>{item.name}</div>,
}));

// dnd-kit requires a DndContext — stub useDraggable so DraggableItemCard
// renders without crashing in jsdom (no pointer events / DnD provider needed)
vi.mock('@dnd-kit/react', () => ({
	useDraggable: () => ({ ref: vi.fn(), isDragging: false }),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockItems = [
	{ id: '1', name: 'Backpack' },
	{ id: '2', name: 'Camera' },
];

/**
 * Returns the full shape that useItemsList (via useListQuery) produces.
 * Every field ItemsPanel destructures must be present — missing any one
 * causes a crash before the component can render.
 */
const createHookState = (overrides?: object) => ({
	// Data
	data: mockItems,
	meta: { count: mockItems.length, page: 1, limit: 12, totalPages: 1 },
	isLoading: false,
	isFetching: false,
	error: undefined,

	// Pagination — ItemsPanel reads pagination.page directly
	pagination: { page: 1, limit: 12 },
	setPagination: vi.fn(),

	// Filters / sorting (unused by ItemsPanel but part of the hook shape)
	filters: {},
	orderBy: {},
	hasData: true,
	isEmpty: false,

	setFilters: vi.fn(),
	setOrderBy: vi.fn(),
	reset: vi.fn(),
	refetch: vi.fn(),

	...overrides,
});

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
	vi.clearAllMocks();
	useItemsListMock.mockReturnValue(createHookState());
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ItemsPanel', () => {
	it('renders search input and items when data is available', () => {
		render(<ItemsPanel containerId="bag-1" />);

		expect(screen.getByLabelText(/search items/i)).toBeInTheDocument();
		expect(screen.getByText('Backpack')).toBeInTheDocument();
		expect(screen.getByText('Camera')).toBeInTheDocument();
	});

	it('renders loading skeletons while items are being fetched on page 1', () => {
		useItemsListMock.mockReturnValue(
			createHookState({
				data: [],
				isLoading: true,
				meta: null,
				pagination: { page: 1, limit: 12 },
			})
		);

		render(<ItemsPanel containerId="bag-1" />);

		// Skeletons have no semantic role — assert the list container
		// is present and no item text is rendered yet
		expect(screen.getByRole('list')).toBeInTheDocument();
		expect(screen.queryByText('Backpack')).not.toBeInTheDocument();
	});

	it('renders empty state when no items exist', () => {
		useItemsListMock.mockReturnValue(
			createHookState({
				data: [],
				meta: { count: 0, page: 1, limit: 12, totalPages: 0 },
				hasData: false,
				isEmpty: true,
			})
		);

		render(<ItemsPanel containerId="bag-1" />);

		expect(
			screen.getByText(/you haven't added any items yet/i)
		).toBeInTheDocument();
	});

	it('filters items client-side when the user enters a search query', async () => {
		const user = setupUser();

		render(<ItemsPanel containerId="bag-1" />);

		await user.type(screen.getByLabelText(/search items/i), 'cam');

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

		const listItems = screen.getAllByRole('listitem');

		expect(listItems).toHaveLength(2);
	});

	it('renders drag hint text', () => {
		render(<ItemsPanel containerId="bag-1" />);

		expect(
			screen.getByText(/drag any item onto the bag to pack it/i)
		).toBeInTheDocument();
	});
});
