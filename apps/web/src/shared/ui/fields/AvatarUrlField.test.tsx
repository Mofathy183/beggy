import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useForm } from 'react-hook-form';

import AvatarUrlField from './AvatarUrlField';

function TestForm() {
	const form = useForm({ defaultValues: { avatarUrl: '' } });

	return (
		<form>
			<AvatarUrlField control={form.control} />
		</form>
	);
}

describe('AvatarUrlField', () => {
	it('accepts an avatar url input', () => {
		render(<TestForm />);

		const input = screen.getByPlaceholderText(
			'https://example.com/avatar.png'
		);

		fireEvent.change(input, {
			target: { value: 'https://site.com/avatar.jpg' },
		});

		expect(input).toHaveValue('https://site.com/avatar.jpg');
	});

	it('shows the clear button when the field has a value', () => {
		render(<TestForm />);

		const input = screen.getByPlaceholderText(
			'https://example.com/avatar.png'
		);

		fireEvent.change(input, {
			target: { value: 'https://site.com/avatar.jpg' },
		});

		const clearButton = screen.getByLabelText('Clear avatar URL');

		expect(clearButton).toBeInTheDocument();
	});

	it('clears the field when the clear button is clicked', () => {
		render(<TestForm />);

		const input = screen.getByPlaceholderText(
			'https://example.com/avatar.png'
		);

		fireEvent.change(input, {
			target: { value: 'https://site.com/avatar.jpg' },
		});

		const clearButton = screen.getByLabelText('Clear avatar URL');

		fireEvent.click(clearButton);

		expect(input).toHaveValue('');
	});
});
