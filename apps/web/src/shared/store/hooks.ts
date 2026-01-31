import { useDispatch, useSelector, useStore } from 'react-redux';
import type { AppDispatch, AppStore, RootState } from './store';

/**
 * Typed version of `useDispatch`.
 *
 * Use this instead of `useDispatch` directly so:
 * - `dispatch` knows about all Redux actions
 * - async thunks are correctly typed
 *
 * This avoids repeating generics across the app and
 * keeps dispatch usage consistent and type-safe.
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

/**
 * Typed version of `useSelector`.
 *
 * Provides full type inference for the Redux state tree
 * (`RootState`) when selecting data inside components.
 *
 * Example:
 * ```ts
 * const user = useAppSelector(state => state.auth.user);
 * ```
 */
export const useAppSelector = useSelector.withTypes<RootState>();

/**
 * Typed access to the Redux store instance.
 *
 * This is rarely needed in application code, but is useful for:
 * - advanced integrations
 * - debugging
 * - test utilities
 *
 * Prefer `useAppDispatch` and `useAppSelector` in most cases.
 */
export const useAppStore = useStore.withTypes<AppStore>();
