import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, render } from '@testing-library/react';
import { setupUser } from '@tests';

import { ItemCategory, WeightUnit, VolumeUnit } from '@beggy/shared/constants';
import { notify } from '@shared/utils';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const unpackMock = vi.fn();
const useContainerActionsMock = vi.fn();

vi.mock('@features/container/components/dialogs', () => ({
	ContainerActionDialog: ({ open }: { open: boolean }) =>
		open ? <div role="dialog">Move Dialog</div> : null,
}));

vi.mock('@features/container/hooks', () => ({
	useContainerActions: () => useContainerActionsMock(),
}));

vi.mock('@shared/utils', () => ({
	notify: {
		success: vi.fn(),
		error: Object.assign(vi.fn(), {
			fromHttp: vi.fn(),
		}),
	},
}));

// Mock child components (we don't test them here)
vi.mock('../PackedItemRow', () => ({
	default: ({ item, onUnpack, onMove }: any) => (
		<div>
			<span>{item.name}</span>
			<button onClick={() => onUnpack(item)}>Unpack {item.name}</button>
			<button onClick={() => onMove(item)}>Move {item.name}</button>
		</div>
	),
}));

import PackedItemList from '../PackedItemList';

// ─── Test Data ────────────────────────────────────────────────────────────────

const item = {
	itemId: '1',
	name: 'Camera',
	category: ItemCategory.ELECTRONICS,
	quantity: 2,
	weight: 1,
	weightUnit: WeightUnit.KILOGRAM,
	volume: 0.87,
	volumeUnit: VolumeUnit.LITER,
	isFragile: false,
};

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
	vi.clearAllMocks();

	useContainerActionsMock.mockReturnValue({
		unpack: unpackMock,
		isUnpacking: false,
	});
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('PackedItemList', () => {
	it('renders empty state when no items are provided', () => {
		render(<PackedItemList items={[]} containerId="c1" bagName="Bag" />);

		expect(screen.getByText(/nothing packed yet/i)).toBeInTheDocument();
	});

	it('renders packed items when items are provided', () => {
		render(
			<PackedItemList items={[item]} containerId="c1" bagName="Bag" />
		);

		expect(screen.getByText('Camera')).toBeInTheDocument();
	});

	it('calls unpack and shows success notification when unpack succeeds', async () => {
		const user = setupUser();

		unpackMock.mockImplementation(async (_id, _body, { onSuccess }) => {
			onSuccess('Unpacked!');
		});

		render(
			<PackedItemList items={[item]} containerId="c1" bagName="Bag" />
		);

		await user.click(
			screen.getByRole('button', { name: /unpack camera/i })
		);

		await waitFor(() => {
			expect(unpackMock).toHaveBeenCalledWith(
				'c1',
				{ itemId: '1', quantity: 2 },
				expect.any(Object)
			);

			expect(notify.success).toHaveBeenCalledWith({
				message: 'Unpacked!',
			});
		});
	});

	it('calls error notification when unpack fails', async () => {
		const user = setupUser();
		const apiError = { message: 'Error' };

		unpackMock.mockImplementation(async (_id, _body, { onError }) => {
			onError(apiError);
		});

		render(
			<PackedItemList items={[item]} containerId="c1" bagName="Bag" />
		);

		await user.click(
			screen.getByRole('button', { name: /unpack camera/i })
		);

		await waitFor(() => {
			expect(notify.error.fromHttp).toHaveBeenCalledWith(apiError);
		});
	});

	it('opens move dialog when the user clicks move', async () => {
		const user = setupUser();

		render(
			<PackedItemList items={[item]} containerId="c1" bagName="Bag" />
		);

		await user.click(
			screen.getByRole('button', {
				name: /move camera/i,
			})
		);

		expect(screen.getByText(/move dialog/i)).toBeInTheDocument();
	});
});
