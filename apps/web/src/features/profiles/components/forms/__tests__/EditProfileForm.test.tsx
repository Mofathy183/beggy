import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import EditProfileForm from '../EditProfileForm';

import { notify } from '@shared/utils';

// ─── Mocks ───────────────────────────────────────────────────────────

const submitMock = vi.fn();
const resetMutationMock = vi.fn();

const useEditProfileMock = vi.fn();
const syncProfileMock = vi.fn();

vi.mock('@features/profiles/hooks', () => ({
	useEditProfile: (options: any) => useEditProfileMock(options),
	useProfileSyncWithAuth: () => ({
		syncProfile: syncProfileMock,
	}),
}));

vi.mock('@shared/utils', () => ({
	notify: {
		success: vi.fn(),
	},
}));

// ─── Helpers ─────────────────────────────────────────────────────────

const defaultValues = {
	firstName: 'John',
	lastName: 'Doe',
};

// ─── Setup ───────────────────────────────────────────────────────────

beforeEach(() => {
	vi.clearAllMocks();

	useEditProfileMock.mockReturnValue({
		submit: submitMock,
		isLoading: false,
		error: null,
		reset: resetMutationMock,
	});
});

// ─── Tests ───────────────────────────────────────────────────────────

describe('EditProfileForm', () => {
	describe('rendering', () => {
		it('should render the edit profile form with default values', () => {
			render(<EditProfileForm defaultValues={defaultValues} />);

			expect(screen.getByDisplayValue('John')).toBeInTheDocument();
			expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
		});
	});

	describe('form submission', () => {
		it('should call submit when the form is submitted', async () => {
			const user = userEvent.setup();

			render(<EditProfileForm defaultValues={defaultValues} />);

			await user.click(
				screen.getByRole('button', { name: /save changes/i })
			);

			await waitFor(() => {
				expect(submitMock).toHaveBeenCalled();
			});
		});

		it('should not submit if the mutation is loading', async () => {
			const user = userEvent.setup();

			useEditProfileMock.mockReturnValue({
				submit: submitMock,
				isLoading: true,
				error: null,
				reset: resetMutationMock,
			});

			render(<EditProfileForm defaultValues={defaultValues} />);

			await user.click(screen.getByRole('button', { name: /saving/i }));

			expect(submitMock).not.toHaveBeenCalled();
		});
	});

	describe('success flow', () => {
		it('should sync the profile and notify the user on success', async () => {
			const user = userEvent.setup();

			useEditProfileMock.mockImplementation((options) => ({
				submit: async () => {
					options?.onSuccess?.(
						{ firstName: 'John' } as any,
						'Profile updated'
					);
				},
				isLoading: false,
				error: null,
				reset: resetMutationMock,
			}));

			render(<EditProfileForm defaultValues={{}} />);

			await user.type(screen.getByLabelText(/first name/i), 'John');

			await user.click(
				screen.getByRole('button', { name: /save changes/i })
			);

			await waitFor(() => {
				expect(syncProfileMock).toHaveBeenCalled();
				expect(notify.success).toHaveBeenCalledWith({
					message: 'Profile updated',
				});
			});
		});

		it('should call onSuccess prop after a successful update', async () => {
			const user = userEvent.setup();
			const onSuccess = vi.fn();

			useEditProfileMock.mockImplementation((options) => ({
				submit: async () => {
					options?.onSuccess?.(
						{ firstName: 'John' } as any,
						'Profile updated'
					);
				},
				isLoading: false,
				error: null,
				reset: resetMutationMock,
			}));

			render(
				<EditProfileForm defaultValues={{}} onSuccess={onSuccess} />
			);

			await user.type(screen.getByLabelText(/first name/i), 'John');

			await user.click(
				screen.getByRole('button', { name: /save changes/i })
			);

			await waitFor(() => {
				expect(onSuccess).toHaveBeenCalledWith(
					expect.objectContaining({
						firstName: 'John',
					}),
					'Profile updated'
				);
			});
		});
	});

	describe('server error handling', () => {
		it('should reset the mutation error when the user edits a field', async () => {
			const user = userEvent.setup();

			useEditProfileMock.mockReturnValue({
				submit: submitMock,
				isLoading: false,
				error: {
					body: {
						message: 'Conflict',
						suggestion: 'Try another name',
					},
				},
				reset: resetMutationMock,
			});

			render(<EditProfileForm defaultValues={defaultValues} />);

			const input = screen.getByPlaceholderText('John');

			await user.clear(input);
			await user.type(input, 'Jane');

			await waitFor(() => {
				expect(resetMutationMock).toHaveBeenCalled();
			});
		});
	});
});
