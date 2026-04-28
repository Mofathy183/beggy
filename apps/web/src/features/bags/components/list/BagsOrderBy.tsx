'use client';

import { ListOrderBy } from '@shared-ui/list';
import { createBaseSortOptions, BAG_SORT_OPTIONS } from '@shared-ui/mappers';
import { BagOrderByField, type OrderDirection } from '@beggy/shared/constants';
import type { BagOrderByInput } from '@beggy/shared/types';

// ─── Options ───────────────────────────────────────────────────────────────────

/**
 * Merge base sort options (Newest, Oldest, Recently updated) with
 * bag-specific sort options.
 */
const baseOptions = createBaseSortOptions<BagOrderByField>({
	createdAt: BagOrderByField.CREATED_AT,
	updatedAt: BagOrderByField.UPDATED_AT,
});

const options = [...baseOptions, ...BAG_SORT_OPTIONS];

// ─── Types ─────────────────────────────────────────────────────────────────────

type BagsOrderByProps = {
	/** Current ordering state */
	value: BagOrderByInput;
	/** Called when the user changes field or direction */
	onChange: (next: BagOrderByInput) => void;
};

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * BagsOrderBy
 *
 * @description
 * Order-by control for the Bags list.
 *
 * @remarks
 * - Thin wrapper around the shared `ListOrderBy` primitive.
 * - Options compose base date options + bag-specific fields.
 * - Falls back to the first option if no value is provided.
 */
const BagsOrderBy = ({ value, onChange }: BagsOrderByProps) => {
	return (
		<ListOrderBy
			value={
				(value as {
					orderBy: BagOrderByField;
					direction: OrderDirection;
				}) ?? options[0]?.value
			}
			options={options}
			onChange={onChange}
		/>
	);
};

export default BagsOrderBy;
