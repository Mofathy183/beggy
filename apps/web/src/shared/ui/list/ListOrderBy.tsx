import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from '@shadcn-ui/dropdown-menu';
import { Button } from '@shadcn-ui/button';
import { Badge } from '@shadcn-ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowUpDownIcon } from '@hugeicons/core-free-icons';
import type { UiOrderByOption } from '@shared/ui/mappers';
import type { OrderDirection } from '@beggy/shared/constants';

/**
 * Props for ListOrderBy.
 *
 * Semantic sort selector.
 * Users select pre-defined sorting strategies
 * like "Newest" or "Email A–Z".
 */
type ListOrderByProps<Field extends string> = {
	options: UiOrderByOption<Field>[];

	value: {
		orderBy: Field;
		direction: OrderDirection;
	} | null;

	onChange: (next: { orderBy: Field; direction: OrderDirection }) => void;
};

/**
 * ListOrderBy
 *
 * UX Design Decisions:
 * - Uses DropdownMenu instead of Select.
 * - Sorting is treated as an action, not a form field.
 * - Each option represents a complete sorting strategy.
 */
const ListOrderBy = <Field extends string>({
	options,
	value,
	onChange,
}: ListOrderByProps<Field>) => {
	if (!value || options.length === 0) return null;

	// Find currently selected option
	const selectedOption =
		options.find(
			(opt) =>
				opt.value.orderBy === value.orderBy &&
				opt.value.direction === value.direction
		) ?? options[0];

	const toKey = (v: { orderBy: Field; direction: OrderDirection }) =>
		`${v.orderBy}:${v.direction}`;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger>
				<Button
					variant="outline"
					size="sm"
					className="gap-2"
					aria-label="Change sorting order"
				>
					<HugeiconsIcon icon={ArrowUpDownIcon} className="h-4 w-4" />
					Sort
					{selectedOption && (
						<Badge
							variant="secondary"
							className="ml-1 text-xs font-normal"
						>
							{selectedOption.label}
						</Badge>
					)}
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="start">
				<DropdownMenuRadioGroup
					value={toKey(value)}
					onValueChange={(val) => {
						const next = options.find(
							(opt) => toKey(opt.value) === val
						);
						if (next) onChange(next.value);
					}}
				>
					{options.map((opt) => (
						<DropdownMenuRadioItem
							key={`${opt.value.orderBy}-${opt.value.direction}`}
							value={toKey(opt.value)}
							disabled={opt.disabled}
						>
							{opt.icon && <opt.icon className="mr-2 h-4 w-4" />}
							{opt.label}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default ListOrderBy;
