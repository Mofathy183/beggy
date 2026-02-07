import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@shadcn-ui/select';
import { Card } from '@shadcn-ui/card';
import { Button } from '@shadcn-ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowUpDownIcon } from '@hugeicons/core-free-icons';
import { OrderDirection } from '@beggy/shared/constants';
import { Chips } from '@shared/ui/chips';

type OrderByOption<Field extends string> = {
	value: Field;
	label: string;
};

type ListOrderByProps<Field extends string> = {
	/**
	 * Allowed order-by fields (derived from enums).
	 */
	options: OrderByOption<Field>[];

	/**
	 * Current order-by state.
	 */
	value: {
		orderBy: Field;
		direction: OrderDirection;
	} | null;

	/**
	 * Called when order changes.
	 */
	onChange: (next: { orderBy: Field; direction: OrderDirection }) => void;

	variant?: 'select' | 'chips';
};

const ListOrderBy = <Field extends string>({
	options,
	value,
	onChange,
	variant = 'select',
}: ListOrderByProps<Field>) => {
	if (!value) return null;

	const currentField = value?.orderBy ?? options[0]?.value;
	const currentDirection = value?.direction ?? OrderDirection.ASC;

	return (
		<Card className="flex items-center gap-2 p-3">
			{variant === 'chips' ? (
				<Chips
					mode="single"
					options={options}
					value={currentField ?? null}
					onChange={(field) =>
						field &&
						onChange({
							orderBy: field as Field,
							direction: currentDirection,
						})
					}
				/>
			) : (
				<Select
					value={currentField}
					onValueChange={(field) =>
						onChange({
							orderBy: field as Field,
							direction: currentDirection,
						})
					}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Order by" />
					</SelectTrigger>

					<SelectContent>
						{options.map((opt) => (
							<SelectItem key={opt.value} value={opt.value}>
								{opt.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			)}

			<Button
				variant="outline"
				size="icon"
				onClick={() =>
					onChange({
						orderBy: currentField as Field,
						direction:
							currentDirection === OrderDirection.ASC
								? OrderDirection.DESC
								: OrderDirection.ASC,
					})
				}
				title="Toggle sort direction"
			>
				<HugeiconsIcon icon={ArrowUpDownIcon} className="h-4 w-4" />
			</Button>
		</Card>
	);
};

export default ListOrderBy;
