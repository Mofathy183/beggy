import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { setupUser } from '@tests';

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
		it('renders form fields with default values', () => {
			render(<EditProfileForm defaultValues={defaultValues} />);

			expect(screen.getByDisplayValue('John')).toBeInTheDocument();
			expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
		});
	});

	describe('form submission', () => {
		it('submits profile update when form is submitted', async () => {
			const user = setupUser();

			render(<EditProfileForm defaultValues={defaultValues} />);

			await user.click(
				screen.getByRole('button', { name: /save changes/i })
			);

			await waitFor(() => {
				expect(submitMock).toHaveBeenCalled();
			});
		});

		it('does not submit when mutation is loading', async () => {
			const user = setupUser();

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
		it('syncs profile and shows success notification when update succeeds', async () => {
			const user = setupUser();

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

		it('calls onSuccess callback when profile update succeeds', async () => {
			const user = setupUser();
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
		it('clears server error when user edits a field', async () => {
			const user = setupUser();

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
