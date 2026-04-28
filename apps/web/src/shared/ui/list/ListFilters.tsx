'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@shadcn-ui/card';
import { Button } from '@shadcn-ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { FilterIcon, RotateCcw } from '@hugeicons/core-free-icons';
import { cn } from '@shadcn-lib';

type ListFiltersProps<Filter> = {
	/**
	 * Current filter state.
	 */
	value: Filter;

	/**
	 * Called when filters are applied.
	 */
	onApply: (filters: Filter) => void;

	/**
	 * Called when filters are reset.
	 */
	onReset: () => void;

	/**
	 * Optional title shown in header.
	 * Defaults to "Filters".
	 */
	title?: string;

	/**
	 * Filter form controls.
	 */
	children: (
		draft: Filter,
		setDraft: (filters: Filter) => void
	) => React.ReactNode;

	/**
	 * Optional additional class names.
	 */
	className?: string;
};

const ListFilters = <Filter,>({
	value,
	onApply,
	onReset,
	title = 'Filters',
	children,
	className,
}: ListFiltersProps<Filter>) => {
	// Internal draft — completely isolated from the list's filter state
	const [draft, setDraft] = useState<Filter>(value);

	// Sync draft when parent resets (e.g. onReset clears parent state)
	useEffect(() => {
		setDraft(value);
	}, [value]);

	const handleApply = () => {
		onApply(draft);
	};

	const handleReset = () => {
		onReset(); // parent resets its state → triggers useEffect above → draft syncs
	};

	return (
		<Card className={cn(className)}>
			<CardContent className="space-y-4 p-4">
				<div className="flex items-center gap-2 text-sm font-medium">
					<HugeiconsIcon
						icon={FilterIcon}
						className="h-4 w-4 text-muted-foreground"
					/>
					<span>{title}</span>
				</div>

				<div className="grid gap-4">{children(draft, setDraft)}</div>

				<div className="flex justify-end gap-2 pt-2">
					<Button variant="ghost" size="sm" onClick={handleReset}>
						<HugeiconsIcon
							icon={RotateCcw}
							className="mr-2 h-4 w-4"
						/>
						Reset
					</Button>

					<Button size="sm" onClick={handleApply}>
						Apply
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};

export default ListFilters;
