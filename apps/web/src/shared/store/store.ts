import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from '@shared/api';
import { abilityReducer } from '@shared/store/ability';

/**
 * Factory function that creates a new Redux store instance.
 *
 * Using a factory (instead of a global singleton) is required
 * for Next.js App Router to avoid cross-request state leakage
 * and to support streaming / concurrent rendering safely.
 */
export const makeStore = () => {
	return configureStore({
		reducer: {
			[apiSlice.reducerPath]: apiSlice.reducer,
			// Add feature reducers here
			ability: abilityReducer,
		},
		// middleware, devTools, and enhancers can be configured here
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware().concat(apiSlice.middleware),
	});
};

/**
 * Type of the Redux store instance.
 *
 * Derived from the `makeStore` factory to ensure it always
 * stays in sync with the actual store configuration.
 */
export type AppStore = ReturnType<typeof makeStore>;

/**
 * RootState
 *
 * Represents the full Redux state tree.
 * Used for typing selectors and `useAppSelector`.
 */
export type RootState = ReturnType<AppStore['getState']>;

/**
 * AppDispatch
 *
 * Type of the store's `dispatch` function.
 * Used for typing `useAppDispatch` and async thunks.
 */
export type AppDispatch = AppStore['dispatch'];
