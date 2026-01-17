import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
	createArrayField,
	createNameField,
	createNumberField,
} from '../../src/utils/schema.util';

describe('createNumberField()', () => {
	it('accepts a valid number and rounds correctly', () => {
		const schema = createNumberField('bag', 'capacity');
		expect(schema.parse(10.456)).toBe(10.5); // decimals: 1
	});

	it('rejects numbers below minimum', () => {
		const schema = createNumberField('bag', 'capacity');
		expect(() => schema.parse(0)).toThrow();
	});

	it('rejects numbers above maximum', () => {
		const schema = createNumberField('bag', 'capacity');
		expect(() => schema.parse(1000)).toThrow();
	});

	it('rejects non-numeric values', () => {
		const schema = createNumberField('bag', 'capacity');
		expect(() => schema.parse('10')).toThrow();
	});

	it('allows null for optional number fields', () => {
		const schema = createNumberField('bag', 'capacity', false);
		expect(schema.parse(null)).toBeNull();
	});

	it('allows undefined for optional number fields', () => {
		const schema = createNumberField('bag', 'capacity', false);
		expect(schema.parse(undefined)).toBeUndefined();
	});
});

describe('createNameField()', () => {
	it('accepts a valid person name', () => {
		const schema = createNameField('person', 'First name');
		expect(schema.parse('Mohamed')).toBe('Mohamed');
	});

	it('trims surrounding whitespace', () => {
		const schema = createNameField('person', 'First name');
		expect(schema.parse('  Mohamed  ')).toBe('Mohamed');
	});

	it('rejects names shorter than minimum length', () => {
		const schema = createNameField('person', 'First name');
		expect(() => schema.parse('M')).toThrow();
	});

	it('rejects names with invalid characters', () => {
		const schema = createNameField('person', 'First name');
		expect(() => schema.parse('Mohamed@123')).toThrow();
	});

	it('allows null for optional name fields', () => {
		const schema = createNameField('person', 'First name', false);
		expect(schema.parse(null)).toBeNull();
	});

	it('allows undefined for optional name fields', () => {
		const schema = createNameField('person', 'First name', false);
		expect(schema.parse(undefined)).toBeUndefined();
	});
});

describe('createArrayField()', () => {
	it('accepts a valid required array', () => {
		const schema = createArrayField(z.string());
		expect(schema.parse(['a'])).toEqual(['a']);
	});

	it('rejects empty array when required', () => {
		const schema = createArrayField(z.string());
		expect(() => schema.parse([])).toThrow();
	});

	it('rejects array exceeding max length', () => {
		const schema = createArrayField(z.string());
		expect(() => schema.parse(['a', 'b', 'c', 'd', 'e', 'f'])).toThrow();
	});

	it('allows empty array when optional', () => {
		const schema = createArrayField(z.string(), false);
		expect(schema.parse([])).toEqual([]);
	});

	it('allows undefined when optional', () => {
		const schema = createArrayField(z.string(), false);
		expect(schema.parse(undefined)).toBeUndefined();
	});

	it('delegates validation to element schema', () => {
		const schema = createArrayField(z.number());
		expect(() => schema.parse(['not-a-number'])).toThrow();
	});
});
