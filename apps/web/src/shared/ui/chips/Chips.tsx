import Chip from './Chip';

type ChipOption<T = string> = {
	label: string;
	value: T;
	disabled?: boolean;
};

type ChipsMode = 'single' | 'multiple';

type ChipsProps<T> = {
	options: ChipOption<T>[];

	value: T | T[] | null;
	mode?: ChipsMode;

	onChange: (value: T | T[] | null) => void;

	disabled?: boolean;
};

const Chips = <T,>({
	options,
	value,
	mode = 'multiple',
	onChange,
	disabled,
}: ChipsProps<T>) => {
	const isSelected = (optionValue: T) => {
		if (mode === 'single') {
			return value === optionValue;
		}

		return Array.isArray(value) && value.includes(optionValue);
	};

	const toggle = (optionValue: T) => {
		if (disabled) return;

		if (mode === 'single') {
			onChange(value === optionValue ? null : optionValue);
			return;
		}

		const current = Array.isArray(value) ? value : [];

		onChange(
			current.includes(optionValue)
				? current.filter((v) => v !== optionValue)
				: [...current, optionValue]
		);
	};

	return (
		<div className="flex flex-wrap gap-2">
			{options.map((option) => (
				<Chip
					key={String(option.value)}
					label={option.label}
					selected={isSelected(option.value)}
					disabled={disabled || option.disabled}
					onClick={() => toggle(option.value)}
				/>
			))}
		</div>
	);
};

export default Chips;
