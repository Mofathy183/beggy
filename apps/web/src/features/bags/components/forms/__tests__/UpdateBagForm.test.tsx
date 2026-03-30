import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import UpdateBagForm from '../UpdateBagForm';
import { notify } from '@shared/utils';
import type { BagDTO } from '@beggy/shared/types';
import { BagType, Size, Material, BagFeature } from '@beggy/shared';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const editMock = vi.fn();
const updateResetMock = vi.fn();
const useBagActionsMock = vi.fn();

vi.mock('@features/bags/hooks', () => ({
	useBagActions: () => useBagActionsMock(),
}));

vi.mock('@hookform/resolvers/zod', () => ({
	zodResolver: () => async (values: unknown) => ({ values, errors: {} }),
}));

vi.mock('@shared/utils', () => ({
	notify: {
		success: vi.fn(),
		error: Object.assign(vi.fn(), {
			fromHttp: vi.fn(),
		}),
	},
}));

const mockedNotify = vi.mocked(notify);

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockBag: BagDTO = {
	id: 'bag-1',
	name: 'Trail Pack',
	type: BagType.BACKPACK,
	size: Size.MEDIUM,
	maxWeight: 15,
	maxCapacity: 30,
	emptyWeight: 1.2,
	color: 'olive',
	material: Material.NYLON,
	features: [BagFeature.WATERPROOF],
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
};

const apiError = {
	body: {
		message: 'Bag name already taken',
		suggestion: 'Choose a unique name.',
	},
};

