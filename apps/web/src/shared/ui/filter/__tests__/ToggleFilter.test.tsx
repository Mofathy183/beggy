import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ToggleFilter from '../ToggleFilter';

const setup = (value: boolean | undefined = undefined) => {
	const onChange = vi.fn();

	render(
		<ToggleFilter label="Active Status" value={value} onChange={onChange} />
	);

	return { onChange };
};

describe('ToggleFilter', () => {
	it('returns label when provided', () => {
		setup();
		expect(screen.getByText('Active Status')).toBeInTheDocument();
	});

	it('does not return label when not provided', () => {
		const onChange = vi.fn();

		render(<ToggleFilter value={undefined} onChange={onChange} />);

		expect(screen.queryByText('Active Status')).not.toBeInTheDocument();
	});

	it('activates All option when value is undefined', () => {
		setup(undefined);

		expect(screen.getByRole('radio', { name: /all/i })).toHaveAttribute(
			'data-state',
			'on'
		);
	});

	it('activates Yes option when value is true', () => {
		setup(true);

		expect(screen.getByRole('radio', { name: /yes/i })).toHaveAttribute(
			'data-state',
			'on'
		);
	});

	it('activates No option when value is false', () => {
		setup(false);

		expect(screen.getByRole('radio', { name: /no/i })).toHaveAttribute(
			'data-state',
			'on'
		);
	});

	it('calls onChange with true when Yes is clicked', () => {
		const { onChange } = setup(undefined);

		fireEvent.click(screen.getByRole('radio', { name: /yes/i }));

		expect(onChange).toHaveBeenCalledWith(true);
	});

	it('calls onChange with false when No is clicked', () => {
		const { onChange } = setup(undefined);

		fireEvent.click(screen.getByRole('radio', { name: /no/i }));

		expect(onChange).toHaveBeenCalledWith(false);
	});

	it('calls onChange with undefined when All is clicked', () => {
		const { onChange } = setup(true);

		fireEvent.click(screen.getByRole('radio', { name: /all/i }));

		expect(onChange).toHaveBeenCalledWith(undefined);
	});
});
