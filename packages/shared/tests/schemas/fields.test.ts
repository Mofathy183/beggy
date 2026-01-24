import { it, describe, expect } from 'vitest';
import { z } from 'zod';
import { FieldsSchema } from '../../src/schemas/fields.schema';

describe('FieldsSchema.name()', () => {
	it('parses a valid name value', () => {
		const schema = FieldsSchema.name('First name', 'person');
		expect(schema.parse('Mohamed')).toBe('Mohamed');
	});
});

describe('FieldsSchema.email()', () => {
	it('returns null when value is null and field is optional', () => {
		const schema = FieldsSchema.email(false);
		expect(schema.parse(null)).toBeNull();
	});

	it('returns undefined when value is undefined and field is optional', () => {
		const schema = FieldsSchema.email(false);
		expect(schema.parse(undefined)).toBeUndefined();
	});

	it('parses a valid email address', () => {
		const schema = FieldsSchema.email();

		const result = schema.parse('traveler@example.com');

		expect(result).toBe('traveler@example.com');
	});

	it('trims surrounding whitespace from the email', () => {
		const schema = FieldsSchema.email();

		const result = schema.parse('  Traveler@Example.com  ');

		expect(result).toBe('traveler@example.com');
	});

	it('normalizes the email to lowercase', () => {
		const schema = FieldsSchema.email();

		const result = schema.parse('Traveler@Example.COM');

		expect(result).toBe('traveler@example.com');
	});

	it('throws when email format is invalid', () => {
		const schema = FieldsSchema.email();

		expect(() => schema.parse('not-an-email')).toThrow();
		expect(() => schema.parse('user@')).toThrow();
		expect(() => schema.parse('@example.com')).toThrow();
	});

	it('throws when email is an empty string', () => {
		const schema = FieldsSchema.email();

		expect(() => schema.parse('')).toThrow();
	});

	it('normalizes the email when provided for an optional field', () => {
		const schema = FieldsSchema.email(false);

		const result = schema.parse('  USER@Example.COM  ');

		expect(result).toBe('user@example.com');
	});

	it('throws when an invalid email is provided even if optional', () => {
		const schema = FieldsSchema.email(false);

		expect(() => schema.parse('invalid-email')).toThrow();
	});
});

describe('FieldsSchema.password()', () => {
	it('parses a strong password', () => {
		const schema = FieldsSchema.password();
		expect(schema.parse('Strong@123')).toBe('Strong@123');
	});

	it('throws when password does not meet strength requirements', () => {
		const schema = FieldsSchema.password();
		expect(() => schema.parse('weak')).toThrow();
	});

	it('trims surrounding whitespace from the password', () => {
		const schema = FieldsSchema.password();
		expect(schema.parse('  Strong@123  ')).toBe('Strong@123');
	});

	it('returns null when password is optional and value is null', () => {
		const schema = FieldsSchema.password(false);
		expect(schema.parse(null)).toBeNull();
	});
});

enum TestEnum {
	A = 'A',
	B = 'B',
}

describe('FieldsSchema.enum()', () => {
	it('parses a valid enum value', () => {
		const schema = FieldsSchema.enum(TestEnum);
		expect(schema.parse(TestEnum.A)).toBe(TestEnum.A);
	});

	it('throws when value is not part of the enum', () => {
		const schema = FieldsSchema.enum(TestEnum);
		expect(() => schema.parse('C')).toThrow();
	});
});

describe('FieldsSchema.date()', () => {
	it('parses a valid Date instance', () => {
		const schema = FieldsSchema.date();

		const input = new Date('2020-01-01');
		const result = schema.parse(input) as Date;

		expect(result).toBeInstanceOf(Date);
		expect(result.getTime()).toBe(input.getTime());
	});

	it('returns a new Date instance without mutating the input', () => {
		const schema = FieldsSchema.date();

		const input = new Date('2020-01-01');
		const result = schema.parse(input) as Date;

		expect(result.getTime()).toBe(input.getTime());
		expect(result).not.toBe(input);
	});

	it('throws when date is before the minimum allowed value', () => {
		const schema = FieldsSchema.date();

		const tooOld = new Date('1800-01-01');

		expect(() => schema.parse(tooOld)).toThrow();
	});

	it('throws when date is in the future', () => {
		const schema = FieldsSchema.date();

		const future = new Date();
		future.setFullYear(future.getFullYear() + 1);

		expect(() => schema.parse(future)).toThrow();
	});

	it('throws when value is not a Date instance', () => {
		const schema = FieldsSchema.date();

		expect(() => schema.parse('2020-01-01')).toThrow();
		expect(() => schema.parse(123456)).toThrow();
		expect(() => schema.parse({})).toThrow();
	});
});

describe('FieldsSchema.url()', () => {
	it('parses a valid URL and trims whitespace', () => {
		const schema = FieldsSchema.url();
		expect(schema.parse('  https://example.com  ')).toBe(
			'https://example.com'
		);
	});

	it('throws when URL contains unsafe characters', () => {
		const schema = FieldsSchema.url();
		expect(() => schema.parse('https://exa mple.com')).toThrow();
	});

	it('returns null when URL is optional and value is null', () => {
		const schema = FieldsSchema.url(false);
		expect(schema.parse(null)).toBeNull();
	});
});

describe('FieldsSchema.number()', () => {
	it('parses a valid number value', () => {
		const schema = FieldsSchema.number('bag', 'capacity');
		expect(schema.parse(10)).toBe(10);
	});
});

describe('FieldsSchema.array()', () => {
	it('parses a valid array value', () => {
		const schema = FieldsSchema.array(z.string());
		expect(schema.parse(['a'])).toEqual(['a']);
	});
});
