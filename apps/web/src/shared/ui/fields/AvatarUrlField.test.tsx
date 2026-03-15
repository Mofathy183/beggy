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
	it('allows users to type an avatar url', () => {
		render(<TestForm />);

		const input = screen.getByPlaceholderText(
			'https://example.com/avatar.png'
		);

		fireEvent.change(input, {
			target: { value: 'https://site.com/avatar.jpg' },
		});

		expect(input).toHaveValue('https://site.com/avatar.jpg');
	});

	it('shows clear button when input has value', () => {
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

	it('clears the field when clear button is clicked', () => {
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
