import Chip from './Chip';

type ChipsMode = 'single' | 'multiple';

type ChipOption<T = string> = {
	label: string;
	value: T;
	mode?: ChipsMode;
	disabled?: boolean;
};

type BaseProps<T> = {
	options: ChipOption<T>[];
	disabled?: boolean;
};

type MultipleChipsProps<T> = BaseProps<T> & {
	mode?: 'multiple';
	value: T[];
	maxSelected?: number;
	onChange: (value: T[]) => void;
};

type SingleChipsProps<T> = BaseProps<T> & {
	mode: 'single';
	value: T | null;
	onChange: (value: T | null) => void;
};

type ChipsProps<T> = MultipleChipsProps<T> | SingleChipsProps<T>;

const DEFAULT_MAX = 5;

const Chips = <T,>(props: ChipsProps<T>) => {
	const { options, disabled } = props;

	const max =
		props.mode === 'multiple'
			? (props.maxSelected ?? DEFAULT_MAX)
			: undefined;

	const isSelected = (optionValue: T) => {
		if (props.mode === 'single') {
			return props.value === optionValue;
		}
		return props.value.includes(optionValue);
	};

	const toggle = (optionValue: T) => {
		if (disabled) return;

		if (props.mode === 'single') {
			props.onChange(props.value === optionValue ? null : optionValue);
			return;
		}

		const current = props.value;
		const isAlreadySelected = current.includes(optionValue);

		if (!isAlreadySelected && max && current.length >= max) {
			return;
		}

		props.onChange(
			isAlreadySelected
				? current.filter((v) => v !== optionValue)
				: [...current, optionValue]
		);
	};

	const isAtMax =
		props.mode === 'multiple' &&
		max !== undefined &&
		props.value.length >= max;

	return (
		<div className="flex flex-wrap gap-2">
			{options.map((option) => (
				<Chip
					key={String(option.value)}
					label={option.label}
					selected={isSelected(option.value)}
					disabled={
						disabled ||
						option.disabled ||
						(props.mode === 'multiple' &&
							isAtMax &&
							!isSelected(option.value))
					}
					onClick={() => toggle(option.value)}
				/>
			))}

			{props.mode === 'multiple' && max && (
				<p className="text-xs text-muted-foreground">
					Select up to {max}
				</p>
			)}
		</div>
	);
};

export default Chips;
