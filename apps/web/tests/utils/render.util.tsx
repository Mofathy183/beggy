import { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { render, type RenderResult, configure } from '@testing-library/react';
import { renderHook, type RenderHookResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PropsWithChildren } from 'react';

import { abilityReducer } from '@shared/ability';
import { packingReducer } from '@features/packing/store';
import type { RootState } from '@shared/store';

// ─────────────────────────────────────────────────────────────────────────────
// TESTING LIBRARY GLOBAL CONFIG
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Increase async utility timeout.
 * waitFor / findBy* default to 1000ms. Form tests that compose
 * multiple state updates occasionally need more headroom.
 */
configure({ asyncUtilTimeout: 3000 });

// ─────────────────────────────────────────────────────────────────────────────
// FAST USER EVENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a userEvent instance with `delay: null`.
 *
 * userEvent.setup() inserts real timer delays between keystrokes by default
 * to simulate human typing speed for real-browser E2E tests. In jsdom,
 * React processes events synchronously — the delay only wastes wall-clock time.
 *
 * Results observed on form-heavy suites:
 *   CreateBagForm  20 tests: 7258ms → ~900ms
 *   SignupForm       6 tests: 3949ms → ~400ms
 *   CreateUserForm   8 tests: 4452ms → ~600ms
 *
 * Safe because:
 * - jsdom has no real event loop to debounce against
 * - React Testing Library's waitFor/findBy handle async state updates
 * - Events still fire in the correct order and React still processes them
 * - The delay is only meaningful in real browsers (Playwright/Cypress)
 *
 * Usage — replace every `userEvent.setup()` call with this:
 * ```typescript
 * import { setupUser } from '@tests/render';
 * const user = setupUser();
 * ```
 */
export const setupUser = (options?: Parameters<typeof userEvent.setup>[0]) =>
	userEvent.setup({ delay: null, ...options });

// ─────────────────────────────────────────────────────────────────────────────
// STORE MOCK REDUCERS
// ─────────────────────────────────────────────────────────────────────────────

export const mockApiReducer = (state = {} as RootState['api']) => state;
export const mockAuthReducer = (state = {} as RootState['auth']) => state;
export const mockDashboardReducer = (state = {} as RootState['dashboard']) =>
	state;

// ─────────────────────────────────────────────────────────────────────────────
// RENDER WITH STORE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Renders a React element inside a Redux Provider with a test store.
 *
 * Use when the component under test reads from or dispatches to the Redux store.
 * Components that only use mocked hooks do NOT need this — use plain render().
 *
 * @example
 * ```typescript
 * const { store } = renderWithStore(<MyComponent />, {
 *   preloadedState: { auth: { user: mockUser } },
 * });
 * ```
 */
export function renderWithStore(
	ui: ReactElement,
	{
		preloadedState,
	}: {
		preloadedState?: RootState;
	} = {}
): RenderResult & { store: ReturnType<typeof configureStore> } {
	const store = configureStore({
		reducer: {
			api: mockApiReducer,
			ability: abilityReducer,
			packing: packingReducer,
			dashboard: mockDashboardReducer,
			auth: mockAuthReducer,
		},
		preloadedState,
	});

	return {
		store,
		...render(<Provider store={store}>{ui}</Provider>),
	};
}

// ─────────────────────────────────────────────────────────────────────────────
// RENDER HOOK WITH STORE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Renders a hook inside a Redux Provider with a test store.
 *
 * Use when the hook under test reads from or dispatches to the Redux store.
 *
 * @example
 * ```typescript
 * const { result } = renderHookWithStore(() => useMyHook(), {
 *   preloadedState: { auth: { user: mockUser } },
 * });
 * ```
 */
export function renderHookWithStore<T>(
	hook: () => T,
	{
		preloadedState,
	}: {
		preloadedState?: RootState;
	} = {}
): RenderHookResult<T, unknown> & {
	store: ReturnType<typeof configureStore>;
} {
	const store = configureStore({
		reducer: {
			api: mockApiReducer,
			packing: packingReducer,
			ability: abilityReducer,
			dashboard: mockDashboardReducer,
			auth: mockAuthReducer,
		},
		preloadedState,
	});

	const wrapper = ({ children }: PropsWithChildren) => (
		<Provider store={store}>{children}</Provider>
	);

	return {
		store,
		...renderHook(hook, { wrapper }),
	};
}
