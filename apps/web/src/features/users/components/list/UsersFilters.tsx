import { ListFilters } from '@shared/ui/list';
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
			{/* Search — fixed width, label + input column */}
			<div className="w-52">
				<SearchInput
					label="Search by email"
					value={value?.email ?? ''}
					onChange={(v) => onChange({ ...value, email: v })}
				/>
			</div>

			{/*
			 * Active status — ToggleFilter's own layout is label left +
			 * pill group right. We don't touch it, just contain it.
			 * `w-auto` lets it be exactly as wide as its content needs.
			 */}
			<div className="w-auto">
				<ToggleFilter
					label="Active status"
					showIcons={true}
					value={value.isActive}
					onChange={(v) => onChange({ ...value, isActive: v })}
				/>
			</div>

			{/* Date range — fixed width, label + popover column */}
			<div className="w-48">
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
			</div>
		</ListFilters>
	);
};

export default UsersFilters;
