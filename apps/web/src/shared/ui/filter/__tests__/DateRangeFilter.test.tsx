import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import DateRangeFilter from '../DateRangeFilter';

let calendarMockImpl: any = null;

vi.mock('@shadcn-ui/calendar', () => ({
	Calendar: (props: any) => {
		if (calendarMockImpl) {
			return calendarMockImpl(props);
		}

		return (
			<button
				data-testid="calendar-select"
				onClick={() =>
					props.onSelect({
						from: new Date('2024-01-01'),
						to: new Date('2024-01-10'),
					})
				}
			>
				select-range
			</button>
		);
	},
}));

vi.mock('@shadcn-ui/popover', () => ({
	Popover: ({ children }: any) => <div>{children}</div>,
	PopoverTrigger: ({ children, ...props }: any) => (
		<button {...props}>{children}</button>
	),
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

	it('shows base label when value is undefined', () => {
		setup();

		expect(
			screen.getByRole('button', { name: /created between/i })
		).toBeInTheDocument();
	});

	it('shows formatted label when only from date exists', () => {
		setup({
			value: {
				from: new Date('2024-01-01'),
			},
		});

		expect(screen.getByText(/from jan 01, 2024/i)).toBeInTheDocument();
	});

	it('shows formatted label when only to date exists', () => {
		setup({
			value: {
				from: undefined,
				to: new Date('2024-01-10'),
			},
		});

		expect(screen.getByText(/until jan 10, 2024/i)).toBeInTheDocument();
	});

	it('ignores selection when from date is after to date', async () => {
		calendarMockImpl = ({ onSelect }: any) => (
			<button
				data-testid="calendar-invalid"
				onClick={() =>
					onSelect({
						from: new Date('2024-01-10'),
						to: new Date('2024-01-01'),
					})
				}
			>
				invalid-range
			</button>
		);

		const user = userEvent.setup();
		const { onChange } = setup();

		await user.click(screen.getByTestId('calendar-invalid'));

		expect(onChange).not.toHaveBeenCalled();

		calendarMockImpl = null;
	});

	it('calls onChange with undefined when calendar clears selection', async () => {
		calendarMockImpl = ({ onSelect }: any) => (
			<button
				data-testid="calendar-clear"
				onClick={() => onSelect({ from: undefined, to: undefined })}
			>
				clear-range
			</button>
		);

		const user = userEvent.setup();
		const { onChange } = setup();

		await user.click(screen.getByTestId('calendar-clear'));

		expect(onChange).toHaveBeenCalledWith(undefined);

		calendarMockImpl = null;
	});

	it('shows formatted label when full range exists', () => {
		setup({
			value: {
				from: new Date('2024-01-01'),
				to: new Date('2024-01-10'),
			},
		});

		expect(screen.getByText(/jan 01 – jan 10, 2024/i)).toBeInTheDocument();
	});

	it('shows error instead of description when both are provided', () => {
		setup({
			description: 'Helper text',
			error: 'Something went wrong',
		});

		expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
		expect(screen.queryByText(/helper text/i)).not.toBeInTheDocument();
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

	it('disables apply button when range is invalid', () => {
		setup({
			value: {
				from: new Date('2024-01-10'),
				to: new Date('2024-01-01'),
			},
		});

		expect(screen.getByRole('button', { name: /apply/i })).toBeDisabled();
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

	it('disables interaction when disabled is true', () => {
		setup({ disabled: true });

		expect(
			screen.getByRole('button', { name: /created between/i })
		).toBeDisabled();
	});
});
