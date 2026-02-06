import { Card, CardContent } from '@shadcn-ui/card';
import { Button } from '@shadcn-ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { FilterIcon, RotateCcw } from '@hugeicons/core-free-icons';

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
	 * Filter form controls.
	 */
	children: React.ReactNode;
};

const ListFilters = <Filter,>({
	value,
	onApply,
	onReset,
	children,
}: ListFiltersProps<Filter>) => (
	<Card>
		<CardContent className="space-y-4 p-4">
			<div className="flex items-center gap-2 text-sm font-medium">
				<HugeiconsIcon
					icon={FilterIcon}
					className="h-4 w-4 text-muted-foreground"
				/>
				<span>Filters</span>
			</div>

			<div className="grid gap-4">{children}</div>

			<div className="flex justify-end gap-2 pt-2">
				<Button variant="ghost" size="sm" onClick={onReset}>
					<HugeiconsIcon icon={RotateCcw} className="mr-2 h-4 w-4" />
					Reset
				</Button>

				<Button size="sm" onClick={() => onApply(value)}>
					Apply
				</Button>
			</div>
		</CardContent>
	</Card>
);

export default ListFilters;
