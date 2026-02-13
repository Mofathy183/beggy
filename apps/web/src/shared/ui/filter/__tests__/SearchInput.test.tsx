import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SearchInput from '../SearchInput';

const setup = (props?: Partial<React.ComponentProps<typeof SearchInput>>) => {
	const onChange = vi.fn();

	render(<SearchInput label="Search Users" onChange={onChange} {...props} />);

	return { onChange };
};

describe('SearchInput', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('returns label and placeholder when provided', () => {
		setup({ placeholder: 'Type here...' });

		expect(screen.getByText('Search Users')).toBeInTheDocument();
		expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument();
	});

	it('updates displayed value when external value changes', () => {
		const { rerender } = render(
			<SearchInput label="Search" value="john" onChange={vi.fn()} />
		);

		expect(screen.getByDisplayValue('john')).toBeInTheDocument();

		rerender(<SearchInput label="Search" value="doe" onChange={vi.fn()} />);

		expect(screen.getByDisplayValue('doe')).toBeInTheDocument();
	});

	it('calls onChange after debounce delay', () => {
		const { onChange } = setup({ debounceMs: 500 });

		fireEvent.change(screen.getByRole('textbox'), {
			target: { value: 'john' },
		});

		expect(onChange).not.toHaveBeenCalled();

		act(() => {
			vi.advanceTimersByTime(500);
		});

		expect(onChange).toHaveBeenCalledWith('john');
	});

	it('calls onChange with trimmed value', () => {
		const { onChange } = setup();

		fireEvent.change(screen.getByRole('textbox'), {
			target: { value: '  john  ' },
		});

		act(() => {
			vi.advanceTimersByTime(400);
		});

		expect(onChange).toHaveBeenCalledWith('john');
	});

	it('calls onChange with undefined when input is empty', () => {
		const { onChange } = setup();

		fireEvent.change(screen.getByRole('textbox'), {
			target: { value: '   ' },
		});

		act(() => {
			vi.advanceTimersByTime(400);
		});

		expect(onChange).toHaveBeenCalledWith(undefined);
	});

	it('calls onChange with undefined when clear button is clicked', () => {
		const { onChange } = setup();

		const input = screen.getByRole('textbox');

		fireEvent.change(input, { target: { value: 'john' } });

		act(() => {
			vi.advanceTimersByTime(400);
		});

		fireEvent.click(screen.getByLabelText('Clear search'));

		act(() => {
			vi.advanceTimersByTime(400);
		});

		expect(onChange).toHaveBeenLastCalledWith(undefined);
	});

	it('calls onChange with undefined when escape key is pressed', () => {
		const { onChange } = setup();

		const input = screen.getByRole('textbox');

		fireEvent.change(input, { target: { value: 'john' } });

		act(() => {
			vi.advanceTimersByTime(400);
		});

		fireEvent.keyDown(input, { key: 'Escape' });

		act(() => {
			vi.advanceTimersByTime(400);
		});

		expect(onChange).toHaveBeenLastCalledWith(undefined);
	});

	it('does not show clear button when loading is true', () => {
		setup({ value: 'john', isLoading: true });

		expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
	});

	it('returns description when provided', () => {
		setup({ description: 'Search by name or email' });

		expect(screen.getByText('Search by name or email')).toBeInTheDocument();
	});

	it('returns error message when provided', () => {
		setup({ error: 'Invalid search term' });

		expect(screen.getByText('Invalid search term')).toBeInTheDocument();
	});

	it('focuses input when autoFocus is true', () => {
		setup({ autoFocus: true });

		expect(screen.getByRole('textbox')).toHaveFocus();
	});
});
