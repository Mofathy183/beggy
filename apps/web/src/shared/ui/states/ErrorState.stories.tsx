import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import ErrorState from './ErrorState';
import { ErrorCode } from '@beggy/shared/constants';
import type { HttpClientError } from '@shared/types';

/**
 * Builds a valid HttpClientError fixture that satisfies the isHttpClientError
 * runtime type guard — requires success: false, message, code, suggestion.
 *
 * Previously, story fixtures were missing `success: false` and `suggestion`,
 * causing isHttpClientError() to return false, so errorCode never rendered.
 */
const makeHttpError = (
	statusCode: number,
	overrides: {
		message: string;
		code: ErrorCode;
		suggestion: string;
	}
): HttpClientError => ({
	statusCode,
	body: {
		success: false,
		message: overrides.message,
		code: overrides.code,
		suggestion: overrides.suggestion,
		timestamp: new Date().toISOString(),
	},
});

const meta: Meta<typeof ErrorState> = {
	title: 'UI/States/ErrorState',
	component: ErrorState,
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component: `
**ErrorState** communicates application-level failure in a clear, structured, and accessible way.

---

### What it is
A full-page feedback component used when a route, API request, or critical action fails.

---

### When to use it
- Route-level failures (Next.js error boundaries)
- API request failures with meaningful HTTP status
- Unexpected runtime errors
- Permission-denied states
- Server unavailability

---

### When NOT to use it
- Inline form validation errors
- Field-level feedback
- Non-blocking warnings
- Toast notifications

---

### Interaction model
- Displays a clear failure title and description
- Optionally displays a helpful suggestion
- May expose a retry action (when reset is provided)
- May expose a navigation escape hatch ("Go home")

---

### Constraints
- Always vertically centered
- Max content width constrained for readability
- Status badge only appears when HTTP status exists
- Retry button only renders if reset callback exists

---

### Accessibility guarantees
- Uses \`role="alert"\`
- Title and description linked via aria-labelledby / aria-describedby
- Emoji marked with aria-label
- Decorative elements aria-hidden
- Fully keyboard navigable
- No color-only meaning

---

### Design System Notes
- Token-driven colors (destructive, muted, accent)
- Uses shadcn Alert and Button primitives
- Dark mode compatible
- Layout remains stable across themes
        `,
			},
		},
	},
	argTypes: {
		title: {
			description: 'Override the primary error title.',
			control: 'text',
			table: { type: { summary: 'string' } },
		},
		description: {
			description: 'Override the supporting description text.',
			control: 'text',
			table: { type: { summary: 'string' } },
		},
		suggestion: {
			description:
				'Override the contextual guidance shown in the accent alert block.',
			control: 'text',
			table: { type: { summary: 'string' } },
		},
		retryLabel: {
			description: 'Label for the retry action.',
			control: 'text',
			table: {
				type: { summary: 'string' },
				defaultValue: { summary: 'Try again' },
			},
		},
		showHomeButton: {
			description: 'Whether the secondary "Go home" action is visible.',
			control: 'boolean',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'true' },
			},
		},
		error: {
			description:
				'HttpClientError | Error | unknown — derives title, description, suggestion, errorCode, and status badge.',
			control: false,
			table: { type: { summary: 'HttpClientError | Error | unknown' } },
		},
		reset: {
			description:
				'Next.js error boundary reset callback. When provided, enables retry.',
			control: false,
			table: { type: { summary: '() => void' } },
		},
	},
};

export default meta;
type Story = StoryObj<typeof ErrorState>;

/**
 * Native JS Error from Next.js error boundary.
 * No statusCode — falls back to titleFromStatus(null).
 */
export const UnexpectedError: Story = {
	args: {
		error: new Error('Something went wrong'),
	},
	parameters: {
		docs: {
			description: {
				story: 'Fallback when no structured HTTP response is available — e.g. render crash.',
			},
		},
	},
};

/**
 * 404 — resource not found.
 * errorCode renders because the fixture satisfies isHttpClientError().
 */
export const NotFound404: Story = {
	args: {
		error: makeHttpError(404, {
			message:
				"That bag's not in your collection — maybe it was archived?",
			code: ErrorCode.BAG_NOT_FOUND,
			suggestion:
				'Check if it was archived or create a fresh bag for your next adventure.',
		}),
	},
	parameters: {
		docs: {
			description: {
				story: 'Structured API error — errorCode field visible because fixture is a valid HttpClientError.',
			},
		},
	},
};

/**
 * 401 — session expired.
 */
export const Unauthorized401: Story = {
	args: {
		error: makeHttpError(401, {
			message:
				"Hold up, traveler — you'll need to sign in before I can show your packing lists.",
			code: ErrorCode.TOKEN_EXPIRED,
			suggestion:
				"Log back in and we'll pick up exactly where we paused.",
		}),
	},
};

/**
 * 429 — rate limited.
 * No retry offered because the action should be delayed, not repeated.
 */
export const RateLimited429: Story = {
	args: {
		error: makeHttpError(429, {
			message: "Whoa there, speedy packer! Let's take a short breather.",
			code: ErrorCode.RATE_LIMITED,
			suggestion:
				"Take a quick breather — packing's smoother when you go at a steady pace.",
		}),
		showHomeButton: true,
	},
};

/**
 * 500 — server error with retry.
 * reset callback triggers re-render of the error boundary segment.
 */
export const ServerErrorWithRetry: Story = {
	render: (args) => {
		const [_attempts, setAttempts] = useState(0);
		return (
			<ErrorState
				{...args}
				reset={() => setAttempts((prev) => prev + 1)}
			/>
		);
	},
	args: {
		error: makeHttpError(500, {
			message:
				"Something unexpected happened on my end. Don't worry — your data's safe.",
			code: ErrorCode.INTERNAL_ERROR,
			suggestion:
				'Try again in a bit — these things happen, even on the smoothest journeys.',
		}),
	},
	parameters: {
		docs: {
			description: {
				story: 'Recoverable server error — retry re-renders the segment without page reload.',
			},
		},
	},
};

/**
 * Custom prop overrides — no HttpClientError needed.
 */
export const CustomCopy: Story = {
	args: {
		title: 'Payment failed.',
		description: 'We could not process your transaction.',
		suggestion: 'Verify your payment method and try again.',
		showHomeButton: false,
	},
	parameters: {
		docs: {
			description: {
				story: 'Prop overrides take priority over error-derived copy — useful for contextual flows.',
			},
		},
	},
};

export const DarkMode: Story = {
	args: {
		error: makeHttpError(503, {
			message: "We're having some trouble right now.",
			code: ErrorCode.SERVICE_UNAVAILABLE,
			suggestion:
				'Our team has been notified. Try refreshing in a few minutes.',
		}),
	},
	parameters: {
		themes: { default: 'dark' },
		docs: {
			description: {
				story: 'Validates destructive, muted, and accent tokens in dark mode.',
			},
		},
	},
};
