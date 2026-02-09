import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Chips from './Chips';

type MultipleChipsProps<T> = {
	mode?: 'multiple';
	options: { label: string; value: T; disabled?: boolean }[];
	disabled?: boolean;
	maxSelected?: number;
};

const ChipsTestWrapper = <T extends string>({
	initialValue,
	onChange,
	...props
}: {
	initialValue: T[];
	onChange: (v: T[]) => void;
} & MultipleChipsProps<T>) => {
	const [value, setValue] = useState<T[]>(initialValue);

	return (
		<Chips
			{...props}
			mode="multiple"
			value={value}
			onChange={(next) => {
				setValue(next);
				onChange(next);
			}}
		/>
	);
};

describe('Chips / single mode', () => {
	it('returns selected value', async () => {
		const onChange = vi.fn();

		render(
			<Chips
				mode="single"
				value={null}
				onChange={onChange}
				options={[
					{ label: 'A', value: 'a' },
					{ label: 'B', value: 'b' },
				]}
			/>
		);

		await userEvent.click(screen.getByText('A'));

		expect(onChange).toHaveBeenCalledWith('a');
	});

	it('returns null when selected value is clicked again', async () => {
		const onChange = vi.fn();

		render(
			<Chips
				mode="single"
				value="a"
				onChange={onChange}
				options={[
					{ label: 'A', value: 'a' },
					{ label: 'B', value: 'b' },
				]}
			/>
		);

		await userEvent.click(screen.getByText('A'));

		expect(onChange).toHaveBeenCalledWith(null);
	});
});

describe('Chips / multiple mode', () => {
	it('adds values to the selection', async () => {
		const onChange = vi.fn();

		render(
			<ChipsTestWrapper
				mode="multiple"
				initialValue={['a']}
				onChange={onChange}
				options={[
					{ label: 'A', value: 'a' },
					{ label: 'B', value: 'b' },
				]}
			/>
		);

		await userEvent.click(screen.getByText('B'));

		expect(onChange).toHaveBeenLastCalledWith(['a', 'b']);
	});

	it('removes values from the selection', async () => {
		const onChange = vi.fn();

		render(
			<Chips
				mode="multiple"
				value={['a']}
				onChange={onChange}
				options={[
					{ label: 'A', value: 'a' },
					{ label: 'B', value: 'b' },
				]}
			/>
		);

		await userEvent.click(screen.getByText('A'));

		expect(onChange).toHaveBeenCalledWith([]);
	});

	it('rejects selections beyond maxSelected', async () => {
		const onChange = vi.fn();

		render(
			<Chips
				mode="multiple"
				value={['a']}
				maxSelected={1}
				onChange={onChange}
				options={[
					{ label: 'A', value: 'a' },
					{ label: 'B', value: 'b' },
				]}
			/>
		);

		await userEvent.click(screen.getByText('B'));

		expect(onChange).not.toHaveBeenCalled();
	});

	it('ignores disabled options', async () => {
		const onChange = vi.fn();

		render(
			<Chips
				mode="single"
				value={null}
				onChange={onChange}
				options={[{ label: 'A', value: 'a', disabled: true }]}
			/>
		);

		await userEvent.click(screen.getByText('A'));

		expect(onChange).not.toHaveBeenCalled();
	});

	it('ignores interaction when disabled', async () => {
		const onChange = vi.fn();

		render(
			<Chips
				mode="single"
				value={null}
				disabled
				onChange={onChange}
				options={[{ label: 'A', value: 'a' }]}
			/>
		);

		await userEvent.click(screen.getByText('A'));

		expect(onChange).not.toHaveBeenCalled();
	});
});
