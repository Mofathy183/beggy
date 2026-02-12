import { useEffect, useState } from 'react';
import { Input } from '@shadcn-ui/input';
import { Label } from '@shadcn-ui/label';
import { Button } from '@shadcn-ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { CancelCircleIcon, SearchIcon } from '@hugeicons/core-free-icons';

/**
 * Props for the SearchFilter component.
 *
 * @remarks
 * - Designed for free-text search in list filters
 * - Debounced to avoid excessive queries
 * - Emits `undefined` when the input is empty
 */
type SearchFilterProps = {
	/**
	 * Visible label for the search field.
	 */
	label: string;

	/**
	 * Current search value.
	 *
	 * @remarks
	 * - `undefined` means no search applied
	 * - Controlled externally, mirrored locally for debouncing
	 */
	value?: string;

	/**
	 * Change handler.
	 *
	 * @remarks
	 * - Receives trimmed input
	 * - Emits `undefined` when cleared or whitespace-only
	 */
	onChange: (value?: string) => void;

	/**
	 * Input placeholder text.
	 *
	 * @defaultValue "Search…"
	 */
	placeholder?: string;

	/**
	 * Optional helper text shown below the input.
	 */
	description?: string;

	/**
	 * Optional validation error message.
	 *
	 * @remarks
	 * - Typically comes from query validation or backend errors
	 */
	error?: string;

	/**
	 * Debounce delay in milliseconds.
	 *
	 * @remarks
	 * - Prevents firing a request on every keystroke
	 * - Should align with perceived UI responsiveness
	 *
	 * @defaultValue 400
	 */
	debounceMs?: number;
};

/**
 * Free-text search filter component.
 *
 * @remarks
 * - Maintains local input state for debouncing
 * - Syncs external value changes (e.g. reset filters)
 * - Normalizes empty input to `undefined`
 *
 * @example
 * ```tsx
 * <SearchFilter
 *   label="Search users"
 *   value={filters.search}
 *   onChange={(val) => setFilters({ ...filters, search: val })}
 * />
 * ```
 */
const SearchFilter = ({
	label,
	value,
	onChange,
	placeholder = 'Search…',
	description,
	error,
	debounceMs = 400,
}: SearchFilterProps) => {
	/**
	 * Local input state.
	 *
	 * @remarks
	 * - Allows debounced updates
	 * - Keeps typing responsive
	 */
	const [local, setLocal] = useState(value ?? '');

	/**
	 * Sync local state when external value changes.
	 *
	 * @remarks
	 * - Handles filter resets
	 * - Keeps UI consistent with query state
	 */
	useEffect(() => {
		setLocal(value ?? '');
	}, [value]);

	/**
	 * Debounced propagation to parent.
	 *
	 * @remarks
	 * - Trims whitespace
	 * - Emits `undefined` for empty values
	 */
	useEffect(() => {
		const handler = setTimeout(() => {
			const trimmed = local.trim();
			onChange(trimmed === '' ? undefined : trimmed);
		}, debounceMs);

		return () => clearTimeout(handler);
	}, [local, debounceMs, onChange]);

	return (
		<div className="space-y-1">
			<Label className="text-sm">{label}</Label>

			<div className="relative">
				{/* Leading search icon */}
				<HugeiconsIcon
					icon={SearchIcon}
					className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
				/>

				<Input
					value={local}
					placeholder={placeholder}
					onChange={(e) => setLocal(e.target.value)}
					className="pl-9 pr-9"
				/>

				{/* Clear input action */}
				{local && (
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => setLocal('')}
						className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
					>
						<HugeiconsIcon
							icon={CancelCircleIcon}
							className="h-4 w-4"
						/>
					</Button>
				)}
			</div>

			{/* Helper text */}
			{description && (
				<p className="text-xs text-muted-foreground">{description}</p>
			)}

			{/* Validation error */}
			{error && <p className="text-xs text-destructive">{error}</p>}
		</div>
	);
};

export default SearchFilter;
