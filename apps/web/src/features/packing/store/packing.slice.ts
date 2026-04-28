'use client';

import {
	createSlice,
	type PayloadAction,
	type Reducer,
} from '@reduxjs/toolkit';
import type { ContainerType } from '@beggy/shared/constants';

// ─── State ────────────────────────────────────────────────────────────────────

/**
 * Packing context set when a user navigates from a bag/suitcase
 * detail page to the packing workspace.
 *
 * @remarks
 * This slice solves the "how does the packing page know the container
 * name and limits?" problem without URL params or a second API call.
 *
 * The detail page (BagDetailsPage / SuitcaseDetailsPage) dispatches
 * `setPackingContext` before navigating to /packing/[containerId].
 * The packing page reads from this slice directly.
 *
 * Reset on unmount via `clearPackingContext` to avoid stale state
 * if the user navigates between containers.
 */
export interface PackingContext {
	/** Container ID that maps to /packing/[containerId] */
	containerId: string;
	/** Bag or suitcase display name shown in the packing page header */
	containerName: string;
	/** BAG or SUITCASE — used for the back-link and icon */
	containerType: ContainerType;
	/** The bag or suitcase own ID — used for the back-link */
	sourceId: string;
	/** Max weight from BagDTO / SuitcaseDTO — passed to ContainerStatusPanel */
	maxWeight: number;
	/** Max capacity from BagDTO / SuitcaseDTO — passed to ContainerStatusPanel */
	maxCapacity: number;
	/** Weight unit — defaults to kg */
	weightUnit: string;
	/** Capacity unit — defaults to L */
	capacityUnit: string;
}

/**
 * Packing slice state.
 *
 * @remarks
 * `context` is intentionally nullable to reflect absence outside
 * of the packing flow lifecycle.
 */
export interface PackingState {
	context: PackingContext | null;
}

const initialState: PackingState = {
	context: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const packingSlice = createSlice({
	name: 'packing',
	initialState,
	reducers: {
		/**
		 * Stores packing context prior to navigation.
		 *
		 * @remarks
		 * Must be dispatched before entering the packing route,
		 * otherwise the page may render without required metadata.
		 */
		setPackingContext: (state, action: PayloadAction<PackingContext>) => {
			state.context = action.payload;
		},

		/**
		 * Clears the active packing context.
		 *
		 * @remarks
		 * Should be triggered on packing page unmount to avoid
		 * leaking state between different containers.
		 */
		clearPackingContext: (state) => {
			state.context = null;
		},
	},
});

export const { setPackingContext, clearPackingContext } = packingSlice.actions;
export const packingReducer: Reducer<PackingState> = packingSlice.reducer;
