/**
 * app/not-found.tsx
 *
 * Next.js App Router not-found boundary.
 * Rendered when:
 * - notFound() is called inside a Server Component
 * - A URL matches no route in the app
 *
 * This is a Server Component (no 'use client') — keep it a thin shell.
 * All UI and interactivity lives in NotFoundState.
 *
 * Note: hideBack={true} because at the app root, there is no guaranteed
 * browser history. The user may have landed here directly from a link.
 */

import { NotFoundState } from '@shared-ui/states';

export default function NotFoundPage() {
	return <NotFoundState hideBack />;
}
