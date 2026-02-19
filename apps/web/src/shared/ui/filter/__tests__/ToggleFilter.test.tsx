import { render, screen } from '@testing-library/react';
import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import ToggleFilter from '../ToggleFilter';

describe('ToggleFilter', () => {
	it('renders label when provided', () => {
		render(
			<ToggleFilter
				label="Active Status"
				value={undefined}
				onChange={vi.fn()}
			/>
		);

		expect(screen.getByText('Active Status')).toBeInTheDocument();
	});

	it('selects "All" when value is undefined', () => {
		render(<ToggleFilter value={undefined} onChange={vi.fn()} />);

		expect(screen.getByRole('button', { name: /all/i })).toHaveAttribute(
			'aria-pressed',
			'true'
		);
	});

	it('selects "Yes" when value is true', () => {
		render(<ToggleFilter value={true} onChange={vi.fn()} />);

		expect(screen.getByRole('button', { name: /yes/i })).toHaveAttribute(
			'aria-pressed',
			'true'
		);
	});

	it('selects "No" when value is false', () => {
		render(<ToggleFilter value={false} onChange={vi.fn()} />);

		expect(screen.getByRole('button', { name: /no/i })).toHaveAttribute(
			'aria-pressed',
			'true'
		);
	});

	it('calls onChange with true when user selects "Yes"', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();

		render(<ToggleFilter value={undefined} onChange={onChange} />);

		await user.click(screen.getByRole('button', { name: /yes/i }));

		expect(onChange).toHaveBeenCalledWith(true);
	});

	it('calls onChange with false when user selects "No"', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();

		render(<ToggleFilter value={undefined} onChange={onChange} />);

		await user.click(screen.getByRole('button', { name: /no/i }));

		expect(onChange).toHaveBeenCalledWith(false);
	});

	it('calls onChange with undefined when user selects "All"', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();

		render(<ToggleFilter value={true} onChange={onChange} />);

		await user.click(screen.getByRole('button', { name: /all/i }));

		expect(onChange).toHaveBeenCalledWith(undefined);
	});

	it('reflects updated value when parent changes value', async () => {
		const user = userEvent.setup();

		const Wrapper = () => {
			const [value, setValue] = useState<boolean | undefined>(undefined);
			return <ToggleFilter value={value} onChange={setValue} />;
		};

		render(<Wrapper />);

		await user.click(screen.getByRole('button', { name: /yes/i }));

		expect(screen.getByRole('button', { name: /yes/i })).toHaveAttribute(
			'aria-pressed',
			'true'
		);
	});
});
