import { Input } from '@shadcn-ui/input';
import { Label } from '@shadcn-ui/label';

type DateRangeValue = {
	from?: Date;
	to?: Date;
};

type DateRangeFilterProps = {
	label: string;
	value?: DateRangeValue;
	onChange: (value?: DateRangeValue) => void;
	description?: string;
	error?: string;
};

const toInputValue = (date?: Date) =>
	date ? date.toISOString().slice(0, 10) : '';

const DateRangeFilter = ({
	label,
	value,
	onChange,
	description,
	error,
}: DateRangeFilterProps) => {
	const from = value?.from;
	const to = value?.to;

	const update = (next: DateRangeValue) => {
		if (!next.from && !next.to) {
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
					type="date"
					value={toInputValue(from)}
					onChange={(e) =>
						update({
							from: e.target.value
								? new Date(e.target.value)
								: undefined,
							to,
						})
					}
				/>

				<Input
					type="date"
					value={toInputValue(to)}
					onChange={(e) =>
						update({
							from,
							to: e.target.value
								? new Date(e.target.value)
								: undefined,
						})
					}
				/>
			</div>

			{description && (
				<p className="text-xs text-muted-foreground">{description}</p>
			)}

			{error && <p className="text-xs text-destructive">{error}</p>}
		</div>
	);
};

export default DateRangeFilter;
