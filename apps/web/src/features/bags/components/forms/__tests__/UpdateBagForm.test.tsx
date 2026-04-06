import { render, screen, waitFor } from '@testing-library/react';
import { setupUser } from '@tests';
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

	// ──────────────────────────────────────────────────────────────────────────
	describe('form rendering', () => {
		it('returns Save changes button in idle state', () => {
			render(<UpdateBagForm bag={mockBag} />);
			expect(
				screen.getByRole('button', { name: /^save changes$/i })
			).toBeInTheDocument();
		});

		it('returns Cancel button', () => {
			render(<UpdateBagForm bag={mockBag} onCancel={vi.fn()} />);
			expect(
				screen.getByRole('button', { name: /^cancel$/i })
			).toBeInTheDocument();
		});
	});

	// ──────────────────────────────────────────────────────────────────────────
	describe('form initialization from bag data', () => {
		it('returns the name field pre-filled from the bag prop', () => {
			render(<UpdateBagForm bag={mockBag} />);
			expect(screen.getByLabelText(/bag name/i)).toHaveValue(
				'Trail Pack'
			);
		});

		it('returns the color field pre-filled from the bag prop', () => {
			render(<UpdateBagForm bag={mockBag} />);
			expect(screen.getByLabelText(/color/i)).toHaveValue('olive');
		});

		it('returns the bag type chip pre-selected from the bag prop', () => {
			render(<UpdateBagForm bag={mockBag} />);
			expect(
				screen.getByRole('button', { name: /^selected backpack/i })
			).toBeInTheDocument();
		});

		it('returns the size chip pre-selected from the bag prop', () => {
			render(<UpdateBagForm bag={mockBag} />);
			expect(
				screen.getByRole('button', { name: /^selected medium$/i })
			).toBeInTheDocument();
		});

		it('returns feature chips pre-selected from the bag prop', () => {
			render(<UpdateBagForm bag={mockBag} />);
			expect(
				screen.getByRole('button', { name: /^selected waterproof/i })
			).toBeInTheDocument();
		});
	});

	// ──────────────────────────────────────────────────────────────────────────
	describe('submit button loading state', () => {
		it('returns "Saving…" label while submitting', () => {
			useBagActionsMock.mockReturnValue({
				...defaultHookState(),
				isUpdating: true,
			});

			render(<UpdateBagForm bag={mockBag} />);
			expect(
				screen.getByRole('button', { name: /saving…/i })
			).toBeInTheDocument();
		});

		it('denies interaction by disabling the submit button while saving', () => {
			useBagActionsMock.mockReturnValue({
				...defaultHookState(),
				isUpdating: true,
			});

			render(<UpdateBagForm bag={mockBag} />);
			expect(
				screen.getByRole('button', { name: /saving…/i })
			).toBeDisabled();
		});
	});

	// ──────────────────────────────────────────────────────────────────────────
	describe('form submission', () => {
		it('calls edit with the bag id and updated values on submission', async () => {
			const user = setupUser();
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
	});

	// ──────────────────────────────────────────────────────────────────────────
	describe('successful update flow', () => {
		it('returns success notification after a successful update', async () => {
			const user = setupUser();
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
			const user = setupUser();
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
			const user = setupUser();
			const onSuccess = vi.fn();

			editMock.mockImplementation(
				async (_id, _values, { onSuccess: cb }) => {
					cb('Bag updated!');
				}
			);

			render(<UpdateBagForm bag={mockBag} onSuccess={onSuccess} />);
			await user.click(
				screen.getByRole('button', { name: /^save changes$/i })
			);

			await waitFor(() => {
				expect(onSuccess).toHaveBeenCalled();
			});
		});
	});

	// ──────────────────────────────────────────────────────────────────────────
	describe('API error handling', () => {
		it('returns error notification when update fails', async () => {
			const user = setupUser();

			editMock.mockImplementation(async (_id, _values, { onError }) => {
				onError(apiError);
			});

			render(<UpdateBagForm bag={mockBag} />);
			await user.click(
				screen.getByRole('button', { name: /^save changes$/i })
			);

			await waitFor(() => {
				expect(mockedNotify.error.fromHttp).toHaveBeenCalledWith(
					apiError
				);
			});
		});
	});

	// ──────────────────────────────────────────────────────────────────────────
	describe('server error UI state', () => {
		it('returns server error banner when the hook exposes an error', () => {
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

		it('returns the server error suggestion when provided', () => {
			useBagActionsMock.mockReturnValue({
				...defaultHookState(),
				states: {
					create: { error: null, reset: vi.fn() },
					update: { error: apiError, reset: updateResetMock },
				},
			});

			render(<UpdateBagForm bag={mockBag} />);
			expect(
				screen.getByText(apiError.body.suggestion)
			).toBeInTheDocument();
		});

		it('clears the server error when user edits a field', async () => {
			const user = setupUser();

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
	});

	// ──────────────────────────────────────────────────────────────────────────
	describe('chip selection', () => {
		it('allows changing the bag type chip', async () => {
			const user = setupUser();
			render(<UpdateBagForm bag={mockBag} />);

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
			const user = setupUser();
			render(<UpdateBagForm bag={mockBag} />);

			await user.click(
				screen.getByRole('button', { name: /^selected waterproof/i })
			);

			expect(
				screen.getByRole('button', { name: /not selected waterproof/i })
			).toBeInTheDocument();
		});
	});

	// ──────────────────────────────────────────────────────────────────────────
	describe('cancel action', () => {
		it('calls onCancel when the Cancel button is clicked', async () => {
			const user = setupUser();
			const onCancel = vi.fn();

			render(<UpdateBagForm bag={mockBag} onCancel={onCancel} />);
			await user.click(screen.getByRole('button', { name: /^cancel$/i }));

			expect(onCancel).toHaveBeenCalled();
		});
	});

	// ──────────────────────────────────────────────────────────────────────────
	describe('bag prop updates', () => {
		it('returns updated field values when the bag prop changes', async () => {
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
});
