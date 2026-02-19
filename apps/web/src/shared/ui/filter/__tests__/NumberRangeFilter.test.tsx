import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// ---- Mock hook BEFORE component import ----
vi.mock('../useNumberRangeFilter', () => ({
	default: vi.fn(),
}));

// ---- Mock UI primitives (minimal behavior) ----
vi.mock('@shadcn-ui/slider', () => ({
	Slider: (props: any) => (
		<div
			data-testid="slider"
			onClick={() => props.onValueChange?.([5, 15])}
		/>
	),
}));

vi.mock('@shadcn-ui/input', () => ({
	Input: (props: any) => <input data-testid={props.placeholder} {...props} />,
}));

vi.mock('@shadcn-ui/label', () => ({
	Label: (props: any) => <label>{props.children}</label>,
}));

vi.mock('@shadcn-ui/badge', () => ({
	Badge: (props: any) => <span>{props.children}</span>,
}));

vi.mock('@shadcn-ui/dropdown-menu', () => ({
	DropdownMenu: ({ children }: any) => <div>{children}</div>,
	DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
	DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
	DropdownMenuItem: ({ children, onClick }: any) => (
		<button onClick={onClick}>{children}</button>
	),
}));

vi.mock('@shadcn-ui/button', () => ({
	Button: ({ children }: any) => <button>{children}</button>,
}));

vi.mock('@hugeicons/react', () => ({
	HugeiconsIcon: () => <span data-testid="icon" />,
}));

// ---- Imports after mocks ----
import useNumberRangeFilter from '../useNumberRangeFilter';
import NumberRangeFilter from '../NumberRangeFilter';

describe('NumberRangeFilter', () => {
	const handleMinOnChange = vi.fn();
	const handleMaxOnChange = vi.fn();
	const handleSliderOnValueChange = vi.fn();
	const setUnit = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		(useNumberRangeFilter as any).mockReturnValue({
			min: 1,
			max: 10,
			unit: 'kg',

			config: { gte: 0, lte: 100 },
			unitMetaList: [
				{ value: 'kg', label: 'Kilogram', symbol: 'kg' },
				{ value: 'lb', label: 'Pound', symbol: 'lb' },
			],

			hasUnit: true,
			selectedUnitMeta: { value: 'kg', label: 'Kilogram', symbol: 'kg' },
			isInteger: true,
			step: 1,
			safeMin: 1,
			safeMax: 10,

			setUnit,
			handleMinOnChange,
			handleMaxOnChange,
			handleSliderOnValueChange,
		});
	});

	it('returns label when provided', () => {
		render(
			<NumberRangeFilter
				label="Weight"
				entity="item"
				metric="weight"
				onChange={vi.fn()}
			/>
		);

		expect(screen.getByText('Weight')).toBeInTheDocument();
	});

	it('returns description when provided', () => {
		render(
			<NumberRangeFilter
				label="Weight"
				description="Select range"
				entity="item"
				metric="weight"
				onChange={vi.fn()}
			/>
		);

		expect(screen.getByText('Select range')).toBeInTheDocument();
	});

	it('returns error message when provided', () => {
		render(
			<NumberRangeFilter
				label="Weight"
				error="Invalid range"
				entity="item"
				metric="weight"
				onChange={vi.fn()}
			/>
		);

		expect(screen.getByText('Invalid range')).toBeInTheDocument();
	});

	it('calls handleMinOnChange when Min input changes', () => {
		render(
			<NumberRangeFilter
				label="Weight"
				entity="item"
				metric="weight"
				onChange={vi.fn()}
			/>
		);

		fireEvent.change(screen.getByTestId('Min'), {
			target: { value: '5' },
		});

		expect(handleMinOnChange).toHaveBeenCalled();
	});

	it('calls handleMaxOnChange when Max input changes', () => {
		render(
			<NumberRangeFilter
				label="Weight"
				entity="item"
				metric="weight"
				onChange={vi.fn()}
			/>
		);

		fireEvent.change(screen.getByTestId('Max'), {
			target: { value: '20' },
		});

		expect(handleMaxOnChange).toHaveBeenCalled();
	});

	it('calls handleSliderOnValueChange when slider is changed', () => {
		render(
			<NumberRangeFilter
				label="Weight"
				entity="item"
				metric="weight"
				onChange={vi.fn()}
			/>
		);

		fireEvent.click(screen.getByTestId('slider'));

		expect(handleSliderOnValueChange).toHaveBeenCalledWith([5, 15]);
	});

	it('returns unit badge when hasUnit is true', () => {
		render(
			<NumberRangeFilter
				label="Weight"
				entity="item"
				metric="weight"
				onChange={vi.fn()}
			/>
		);

		expect(screen.getAllByText('kg').length).toBeGreaterThan(0);
	});

	it('calls setUnit with selected value when unit option is clicked', () => {
		render(
			<NumberRangeFilter
				label="Weight"
				entity="item"
				metric="weight"
				onChange={vi.fn()}
			/>
		);

		fireEvent.click(screen.getByText('Pound'));

		expect(setUnit).toHaveBeenCalledWith('lb');
	});
});
