import { Input } from '@shadcn-ui/input';
import { Label } from '@shadcn-ui/label';

type NumberRangeValue = {
	min?: number;
	max?: number;
};

type NumberRangeFilterProps = {
	label: string;
	value?: NumberRangeValue;
	onChange: (value?: NumberRangeValue) => void;

	unit?: string;
	step?: number;
	minLimit?: number;
	maxLimit?: number;

	description?: string;
	error?: string;
};

const NumberRangeFilter = ({
	label,
	value,
	onChange,
	unit,
	step = 1,
	minLimit,
	maxLimit,
	description,
	error,
}: NumberRangeFilterProps) => {
	const min = value?.min;
	const max = value?.max;

	const update = (next: NumberRangeValue) => {
		if (next.min == null && next.max == null) {
			onChange(undefined);
		} else {
			onChange(next);
		}
	};

	return (
		<div className="space-y-1">
			<Label className="text-sm">{label}</Label>

			<div className="grid grid-cols-2 gap-2">
				<Input
					type="number"
					placeholder="Min"
					value={min ?? ''}
					step={step}
					min={minLimit}
					max={maxLimit}
					onChange={(e) =>
						update({
							min:
								e.target.value === ''
									? undefined
									: Number(e.target.value),
							max,
						})
					}
				/>

				<Input
					type="number"
					placeholder="Max"
					value={max ?? ''}
					step={step}
					min={minLimit}
					max={maxLimit}
					onChange={(e) =>
						update({
							min,
							max:
								e.target.value === ''
									? undefined
									: Number(e.target.value),
						})
					}
				/>
			</div>

			{unit && (
				<p className="text-xs text-muted-foreground">Unit: {unit}</p>
			)}

			{description && (
				<p className="text-xs text-muted-foreground">{description}</p>
			)}

			{error && <p className="text-xs text-destructive">{error}</p>}
		</div>
	);
};

export default NumberRangeFilter;
