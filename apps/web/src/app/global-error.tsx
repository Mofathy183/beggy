'use client';

/**
 * app/global-error.tsx
 *
 * Next.js App Router global error boundary.
 * Catches errors thrown inside the root layout.tsx itself —
 * something app/error.tsx cannot catch.
 *
 * CRITICAL: This component REPLACES the entire root layout when rendered.
 * It must render its own <html> and <body> tags.
 *
 * Because it replaces the root layout:
 * - Tailwind CSS and globals.css are NOT loaded automatically
 * - You must import globals.css explicitly here
 * - next-themes ThemeProvider is also gone — dark mode won't work here
 *
 * Design decision: keep this visually simple and functional.
 * It's a last-resort fallback — users should rarely see it.
 * The goal is to give them a way out (reload), not to be beautiful.
 *
 * When to expect this:
 * - Root layout throws during render (rare)
 * - A provider inside layout crashes
 * - Font loading or metadata generation fails catastrophically
 */

import { useEffect } from 'react';
import './globals.css';
import { ErrorState } from '@shared-ui/states';
import type { HttpClientError } from '@shared/types';

interface GlobalErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
	useEffect(() => {
		// TODO: replace with Sentry.captureException(error) in production
		console.error('[global-error]', error.message, error.digest);
	}, [error]);

	return (
		<html lang="en">
			<body>
				{/*
				 * Use custom copy here — this is a root-level crash,
				 * not a page-level one. We don't have statusCode from
				 * HttpClientError, so we give explicit, calm messaging.
				 */}
				<ErrorState
					error={error as unknown as HttpClientError}
					reset={reset}
					title="The app ran into a serious problem."
					description="Something broke at the root level. Your data is safe."
					suggestion="Try refreshing the page. If the problem keeps happening, clearing your browser cache usually helps."
					retryLabel="Reload page"
				/>
			</body>
		</html>
	);
}
