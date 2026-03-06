'use client';

import { ListOrderBy } from '@shared-ui/list';
import { createBaseSortOptions, ITEM_SORT_OPTIONS } from '@shared-ui/mappers';
import { ItemOrderByField, OrderDirection } from '@beggy/shared/constants';
import type { ItemOrderByInput } from '@beggy/shared/types';

// ─── Options ───────────────────────────────────────────────────────────────────

/**
 * Merge base sort options (createdAt, updatedAt) with
 * item-specific sort options (name, weight, volume).
 *
 * `createBaseSortOptions` maps the generic field names to
 * the correct `ItemOrderByField` enum values.
 */
const baseOptions = createBaseSortOptions<ItemOrderByField>({
	createdAt: ItemOrderByField.CREATED_AT,
	updatedAt: ItemOrderByField.UPDATED_AT,
});

const options = [...baseOptions, ...ITEM_SORT_OPTIONS];

// ─── Types ─────────────────────────────────────────────────────────────────────

type ItemsOrderByProps = {
	/** Current ordering state */
	value: ItemOrderByInput;
	/** Called when the user changes field or direction */
	onChange: (next: ItemOrderByInput) => void;
};

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * Order-by control for the Items list.
 *
 * @remarks
 * - Thin wrapper around the shared `ListOrderBy` primitive.
 * - Options are composed from shared base options + item-specific fields.
 * - Falls back to the first option if no value is provided.
 */
const ItemsOrderBy = ({ value, onChange }: ItemsOrderByProps) => {
	return (
		<ListOrderBy
			value={
				(value as {
					orderBy: ItemOrderByField;
					direction: OrderDirection;
				}) ?? options[0]?.value
			}
			options={options}
			onChange={onChange}
		/>
	);
};

export default ItemsOrderBy;
