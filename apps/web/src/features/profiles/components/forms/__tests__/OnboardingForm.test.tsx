import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import OnboardingForm from '../OnboardingForm';

// ─────────────────────────────────────────────
// Shared Mocks
// ─────────────────────────────────────────────

const mockSubmit = vi.fn();
const mockReset = vi.fn();

let mockIsLoading = false;
let mockError: any = null;
let capturedRedirectTo: string | undefined;

// Mock useOnboarding properly
vi.mock('@features/profiles/hooks', () => ({
	useOnboarding: (options: any) => {
		capturedRedirectTo = options?.redirectTo;

		return {
			submit: mockSubmit,
			isLoading: mockIsLoading,
			error: mockError,
			reset: mockReset,
		};
	},
}));

// Mock UI layer (container-only testing)
vi.mock('../OnboardingFormUI', () => ({
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

describe('OnboardingForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockIsLoading = false;
		mockError = null;
		capturedRedirectTo = undefined;
	});

	it('uses provided redirectTo option', () => {
		render(<OnboardingForm redirectTo="/custom" />);

		expect(capturedRedirectTo).toBe('/custom');
	});

	it('submits form values when submitted', async () => {
		render(<OnboardingForm />);

		await act(async () => {
			screen.getByText('submit').click();
		});

		expect(mockSubmit).toHaveBeenCalledWith({ firstName: 'Jane' });
	});

	it('does not submit when loading', async () => {
		mockIsLoading = true;

		render(<OnboardingForm />);

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

		render(<OnboardingForm />);

		expect(screen.getByText('Server error')).toBeInTheDocument();
		expect(screen.getByText('Try again')).toBeInTheDocument();
	});
});
