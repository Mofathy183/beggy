import { it, describe, expect } from 'vitest';
import { z } from 'zod';
import { FieldsSchema } from '../../src/schemas/fields.schema';

describe('FieldsSchema.name()', () => {
	it('returns a working name schema', () => {
		const schema = FieldsSchema.name('First name', 'person');
		expect(schema.parse('Mohamed')).toBe('Mohamed');
	});
});

describe('FieldsSchema.email()', () => {
	it('allows null', () => {
		const schema = FieldsSchema.email(false);
		expect(schema.parse(null)).toBeNull();
	});

	it('allows undefined', () => {
		const schema = FieldsSchema.email(false);
		expect(schema.parse(undefined)).toBeUndefined();
	});

	it('accepts a valid email', () => {
		const schema = FieldsSchema.email();

		const result = schema.parse('traveler@example.com');

		expect(result).toBe('traveler@example.com');
	});

	it('trims surrounding whitespace', () => {
		const schema = FieldsSchema.email();

		const result = schema.parse('  Traveler@Example.com  ');

		expect(result).toBe('traveler@example.com');
	});

	it('normalizes email to lowercase', () => {
		const schema = FieldsSchema.email();

		const result = schema.parse('Traveler@Example.COM');

		expect(result).toBe('traveler@example.com');
	});

	it('rejects invalid email format', () => {
		const schema = FieldsSchema.email();

		expect(() => schema.parse('not-an-email')).toThrow();
		expect(() => schema.parse('user@')).toThrow();
		expect(() => schema.parse('@example.com')).toThrow();
	});

	it('rejects empty string', () => {
		const schema = FieldsSchema.email();

		expect(() => schema.parse('')).toThrow();
	});

	it('normalizes valid email when provided', () => {
		const schema = FieldsSchema.email(false);

		const result = schema.parse('  USER@Example.COM  ');

		expect(result).toBe('user@example.com');
	});

	it('rejects invalid email even when optional', () => {
		const schema = FieldsSchema.email(false);

		expect(() => schema.parse('invalid-email')).toThrow();
	});
});

describe('FieldsSchema.password()', () => {
	it('accepts a strong password', () => {
		const schema = FieldsSchema.password();
		expect(schema.parse('Strong@123')).toBe('Strong@123');
	});

	it('rejects weak passwords', () => {
		const schema = FieldsSchema.password();
		expect(() => schema.parse('weak')).toThrow();
	});

	it('trims surrounding whitespace', () => {
		const schema = FieldsSchema.password();
		expect(schema.parse('  Strong@123  ')).toBe('Strong@123');
	});

	it('allows null for optional password', () => {
		const schema = FieldsSchema.password(false);
		expect(schema.parse(null)).toBeNull();
	});
});

enum TestEnum {
	A = 'A',
	B = 'B',
}

describe('FieldsSchema.enum()', () => {
	it('accepts valid enum value', () => {
		const schema = FieldsSchema.enum(TestEnum);
		expect(schema.parse(TestEnum.A)).toBe(TestEnum.A);
	});

	it('rejects invalid enum value', () => {
		const schema = FieldsSchema.enum(TestEnum);
		expect(() => schema.parse('C')).toThrow();
	});
});

describe('FieldsSchema.date()', () => {
	it('accepts a valid Date instance', () => {
		const schema = FieldsSchema.date();

		const input = new Date('2020-01-01');
		const result = schema.parse(input) as Date;

		expect(result).toBeInstanceOf(Date);
		expect(result.getTime()).toBe(input.getTime());
	});

	it('returns a new Date instance (no mutation)', () => {
		const schema = FieldsSchema.date();

		const input = new Date('2020-01-01');
		const result = schema.parse(input) as Date;

		// Same value
		expect(result.getTime()).toBe(input.getTime());

		// Different reference
		expect(result).not.toBe(input);
	});

	it('rejects dates before 1900-01-01', () => {
		const schema = FieldsSchema.date();

		const tooOld = new Date('1800-01-01');

		expect(() => schema.parse(tooOld)).toThrow();
	});

	it('rejects future dates', () => {
		const schema = FieldsSchema.date();

		const future = new Date();
		future.setFullYear(future.getFullYear() + 1);

		expect(() => schema.parse(future)).toThrow();
	});

	it('rejects non-Date values', () => {
		const schema = FieldsSchema.date();

		expect(() => schema.parse('2020-01-01')).toThrow();
		expect(() => schema.parse(123456)).toThrow();
		expect(() => schema.parse({})).toThrow();
	});
});

describe('FieldsSchema.url()', () => {
	it('accepts valid URL and trims it', () => {
		const schema = FieldsSchema.url();
		expect(schema.parse('  https://example.com  ')).toBe(
			'https://example.com'
		);
	});

	it('rejects unsafe characters', () => {
		const schema = FieldsSchema.url();
		expect(() => schema.parse('https://exa mple.com')).toThrow();
	});

	it('allows null when optional', () => {
		const schema = FieldsSchema.url(false);
		expect(schema.parse(null)).toBeNull();
	});
});

describe('FieldsSchema.number()', () => {
	it('returns a working number schema', () => {
		const schema = FieldsSchema.number('bag', 'capacity');
		expect(schema.parse(10)).toBe(10);
	});
});

describe('FieldsSchema.array()', () => {
	it('returns a working array schema', () => {
		const schema = FieldsSchema.array(z.string());
		expect(schema.parse(['a'])).toEqual(['a']);
	});
});
