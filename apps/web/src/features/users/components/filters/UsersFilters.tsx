import ListFilters from '@shared/ui/list/ListFilters';
import { SearchInput, ToggleFilter, DateRangeFilter } from '@shared/ui/filter';
import type { UserFilterInput } from '@beggy/shared/types';

/**
 * Props for `UsersFilters`.
 */
export type UsersFiltersProps = {
	/** Current filter state. */
	value: UserFilterInput;

	/** Triggered when filters are applied. */
	onApply: (filters: UserFilterInput) => void;

	/** Resets all filters to their initial state. */
	onReset: () => void;

	/** Triggered on any filter value change. */
	onChange: (filters: UserFilterInput) => void;
};

/**
 * Users domain filter component.
 *
 * Composes shared filter primitives into a feature-specific
 * filter panel for user listing.
 *
 * This component is controlled and delegates submission
 * and reset behavior to the parent.
 */
const UsersFilters = ({
	value,
	onApply,
	onReset,
	onChange,
}: UsersFiltersProps) => {
	return (
		<ListFilters<UserFilterInput>
			value={value}
			onApply={onApply}
			onReset={onReset}
		>
			<SearchInput
				label="Search by email"
				value={value?.email ?? ''}
				onChange={(v) => onChange({ ...value, email: v })}
			/>

			<ToggleFilter
				label="Active status"
				value={value.isActive}
				onChange={(v) => onChange({ ...value, isActive: v })}
			/>

			<DateRangeFilter
				label="Created between"
				value={
					value.createdAt
						? {
								from: value.createdAt.from ?? undefined,
								to: value.createdAt.to ?? undefined,
							}
						: undefined
				}
				onChange={(v) =>
					onChange({
						...value,
						createdAt: v
							? {
									from: v.from ?? undefined,
									to: v.to ?? undefined,
								}
							: undefined,
					})
				}
			/>
		</ListFilters>
	);
};

export default UsersFilters;
