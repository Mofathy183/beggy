import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CreateItemForm from '../CreateItemForm';

import { notify } from '@shared/utils';

const createMock = vi.fn();
const resetMock = vi.fn();

const useItemsActionsMock = vi.fn();

vi.mock('@features/items/hooks', () => ({
	useItemsActions: () => useItemsActionsMock(),
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

const fillValidItemForm = async (user: ReturnType<typeof userEvent.setup>) => {
	await user.type(screen.getByLabelText(/item name/i), 'Passport');

	await user.click(screen.getByRole('button', { name: /document/i }));

	await user.type(screen.getByLabelText(/weight value/i), '0.1');

	await user.type(screen.getByLabelText(/volume value/i), '0.01');
};

describe('CreateItemForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();

		useItemsActionsMock.mockReturnValue({
			create: createMock,
			isCreating: false,
			states: {
				create: {
					error: null,
					reset: resetMock,
				},
			},
		});
	});

	it('renders the item creation fields', () => {
		render(<CreateItemForm />);

		expect(screen.getByLabelText(/item name/i)).toBeInTheDocument();

		expect(
			screen.getByRole('button', { name: /add item/i })
		).toBeInTheDocument();

		expect(
			screen.getByLabelText(/mark item as fragile/i)
		).toBeInTheDocument();
	});

	it('submits the form and calls create action', async () => {
		const user = userEvent.setup();

		render(<CreateItemForm />);

		await fillValidItemForm(user);

		await user.click(screen.getByRole('button', { name: /add item/i }));

		expect(createMock).toHaveBeenCalled();
	});

	it('shows success notification when creation succeeds', async () => {
		const user = userEvent.setup();

		createMock.mockImplementation(async (_, { onSuccess }) => {
			onSuccess('Item added successfully');
		});

		const onSuccess = vi.fn();
		const onCancel = vi.fn();

		render(<CreateItemForm onSuccess={onSuccess} onCancel={onCancel} />);

		await fillValidItemForm(user);

		await user.click(screen.getByRole('button', { name: /add item/i }));

		expect(mockedNotify.success).toHaveBeenCalled();
		expect(onCancel).toHaveBeenCalled();
		expect(onSuccess).toHaveBeenCalled();
	});

	it('shows error notification when creation fails', async () => {
		const user = userEvent.setup();

		const apiError = {
			body: {
				message: 'Item already exists',
			},
		};

		createMock.mockImplementation(async (_, { onError }) => {
			onError(apiError);
		});

		render(<CreateItemForm />);

		await fillValidItemForm(user);
		await user.click(screen.getByRole('button', { name: /add item/i }));

		expect(mockedNotify.error.fromHttp).toHaveBeenCalledWith(apiError);
	});

	it('clears server error when user edits a field', async () => {
		const user = userEvent.setup();

		useItemsActionsMock.mockReturnValue({
			create: createMock,
			isCreating: false,
			states: {
				create: {
					error: {
						body: {
							message: 'Server error',
						},
					},
					reset: resetMock,
				},
			},
		});

		render(<CreateItemForm />);

		await user.type(screen.getByLabelText(/item name/i), 'Camera');

		expect(resetMock).toHaveBeenCalled();
	});
});
