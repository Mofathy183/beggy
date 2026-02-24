'use client';

/**
 * app/(protected)/error.tsx
 *
 * Error boundary scoped to the (protected) route segment.
 *
 * Why have a segment-level error boundary in addition to app/error.tsx?
 *
 * Next.js error boundaries are hierarchical. Having one here means:
 * - Errors inside /users, /bags, /suitcases etc. are caught here
 * - The root layout (header, sidebar, nav) stays intact
 * - The user sees the error inside the dashboard shell, not a full blank page
 * - They can navigate elsewhere without a full page reload
 *
 * Without this file, any error in a protected page would bubble up to
 * app/error.tsx which would unmount the entire app layout.
 *
 * Copy note: description is more specific here — the user is inside
 * the dashboard so we know they're authenticated and working with data.
 */

import { useEffect } from 'react';
import { ErrorState } from '@shared-ui/states';
import type { HttpClientError } from '@shared/types';

interface ProtectedErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function ProtectedErrorPage({
	error,
	reset,
}: ProtectedErrorProps) {
	useEffect(() => {
		// TODO: replace with Sentry.captureException(error) in production
		console.error('[protected/error]', error.message, error.digest);
	}, [error]);

	return (
		<ErrorState
			error={error as unknown as HttpClientError}
			reset={reset}
			description="Something went wrong while loading this page. Your other bags and lists are unaffected."
		/>
	);
}
