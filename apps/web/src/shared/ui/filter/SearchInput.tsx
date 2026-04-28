import { useEffect, useId, useState } from 'react';
import { Input } from '@shadcn-ui/input';
import { Label } from '@shadcn-ui/label';
import { Button } from '@shadcn-ui/button';
import { cn } from '@shadcn-lib';
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

	labelClassName?: string;

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

	/**
	 * When to commit the value to the parent.
	 *
	 * @remarks
	 * - `"change"` — debounced, fires on every keystroke (default, existing behavior)
	 * - `"submit"` — fires only on Enter key or blur
	 *
	 * Use `"submit"` inside filter panels with an Apply button
	 * so the query only fires when the user explicitly applies.
	 *
	 * @defaultValue "change"
	 */
	commitOn?: 'change' | 'submit';
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
	labelClassName,
	debounceMs = 400,
	isLoading = false,
	autoFocus = false,
	commitOn = 'change',
}: SearchInputProps) => {
	const id = useId();
	const [local, setLocal] = useState(value ?? '');

	// Sync when external value changes (e.g. filter reset)
	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setLocal(value ?? '');
	}, [value]);

	// Debounced propagation — only active in "change" mode
	useEffect(() => {
		if (commitOn !== 'change') return;

		const handler = setTimeout(() => {
			const trimmed = local.trim();
			onChange(trimmed === '' ? undefined : trimmed);
		}, debounceMs);

		return () => clearTimeout(handler);
	}, [local, debounceMs, onChange, commitOn]);

	// Commit helper — used in "submit" mode
	const commit = () => {
		const trimmed = local.trim();
		onChange(trimmed === '' ? undefined : trimmed);
	};

	const handleClear = () => {
		setLocal('');
		// In submit mode, clearing should immediately tell the parent
		if (commitOn === 'submit') {
			onChange(undefined);
		}
	};

	return (
		<div className="space-y-1">
			{/* Accessible label */}
			<Label
				htmlFor={id}
				className={cn(labelClassName, 'text-sm text-foreground')}
			>
				{label}
			</Label>

			<div className="relative group">
				{/* Leading search icon */}
				<HugeiconsIcon
					icon={SearchIcon}
					className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/60"
				/>

				<Input
					id={id}
					value={local}
					autoFocus={autoFocus}
					placeholder={placeholder}
					aria-invalid={!!error}
					aria-describedby={
						error
							? `${id}-error`
							: description
								? `${id}-description`
								: undefined
					}
					onChange={(e) => setLocal(e.target.value)}
					onBlur={commitOn === 'submit' ? commit : undefined}
					onKeyDown={(e) => {
						if (e.key === 'Escape') handleClear();
						if (e.key === 'Enter' && commitOn === 'submit')
							commit();
					}}
					className={cn(
						'pl-9 pr-9',
						error &&
							'border-destructive focus-visible:ring-destructive'
					)}
				/>

				{/* Right-side state */}
				{isLoading ? (
					<div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-foreground/40 border-t-transparent" />
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
								className="h-4 w-4 text-foreground/60 hover:text-foreground"
							/>
						</Button>
					)
				)}
			</div>

			{/* Description */}
			{description && !error && (
				<p
					id={`${id}-description`}
					className="text-xs text-foreground/70"
				>
					{description}
				</p>
			)}

			{/* Error */}
			{error && (
				<p id={`${id}-error`} className="text-xs text-destructive">
					{error}
				</p>
			)}
		</div>
	);
};

export default SearchInput;
