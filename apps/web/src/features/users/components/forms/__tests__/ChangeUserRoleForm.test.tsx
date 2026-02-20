import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChangeUserRoleForm from '../ChangeRoleForm';
import { Role } from '@beggy/shared/constants';

// ---- Mock useUserMutations ----
const mockChangeRole = vi.fn();

let mockIsLoading = false;

vi.mock('@features/users/hooks', () => ({
	useUserMutations: () => ({
		changeRole: mockChangeRole,
		states: {
			changeRole: {
				isLoading: mockIsLoading,
			},
		},
	}),
}));

describe('ChangeUserRoleForm', () => {
	const userId = 'user-123';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('calls changeRole on successful submit', async () => {
		mockChangeRole.mockReturnValue({
			unwrap: () => Promise.resolve(),
		});

		render(<ChangeUserRoleForm userId={userId} currentRole={Role.USER} />);

		const selectTrigger = screen.getByRole('combobox');
		await userEvent.click(selectTrigger);

		const adminOption = await screen.findByText('ADMIN');
		await userEvent.click(adminOption);

		const submitButton = screen.getByRole('button', {
			name: /update role/i,
		});

		await userEvent.click(submitButton);

		await waitFor(() => {
			expect(mockChangeRole).toHaveBeenCalledWith(userId, {
				role: 'ADMIN',
			});
		});
	});

	it('shows server error when mutation fails', async () => {
		mockChangeRole.mockReturnValue({
			unwrap: () =>
				Promise.reject({
					data: { message: 'Role update failed.' },
				}),
		});

		render(<ChangeUserRoleForm userId={userId} currentRole={Role.USER} />);

		const submitButton = screen.getByRole('button', {
			name: /update role/i,
		});

		await userEvent.click(submitButton);

		expect(
			await screen.findByText(/failed to update role/i)
		).toBeInTheDocument();
	});

	it('disables submit button when loading', () => {
		mockIsLoading = true;

		render(<ChangeUserRoleForm userId={userId} currentRole={Role.USER} />);

		const submitButton = screen.getByRole('button', {
			name: /updating.../i,
		});

		expect(submitButton).toBeDisabled();
	});
});
