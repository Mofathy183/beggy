import { ListFilters } from '@shared-ui/list';
import { SearchInput, ToggleFilter, DateRangeFilter } from '@shared/ui/filter';
import type { UserFilterState } from '@shared/types';
import { Separator } from '@shadcn-ui/separator';

/**
 * Props for `UsersFilters`.
 */
export type UsersFiltersProps = {
	/** Current filter state. */
	value: UserFilterState;

	/** Triggered when filters are applied. */
	onApply: (filters: UserFilterState) => void;

	/** Resets all filters to their initial state. */
	onReset: () => void;
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
const UsersFilters = ({ value, onApply, onReset }: UsersFiltersProps) => {
	return (
		<ListFilters<UserFilterState>
			value={value}
			onApply={onApply}
			onReset={onReset}
		>
			{(draft, setDraft) => (
				<div className="flex flex-col gap-5">
					{/* ── Search by email ──────────────────────────────────────── */}
					<SearchInput
						label="Search by email"
						placeholder="Search email…"
						value={draft.email ?? ''}
						commitOn="submit"
						onChange={(v) => setDraft({ ...draft, email: v })}
					/>

					<Separator />

					{/* ── Active status ────────────────────────────────────────── */}
					<ToggleFilter
						label="Active status"
						showIcons={true}
						value={draft.isActive}
						onChange={(v) => setDraft({ ...draft, isActive: v })}
					/>

					<Separator />

					{/* ── Created between ──────────────────────────────────────── */}
					<DateRangeFilter
						label="Created between"
						value={
							draft.createdAt
								? {
										from: draft.createdAt.from
											? new Date(draft.createdAt.from)
											: undefined,
										to: draft.createdAt.to
											? new Date(draft.createdAt.to)
											: undefined,
									}
								: undefined
						}
						onChange={(v) =>
							setDraft({
								...draft,
								createdAt: v
									? {
											// toISOString() gives "2026-04-03T22:00:00.000Z"
											// slice(0, 10) gives "2026-04-03" ← what your schema expects
											from: v.from
												? v.from
														.toISOString()
														.slice(0, 10)
												: undefined,
											to: v.to
												? v.to
														.toISOString()
														.slice(0, 10)
												: undefined,
										}
									: undefined,
							})
						}
					/>
				</div>
			)}
		</ListFilters>
	);
};

export default UsersFilters;
