import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import OnboardingForm from '../OnboardingForm';
import { useOnboarding } from '@features/profiles/hooks';
import { notify } from '@shared/utils';
import type { HttpClientError } from '@shared/types';

vi.mock('@features/profiles/hooks');
vi.mock('@shared/utils', () => ({
	notify: {
		success: vi.fn(),
		warning: vi.fn(),
	},
}));

const submitMock = vi.fn();
const skipMock = vi.fn();
const resetMock = vi.fn();

const useOnboardingMock = vi.mocked(useOnboarding);
const mockedNotify = vi.mocked(notify);

describe('OnboardingForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();

		useOnboardingMock.mockReturnValue({
			submit: submitMock,
			skip: skipMock,
			isLoading: false,
			isSkipping: false,
			error: null,
			reset: resetMock,
		});
	});

	it('renders onboarding form fields', () => {
		render(<OnboardingForm />);

		expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
	});

	it('submits the form when the user clicks submit', async () => {
		const user = userEvent.setup();

		render(<OnboardingForm />);

		await user.type(screen.getByLabelText(/first name/i), 'John');
		await user.type(screen.getByLabelText(/last name/i), 'Doe');

		await user.click(screen.getByRole('button', { name: /let's go/i }));

		await waitFor(() => {
			expect(submitMock).toHaveBeenCalled();
		});
	});

	it('shows success notification when onboarding succeeds', async () => {
		const user = userEvent.setup();

		submitMock.mockImplementation(async (_, { onSuccess }) => {
			onSuccess?.('Profile completed');
		});

		render(<OnboardingForm />);

		await user.click(screen.getByRole('button', { name: /let's go/i }));

		await waitFor(() => {
			expect(mockedNotify.success).toHaveBeenCalledWith({
				message: 'Profile completed',
				duration: 5000,
			});
		});
	});

	it('calls skip when the user clicks skip', async () => {
		const user = userEvent.setup();

		render(<OnboardingForm />);

		await user.click(
			screen.getByRole('button', { name: /i'll do this later/i })
		);

		expect(skipMock).toHaveBeenCalled();
	});

	it('shows warning notification when skip fails', async () => {
		const user = userEvent.setup();

		skipMock.mockImplementation(async ({ onError }) => {
			onError?.({
				body: {
					message: 'Skip failed',
					suggestion: 'Try again later',
				},
			});
		});

		render(<OnboardingForm />);

		await user.click(
			screen.getByRole('button', { name: /i'll do this later/i })
		);

		await waitFor(() => {
			expect(mockedNotify.warning).toHaveBeenCalledWith({
				message: 'Skip failed',
				description: 'Try again later',
				duration: 5000,
			});
		});
	});

	it('renders server error returned from the API', () => {
		useOnboardingMock.mockReturnValue({
			submit: submitMock,
			skip: skipMock,
			isLoading: false,
			isSkipping: false,
			error: {
				body: {
					message: 'Server error',
					suggestion: 'Try again later',
				},
			} as HttpClientError,
			reset: resetMock,
		});

		render(<OnboardingForm />);

		expect(screen.getByText(/server error/i)).toBeInTheDocument();
	});

	it('clears server error when the user edits the form', async () => {
		const user = userEvent.setup();

		useOnboardingMock.mockReturnValue({
			submit: submitMock,
			skip: skipMock,
			isLoading: false,
			isSkipping: false,
			error: {
				body: {
					message: 'Server error',
				},
			} as HttpClientError,
			reset: resetMock,
		});

		render(<OnboardingForm />);

		await user.type(screen.getByLabelText(/first name/i), 'A');

		await waitFor(() => {
			expect(resetMock).toHaveBeenCalled();
		});
	});
});
