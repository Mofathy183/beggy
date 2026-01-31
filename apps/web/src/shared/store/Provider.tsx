'use client';

import { useState } from 'react';
import { Provider } from 'react-redux';
import { type AppStore, makeStore } from './store';

/**
 * AppProvider
 *
 * Wraps the application with a Redux store instance.
 *
 * Why `useState` instead of a singleton or `useRef`:
 * - Ensures the store is created exactly once per client instance
 * - Avoids shared mutable state across requests
 * - Fully compatible with Next.js App Router and React Server Components
 * - Satisfies strict React + ESLint rules
 *
 * This provider should be mounted at the root layout level.
 */
export default function AppProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	/**
	 * Lazily create the Redux store on first render.
	 * The initializer function runs only once.
	 */
	const [store] = useState<AppStore>(() => makeStore());

	return <Provider store={store}>{children}</Provider>;
}
