import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import NumberRangeFilter from '../NumberRangeFilter';

vi.mock('@beggy/shared/constants/constraints', () => ({
	NUMBER_CONFIG: {
		testEntity: {
			testMetric: {
				gte: 0,
				lte: 100,
				decimals: 2,
			},
		},
	},
}));

vi.mock('@shadcn-ui/slider', () => ({
	Slider: ({ onValueChange }: any) => (
		<button data-testid="slider" onClick={() => onValueChange([10, 20])}>
			slider
		</button>
	),
}));

const setup = (
	props?: Partial<React.ComponentProps<typeof NumberRangeFilter>>
) => {
	const onChange = vi.fn();

	render(
		<NumberRangeFilter
			label="Test Range"
			entity={'testEntity' as any}
			metric={'testMetric' as any}
			onChange={onChange}
			{...props}
		/>
	);

	const minInput = screen.getByPlaceholderText('Min');
	const maxInput = screen.getByPlaceholderText('Max');

	return { onChange, minInput, maxInput };
};

describe('NumberRangeFilter', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('calls onChange with normalized values based on decimals', async () => {
		const user = userEvent.setup();
		const { onChange, minInput } = setup();

		await user.type(minInput, '1.239');

		expect(onChange).toHaveBeenLastCalledWith({
			min: 1.24,
			max: undefined,
		});
	});

	it('calls onChange with clamped values when input exceeds boundaries', async () => {
		const user = userEvent.setup();
		const { onChange, minInput, maxInput } = setup();

		await user.type(minInput, '-10');
		expect(onChange).toHaveBeenLastCalledWith({
			min: 0,
			max: undefined,
		});

		await user.clear(maxInput);
		await user.type(maxInput, '200');

		expect(onChange).toHaveBeenLastCalledWith({
			min: 0,
			max: 100,
		});
	});

	it('calls onChange with undefined when both values are cleared', async () => {
		const user = userEvent.setup();
		const { onChange, minInput, maxInput } = setup({
			value: { min: 10, max: 20 },
		});

		await user.clear(minInput);
		await user.clear(maxInput);

		expect(onChange).toHaveBeenLastCalledWith(undefined);
	});

	it('does not call onChange with invalid range when min is greater than max', async () => {
		const user = userEvent.setup();
		const { onChange, minInput, maxInput } = setup();

		await user.type(minInput, '50');
		await user.type(maxInput, '10');

		expect(onChange).not.toHaveBeenLastCalledWith({
			min: 50,
			max: 10,
		});
	});

	it('calls onChange with partial range when only min is provided', async () => {
		const user = userEvent.setup();
		const { onChange, minInput } = setup();

		await user.type(minInput, '25');

		expect(onChange).toHaveBeenLastCalledWith({
			min: 25,
			max: undefined,
		});
	});

	it('updates displayed values when parent value changes', () => {
		const { rerender } = render(
			<NumberRangeFilter
				label="Test Range"
				entity={'testEntity' as any}
				metric={'testMetric' as any}
				value={{ min: 5, max: 15 }}
				onChange={vi.fn()}
			/>
		);

		expect(screen.getByDisplayValue('5')).toBeInTheDocument();
		expect(screen.getByDisplayValue('15')).toBeInTheDocument();

		rerender(
			<NumberRangeFilter
				label="Test Range"
				entity={'testEntity' as any}
				metric={'testMetric' as any}
				value={{ min: 20, max: 30 }}
				onChange={vi.fn()}
			/>
		);

		expect(screen.getByDisplayValue('20')).toBeInTheDocument();
		expect(screen.getByDisplayValue('30')).toBeInTheDocument();
	});

	it('calls onChange with sanitized values when slider changes', async () => {
		const user = userEvent.setup();
		const { onChange } = setup();

		await user.click(screen.getByTestId('slider'));

		expect(onChange).toHaveBeenLastCalledWith({
			min: 10,
			max: 20,
		});
	});
});
