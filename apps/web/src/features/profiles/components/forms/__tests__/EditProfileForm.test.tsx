import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import EditProfileForm from '../EditProfileForm';
import { Gender } from '@beggy/shared/constants';

// ─────────────────────────────────────────────
// Shared Mocks
// ─────────────────────────────────────────────

const mockSubmit = vi.fn();
const mockReset = vi.fn();
const mockSyncProfile = vi.fn();

let capturedOnSuccess: any;
let mockIsLoading = false;
let mockError: any = null;

// Proper hook mock with option capture
vi.mock('@features/profiles/hooks', () => ({
	useEditProfile: (options: any) => {
		capturedOnSuccess = options?.onSuccess;

		return {
			submit: mockSubmit,
			isLoading: mockIsLoading,
			error: mockError,
			reset: mockReset,
		};
	},
	useProfileSyncWithAuth: () => ({
		syncProfile: mockSyncProfile,
	}),
}));

// Mock UI layer
vi.mock('../EditProfileFormUI', () => ({
	default: ({ onSubmit, serverError, serverSuggestion }: any) => (
		<div>
			<button onClick={() => onSubmit({ firstName: 'Jane' })}>
				submit
			</button>
			{serverError && <span>{serverError}</span>}
			{serverSuggestion && <span>{serverSuggestion}</span>}
		</div>
	),
}));

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe('EditProfileForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockIsLoading = false;
		mockError = null;
	});

	const defaultValues = {
		firstName: 'John',
		gender: Gender.MALE,
	};

	it('submits form values when submitted', async () => {
		render(<EditProfileForm defaultValues={defaultValues} />);

		await act(async () => {
			screen.getByText('submit').click();
		});

		expect(mockSubmit).toHaveBeenCalledWith({ firstName: 'Jane' });
	});

	it('syncs profile and calls onSuccess when update succeeds', async () => {
		const onSuccess = vi.fn();

		render(
			<EditProfileForm
				defaultValues={defaultValues}
				onSuccess={onSuccess}
			/>
		);

		// Simulate mutation success by manually calling captured callback
		await act(async () => {
			capturedOnSuccess?.({ id: '1' });
		});

		expect(mockSyncProfile).toHaveBeenCalledTimes(1);
		expect(onSuccess).toHaveBeenCalledTimes(1);
	});

	it('does not submit when loading', async () => {
		mockIsLoading = true;

		render(<EditProfileForm defaultValues={defaultValues} />);

		await act(async () => {
			screen.getByText('submit').click();
		});

		expect(mockSubmit).not.toHaveBeenCalled();
	});

	it('displays server error and suggestion', () => {
		mockError = {
			body: {
				message: 'Server error',
				suggestion: 'Try again',
			},
		};

		render(<EditProfileForm defaultValues={defaultValues} />);

		expect(screen.getByText('Server error')).toBeInTheDocument();
		expect(screen.getByText('Try again')).toBeInTheDocument();
	});
});
