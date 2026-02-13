import { useEffect, useState } from 'react';
import { Input } from '@shadcn-ui/input';
import { Label } from '@shadcn-ui/label';
import { Button } from '@shadcn-ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { CancelCircleIcon, SearchIcon } from '@hugeicons/core-free-icons';

/**
 * Props for the SearchInput component.
 *
 * @remarks
 * - Free-text search input
 * - Debounced to avoid excessive queries
 * - Emits `undefined` when empty
 */
export type SearchInputProps = {
	/**
	 * Visible label for accessibility and clarity.
	 */
	label: string;

	/**
	 * Controlled value.
	 *
	 * @remarks
	 * - `undefined` means no active search
	 */
	value?: string;

	/**
	 * Change handler.
	 *
	 * @remarks
	 * - Emits trimmed string
	 * - Emits `undefined` when empty
	 */
	onChange: (value?: string) => void;

	/**
	 * Placeholder text.
	 *
	 * @defaultValue "Search…"
	 */
	placeholder?: string;

	/**
	 * Optional helper text.
	 */
	description?: string;

	/**
	 * Optional validation error.
	 */
	error?: string;

	/**
	 * Debounce delay in ms.
	 *
	 * @defaultValue 400
	 */
	debounceMs?: number;

	/**
	 * Shows loading indicator (e.g. while fetching).
	 */
	isLoading?: boolean;

	/**
	 * Auto-focus the input on mount.
	 */
	autoFocus?: boolean;
};

/**
 * SearchInput
 *
 * @remarks
 * - Keeps local state for smooth typing
 * - Debounces parent updates
 * - Syncs external value changes
 * - Accessible clear action
 */
const SearchInput = ({
	label,
	value,
	onChange,
	placeholder = 'Search…',
	description,
	error,
	debounceMs = 400,
	isLoading = false,
	autoFocus = false,
}: SearchInputProps) => {
	const [local, setLocal] = useState(value ?? '');

	/**
	 * Sync when external value changes
	 * (e.g. filter reset)
	 */
	useEffect(() => {
		setLocal(value ?? '');
	}, [value]);

	/**
	 * Debounced change propagation
	 */
	useEffect(() => {
		const handler = setTimeout(() => {
			const trimmed = local.trim();
			onChange(trimmed === '' ? undefined : trimmed);
		}, debounceMs);

		return () => clearTimeout(handler);
	}, [local, debounceMs, onChange]);

	/**
	 * Clear handler
	 */
	const handleClear = () => {
		setLocal('');
	};

	return (
		<div className="space-y-1">
			<Label className="text-sm">{label}</Label>

			<div className="relative group">
				{/* Leading search icon */}
				<HugeiconsIcon
					icon={SearchIcon}
					className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
				/>

				<Input
					value={local}
					autoFocus={autoFocus}
					placeholder={placeholder}
					onChange={(e) => setLocal(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Escape') {
							handleClear();
						}
					}}
					className="pl-9 pr-9"
				/>

				{/* Right-side state (loading or clear) */}
				{isLoading ? (
					<div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
				) : (
					local && (
						<Button
							type="button"
							variant="ghost"
							size="icon"
							aria-label="Clear search"
							onClick={handleClear}
							className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full"
						>
							<HugeiconsIcon
								icon={CancelCircleIcon}
								className="h-4 w-4"
							/>
						</Button>
					)
				)}
			</div>

			{/* Helper text */}
			{description && (
				<p className="text-xs text-muted-foreground">{description}</p>
			)}

			{/* Error */}
			{error && <p className="text-xs text-destructive">{error}</p>}
		</div>
	);
};

export default SearchInput;
