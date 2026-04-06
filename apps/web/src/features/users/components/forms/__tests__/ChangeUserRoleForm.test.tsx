import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { setupUser } from '@tests';

import ChangeRoleForm from '../ChangeRoleForm';

import { Role } from '@beggy/shared/constants';
import { notify } from '@shared/utils';

const changeRoleMock = vi.fn();

const resetMutationMock = vi.fn();

const statesMock = {
	changeRole: {
		isLoading: false,
		error: null,
		reset: resetMutationMock,
	},
};

vi.mock('@features/users/hooks', () => ({
	useUserMutations: () => ({
		changeRole: changeRoleMock,
		states: statesMock,
	}),
}));

vi.mock('@shared/utils', () => ({
	notify: {
		success: vi.fn(),
		error: {
			fromHttp: vi.fn(),
		},
	},
}));

describe('ChangeRoleForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();

		statesMock.changeRole.isLoading = false;
		statesMock.changeRole.error = null;
	});

	describe('rendering', () => {
		it('renders form with the current role', () => {
			render(<ChangeRoleForm userId="user-1" currentRole={Role.USER} />);

			expect(screen.getByText(/change user role/i)).toBeInTheDocument();
			expect(screen.getByText(/update role/i)).toBeInTheDocument();
		});
	});

	describe('form submission', () => {
		it('updates user role when form is submitted', async () => {
			const user = setupUser();

			changeRoleMock.mockReturnValue({
				unwrap: vi.fn().mockResolvedValue({
					message: 'Role updated',
				}),
			});

			render(<ChangeRoleForm userId="user-1" currentRole={Role.USER} />);

			await user.click(
				screen.getByRole('button', { name: /update role/i })
			);

			await waitFor(() => {
				expect(changeRoleMock).toHaveBeenCalledWith(
					'user-1',
					expect.objectContaining({
						role: Role.USER,
					})
				);
			});
		});

		it('does not submit when role update is loading', async () => {
			const user = setupUser();

			statesMock.changeRole.isLoading = true;

			render(<ChangeRoleForm userId="user-1" currentRole={Role.USER} />);

			await user.click(screen.getByRole('button', { name: /updating/i }));

			expect(changeRoleMock).not.toHaveBeenCalled();
		});
	});

	describe('success flow', () => {
		it('shows success notification when role update succeeds', async () => {
			const user = setupUser();

			changeRoleMock.mockReturnValue({
				unwrap: vi.fn().mockResolvedValue({
					message: 'Role updated',
				}),
			});

			render(<ChangeRoleForm userId="user-1" currentRole={Role.USER} />);

			await user.click(
				screen.getByRole('button', { name: /update role/i })
			);

			await waitFor(() => {
				expect(notify.success).toHaveBeenCalledWith({
					message: 'Role updated',
				});
			});
		});
	});

	describe('error handling', () => {
		it('shows error notification when role update fails', async () => {
			const user = setupUser();

			const httpError = {
				body: {
					message: 'Conflict',
				},
			};

			changeRoleMock.mockReturnValue({
				unwrap: vi.fn().mockRejectedValue(httpError),
			});

			render(<ChangeRoleForm userId="user-1" currentRole={Role.USER} />);

			await user.click(
				screen.getByRole('button', { name: /update role/i })
			);

			await waitFor(() => {
				expect(notify.error.fromHttp).toHaveBeenCalledWith(httpError);
			});
		});

		it('clears server error when user changes the role', async () => {
			const user = setupUser();

			(statesMock.changeRole as any).error = {
				body: {
					message: 'Conflict',
					suggestion: 'Try another role',
				},
			};

			render(<ChangeRoleForm userId="user-1" currentRole={Role.USER} />);

			await user.click(screen.getByRole('combobox'));
			const dropdown = await screen.findByRole('listbox');
			await user.click(
				within(dropdown).getByText(/admin/i).closest('[role="option"]')!
			);

			await waitFor(() => {
				expect(resetMutationMock).toHaveBeenCalled();
			});
		});
	});

	describe('cancel behavior', () => {
		it('calls onCancel when cancel button is clicked', async () => {
			const user = setupUser();

			const onCancel = vi.fn();

			render(
				<ChangeRoleForm
					userId="user-1"
					currentRole={Role.USER}
					onCancel={onCancel}
				/>
			);

			await user.click(screen.getByRole('button', { name: /cancel/i }));

			expect(onCancel).toHaveBeenCalled();
		});
	});
});
