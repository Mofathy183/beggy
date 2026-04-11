import { useAppSelector } from '@shared/store/hooks';
import type { PackingContext } from '@features/packing/store';

/**
 * Selects the active packing context from the store.
 *
 * @returns The current packing context, or `null` if not initialized.
 *
 * @remarks
 * - Returns `null` when the user lands directly on the packing route
 *   (e.g. page refresh or external navigation)
 * - Consumers must handle the null case (e.g. fallback fetch or redirect)
 */
const usePackingContext = (): PackingContext | null =>
	useAppSelector((state) => state.packing.context);

export default usePackingContext;
