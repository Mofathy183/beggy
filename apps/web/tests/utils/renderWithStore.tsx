import { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { render, type RenderResult } from '@testing-library/react';
import { PropsWithChildren } from 'react';
import { renderHook, type RenderHookResult } from '@testing-library/react';

import abilityReducer from '@shared/store/ability/ability.slice';
import type { RootState } from '@shared/store';

export const mockApiReducer = (state = {}) => state;

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
		},
		preloadedState,
	});

	return {
		store,
		...render(<Provider store={store}>{ui}</Provider>),
	};
}

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
			ability: abilityReducer,
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
