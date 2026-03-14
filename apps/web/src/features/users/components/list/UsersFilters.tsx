import { ListFilters } from '@shared/ui/list';
import { SearchInput, ToggleFilter, DateRangeFilter } from '@shared/ui/filter';
import type { UserFilterInput } from '@beggy/shared/types';
import { Separator } from '@shadcn-ui/separator';

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
			<div className="flex flex-col gap-5">
				{/* ── Search ──────────────────────────────────────────────────────── */}
				<SearchInput
					label="Search by email"
					value={value?.email ?? ''}
					onChange={(v) => onChange({ ...value, email: v })}
				/>

				<Separator />

				{/* ── Toggle ──────────────────────────────────────────────────────── */}
				{/*
				 * Active status — ToggleFilter's own layout is label left +
				 * pill group right. We don't touch it, just contain it.
				 * `w-auto` lets it be exactly as wide as its content needs.
				 */}
				<ToggleFilter
					label="Active status"
					showIcons={true}
					value={value.isActive}
					onChange={(v) => onChange({ ...value, isActive: v })}
				/>

				<Separator />

				{/* ── Date Range ──────────────────────────────────────────────────────── */}
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
