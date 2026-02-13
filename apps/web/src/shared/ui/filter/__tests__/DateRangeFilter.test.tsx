import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import DateRangeFilter from '../DateRangeFilter';

vi.mock('@shadcn-ui/calendar', () => ({
	Calendar: ({ onSelect }: any) => (
		<button
			data-testid="calendar-select"
			onClick={() =>
				onSelect({
					from: new Date('2024-01-01'),
					to: new Date('2024-01-10'),
				})
			}
		>
			select-range
		</button>
	),
}));

vi.mock('@shadcn-ui/popover', () => ({
	Popover: ({ children }: any) => <div>{children}</div>,
	PopoverTrigger: ({ children }: any) => <div>{children}</div>,
	PopoverContent: ({ children }: any) => <div>{children}</div>,
}));

const setup = (
	props?: Partial<React.ComponentProps<typeof DateRangeFilter>>
) => {
	const onChange = vi.fn();

	render(
		<DateRangeFilter
			label="Created Between"
			onChange={onChange}
			{...props}
		/>
	);

	return { onChange };
};

describe('DateRangeFilter', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns base label when value is undefined', () => {
		setup();

		expect(
			screen.getByRole('button', { name: /created between/i })
		).toBeInTheDocument();
	});

	it('returns formatted label when only from date exists', () => {
		setup({
			value: {
				from: new Date('2024-01-01'),
			},
		});

		expect(screen.getByText(/from jan 01, 2024/i)).toBeInTheDocument();
	});

	it('returns formatted label when only to date exists', () => {
		setup({
			value: {
				from: undefined,
				to: new Date('2024-01-10'),
			},
		});

		expect(screen.getByText(/until jan 10, 2024/i)).toBeInTheDocument();
	});

	it('returns formatted label when full range exists', () => {
		setup({
			value: {
				from: new Date('2024-01-01'),
				to: new Date('2024-01-10'),
			},
		});

		expect(screen.getByText(/jan 01 – jan 10, 2024/i)).toBeInTheDocument();
	});

	it('calls onChange with selected range when calendar selects full range', async () => {
		const user = userEvent.setup();
		const { onChange } = setup();

		await user.click(screen.getByTestId('calendar-select'));

		expect(onChange).toHaveBeenCalledWith({
			from: new Date('2024-01-01'),
			to: new Date('2024-01-10'),
		});
	});

	it('calls onChange with undefined when clear button is clicked', async () => {
		const user = userEvent.setup();

		const { onChange } = setup({
			value: {
				from: new Date('2024-01-01'),
			},
		});

		await user.click(screen.getByRole('button', { name: /clear/i }));

		expect(onChange).toHaveBeenCalledWith(undefined);
	});

	it('does not allow interaction when disabled is true', () => {
		setup({ disabled: true });

		expect(
			screen.getByRole('button', { name: /created between/i })
		).toBeDisabled();
	});
});
