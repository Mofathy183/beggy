'use client';

import { useMemo, useRef } from 'react';
import {
	buildContainerMetrics,
	buildContainerState,
} from '@beggy/shared/containers';
import type { ContainerItem, ContainerStatusDTO } from '@beggy/shared/types';

// ─── Inputs ───────────────────────────────────────────────────────────────────

export interface UseContainerStatusParams {
	/**
	 * Items currently inside the container.
	 *
	 * Pass `[]` for a new bag form with no items yet — the hook will
	 * compute an EMPTY status correctly.
	 *
	 * @remarks
	 * The hook stabilizes the items reference internally using a JSON
	 * fingerprint so that a new array literal on every render does not
	 * cause unnecessary recomputation. The caller does NOT need to
	 * memoize the array — passing `bag.bagItems` directly is safe.
	 */
	items: ContainerItem[];

	/**
	 * Maximum allowed total weight in kilograms.
	 *
	 * Matches `BagDTO.maxWeight`. On a form, wire to the `maxWeight`
	 * field value via `useWatch`.
	 */
	maxWeight: number;

	/**
	 * Maximum allowed volume in liters.
	 *
	 * Matches `BagDTO.maxCapacity`. On a form, wire to the `maxCapacity`
	 * field value via `useWatch`.
	 */
	maxCapacity: number;

	/**
	 * Empty container weight in kilograms — the bag's own weight without contents.
	 *
	 * Matches `BagDTO.emptyWeight`. Passed to `buildContainerMetrics` as
	 * `containerWeight` so total weight includes the bag shell.
	 *
	 * @defaultValue 0
	 */
	containerWeight?: number;

	/**
	 * Gates computation. When false, returns null immediately without calling
	 * any calculation functions.
	 *
	 * Use to defer computation until required fields have valid values:
	 * @example
	 * enabled: maxWeight > 0 && maxCapacity > 0
	 *
	 * @defaultValue true
	 */
	enabled?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Produces a stable string fingerprint for a ContainerItem array.
 *
 * @description
 * Why this exists:
 * `useMemo` uses referential equality for its dependency array. If the caller
 * passes a new array literal (`bag.bagItems` re-fetched or `[]` in JSX) on
 * every render, the dependency would change on every render and the memo would
 * recompute every frame — defeating its purpose.
 *
 * Fingerprinting converts the semantically relevant fields to a string so that
 * two arrays with the same items produce the same key, regardless of reference.
 * The fingerprint itself is cheap: items arrays are small (< 100 items typical)
 * and the fields are scalars.
 *
 * Note: JSON.stringify is intentionally used here over a custom hash because
 * correctness > micro-optimization for this domain size.
 */
function fingerprintItems(items: ContainerItem[]): string {
	return JSON.stringify(
		items.map((i) => ({
			q: i.quantity,
			w: i.item.weight,
			wu: i.item.weightUnit,
			v: i.item.volume,
			vu: i.item.volumeUnit,
		}))
	);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useContainerStatus
 *
 * @description
 * Computes a full `ContainerStatusDTO` client-side using the exact same
 * pure functions (`buildContainerMetrics`, `buildContainerState`) that the
 * backend uses. The result shape is identical to `BagDTO.status`, so
 * `ContainerStatusPanel` works the same whether data came from the API
 * or from this hook.
 *
 * ## When to use
 *
 * **Form live preview** — wire to `useWatch` on the bag form. The panel
 * updates on every field change with zero network round-trips:
 * ```tsx
 * const { watch } = useFormContext<CreateBagSchema>();
 * const [maxWeight, maxCapacity, emptyWeight] = watch([
 *   'maxWeight', 'maxCapacity', 'emptyWeight'
 * ]);
 *
 * const liveStatus = useContainerStatus({
 *   items: [],
 *   maxWeight,
 *   maxCapacity,
 *   containerWeight: emptyWeight ?? 0,
 *   enabled: maxWeight > 0 && maxCapacity > 0,
 * });
 *
 * <ContainerStatusPanel
 *   status={liveStatus}
 *   maxWeight={maxWeight}
 *   maxCapacity={maxCapacity}
 * />
 * ```
 *
 * **Optimistic UI** — after a mutation fires, compute locally while the
 * refetch is in flight, then replace with API data when it resolves.
 *
 * **Detail page (alternative to API status)** — if the API does not return
 * a pre-computed `status` on BagDTO, compute it client-side from the items
 * and the bag constraints instead.
 *
 * ## Performance
 * Uses `useMemo` with a JSON fingerprint for the items array so that
 * object reference changes (new array on re-render) do not cause unnecessary
 * recomputation. Primitive inputs (`maxWeight`, `maxCapacity`, etc.) are
 * compared by value as normal.
 *
 * @returns `ContainerStatusDTO` when enabled and limits are valid, `null` otherwise.
 */
const useContainerStatus = ({
	items,
	maxWeight,
	maxCapacity,
	containerWeight = 0,
	enabled = true,
}: UseContainerStatusParams): ContainerStatusDTO | null => {
	// Stable fingerprint of the items array — prevents referential churn
	// in the useMemo dep array when the caller passes a new literal each render
	const itemsFingerprint = fingerprintItems(items);

	// Keep a stable ref to the items array itself so we can pass the real
	// array (not the fingerprint string) into the calculation functions
	const itemsRef = useRef<ContainerItem[]>(items);
	itemsRef.current = items;

	return useMemo<ContainerStatusDTO | null>(() => {
		// Gate: skip computation when disabled or when limits are missing/zero
		if (!enabled || maxWeight <= 0 || maxCapacity <= 0) return null;

		// Use the ref value so we always have the latest items without
		// making the array reference itself a dependency
		const metrics = buildContainerMetrics({
			items: itemsRef.current,
			containerWeight,
			maxWeight,
			maxCapacity,
		});

		const state = buildContainerState(metrics, { maxWeight, maxCapacity });

		return { metrics, state };
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		// Primitives compared by value — correct
		maxWeight,
		maxCapacity,
		containerWeight,
		enabled,
		// String fingerprint compared by value — stable across reference changes
		itemsFingerprint,
	]);
};

export default useContainerStatus;