const defaultHookState = () => ({
	edit: editMock,
	isUpdating: false,
	states: {
		create: { error: null, reset: vi.fn() },
		update: { error: null, reset: updateResetMock },
	},
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('UpdateBagForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useBagActionsMock.mockReturnValue(defaultHookState());
	});

	// ── Pre-filled values ──────────────────────────────────────────────────────

	it('pre-fills the name field from the bag prop', () => {
		render(<UpdateBagForm bag={mockBag} />);
		expect(screen.getByLabelText(/bag name/i)).toHaveValue('Trail Pack');
	});

	it('pre-fills the color field from the bag prop', () => {
		render(<UpdateBagForm bag={mockBag} />);
		expect(screen.getByLabelText(/color/i)).toHaveValue('olive');
	});

	it('pre-selects the bag type chip from the bag prop', () => {
		render(<UpdateBagForm bag={mockBag} />);
		expect(
			screen.getByRole('button', { name: /^selected backpack/i })
		).toBeInTheDocument();
	});

	it('pre-selects the size chip from the bag prop', () => {
		render(<UpdateBagForm bag={mockBag} />);
		expect(
			screen.getByRole('button', { name: /^selected medium$/i })
		).toBeInTheDocument();
	});

	it('pre-selects feature chips from the bag prop', () => {
		render(<UpdateBagForm bag={mockBag} />);
		expect(
			screen.getByRole('button', { name: /^selected waterproof/i })
		).toBeInTheDocument();
	});

	// ── Rendering ──────────────────────────────────────────────────────────────

	it('renders Save changes button in idle state', () => {
		render(<UpdateBagForm bag={mockBag} />);
		expect(
			screen.getByRole('button', { name: /^save changes$/i })
		).toBeInTheDocument();
	});

	it('renders Cancel button', () => {
		render(<UpdateBagForm bag={mockBag} onCancel={vi.fn()} />);
		expect(
			screen.getByRole('button', { name: /^cancel$/i })
		).toBeInTheDocument();
	});

	// ── Loading state ──────────────────────────────────────────────────────────

	it('shows "Saving…" label while submitting', () => {
		useBagActionsMock.mockReturnValue({
			...defaultHookState(),
			isUpdating: true,
		});

		render(<UpdateBagForm bag={mockBag} />);
		expect(
			screen.getByRole('button', { name: /saving…/i })
		).toBeInTheDocument();
	});

	it('disables the submit button while saving', () => {
		useBagActionsMock.mockReturnValue({
			...defaultHookState(),
			isUpdating: true,
		});

		render(<UpdateBagForm bag={mockBag} />);
		expect(screen.getByRole('button', { name: /saving…/i })).toBeDisabled();
	});

	// ── Successful submission ──────────────────────────────────────────────────

	it('calls edit with the bag id and updated values on submission', async () => {
		const user = userEvent.setup();
		editMock.mockImplementation(async (_id, _values, { onSuccess }) => {
			onSuccess('Bag updated!');
		});

		render(<UpdateBagForm bag={mockBag} />);

		const nameInput = screen.getByLabelText(/bag name/i);
		await user.clear(nameInput);
		await user.type(nameInput, 'Updated Pack');
		await user.click(
			screen.getByRole('button', { name: /^save changes$/i })
		);

		await waitFor(() => {
			expect(editMock).toHaveBeenCalledWith(
				'bag-1',
				expect.objectContaining({ name: 'Updated Pack' }),
				expect.objectContaining({
					onSuccess: expect.any(Function),
					onError: expect.any(Function),
				})
			);
		});
	});

	it('shows success notification after a successful update', async () => {
		const user = userEvent.setup();
		editMock.mockImplementation(async (_id, _values, { onSuccess }) => {
			onSuccess('Bag updated!');
		});

		render(<UpdateBagForm bag={mockBag} />);
		await user.click(
			screen.getByRole('button', { name: /^save changes$/i })
		);

		await waitFor(() => {
			expect(mockedNotify.success).toHaveBeenCalledWith({
				message: 'Bag updated!',
			});
		});
	});

	it('calls onCancel after a successful update', async () => {
		const user = userEvent.setup();
		const onCancel = vi.fn();
		editMock.mockImplementation(async (_id, _values, { onSuccess }) => {
			onSuccess('Bag updated!');
		});

		render(<UpdateBagForm bag={mockBag} onCancel={onCancel} />);
		await user.click(
			screen.getByRole('button', { name: /^save changes$/i })
		);

		await waitFor(() => {
			expect(onCancel).toHaveBeenCalled();
		});
	});

	it('calls onSuccess after a successful update', async () => {
		const user = userEvent.setup();
		const onSuccess = vi.fn();
		editMock.mockImplementation(async (_id, _values, { onSuccess: cb }) => {
			cb('Bag updated!');
		});

		render(<UpdateBagForm bag={mockBag} onSuccess={onSuccess} />);
		await user.click(
			screen.getByRole('button', { name: /^save changes$/i })
		);

		await waitFor(() => {
			expect(onSuccess).toHaveBeenCalled();
		});
	});

	// ── Error handling ─────────────────────────────────────────────────────────

	it('shows error notification when update fails', async () => {
		const user = userEvent.setup();
		editMock.mockImplementation(async (_id, _values, { onError }) => {
			onError(apiError);
		});

		render(<UpdateBagForm bag={mockBag} />);
		await user.click(
			screen.getByRole('button', { name: /^save changes$/i })
		);

		await waitFor(() => {
			expect(mockedNotify.error.fromHttp).toHaveBeenCalledWith(apiError);
		});
	});

	it('renders server error banner when the hook exposes an error', () => {
		useBagActionsMock.mockReturnValue({
			...defaultHookState(),
			states: {
				create: { error: null, reset: vi.fn() },
				update: { error: apiError, reset: updateResetMock },
			},
		});

		render(<UpdateBagForm bag={mockBag} />);

		expect(screen.getByRole('alert')).toBeInTheDocument();
		expect(screen.getByText(apiError.body.message)).toBeInTheDocument();
	});

	it('renders the server error suggestion when provided', () => {
		useBagActionsMock.mockReturnValue({
			...defaultHookState(),
			states: {
				create: { error: null, reset: vi.fn() },
				update: { error: apiError, reset: updateResetMock },
			},
		});

		render(<UpdateBagForm bag={mockBag} />);
		expect(screen.getByText(apiError.body.suggestion)).toBeInTheDocument();
	});

	it('clears the server error when user edits a field', async () => {
		const user = userEvent.setup();
		useBagActionsMock.mockReturnValue({
			...defaultHookState(),
			states: {
				create: { error: null, reset: vi.fn() },
				update: { error: apiError, reset: updateResetMock },
			},
		});

		render(<UpdateBagForm bag={mockBag} />);
		await user.type(screen.getByLabelText(/bag name/i), '!');

		await waitFor(() => {
			expect(updateResetMock).toHaveBeenCalled();
		});
	});

	// ── Chips interaction ──────────────────────────────────────────────────────

	it('allows changing the bag type chip', async () => {
		const user = userEvent.setup();
		render(<UpdateBagForm bag={mockBag} />);

		// Deselect current type and select a new one
		await user.click(
			screen.getByRole('button', { name: /^selected backpack/i })
		);
		await user.click(
			screen.getByRole('button', { name: /not selected duffel/i })
		);

		expect(
			screen.getByRole('button', { name: /^selected duffel/i })
		).toBeInTheDocument();
	});

	it('allows toggling a feature chip', async () => {
		const user = userEvent.setup();
		render(<UpdateBagForm bag={mockBag} />);

		// Deselect pre-selected feature
		await user.click(
			screen.getByRole('button', { name: /^selected waterproof/i })
		);

		expect(
			screen.getByRole('button', { name: /not selected waterproof/i })
		).toBeInTheDocument();
	});

	// ── Cancel ─────────────────────────────────────────────────────────────────

	it('calls onCancel when the Cancel button is clicked', async () => {
		const user = userEvent.setup();
		const onCancel = vi.fn();

		render(<UpdateBagForm bag={mockBag} onCancel={onCancel} />);
		await user.click(screen.getByRole('button', { name: /^cancel$/i }));

		expect(onCancel).toHaveBeenCalled();
	});

	// ── Re-populate on bag prop change ─────────────────────────────────────────

	it('re-populates fields when the bag prop changes', async () => {
		const { rerender } = render(<UpdateBagForm bag={mockBag} />);

		const updatedBag: BagDTO = {
			...mockBag,
			name: 'New Trail Pack',
			color: 'black',
		};
		rerender(<UpdateBagForm bag={updatedBag} />);

		await waitFor(() => {
			expect(screen.getByLabelText(/bag name/i)).toHaveValue(
				'New Trail Pack'
			);
			expect(screen.getByLabelText(/color/i)).toHaveValue('black');
		});
	});
});
