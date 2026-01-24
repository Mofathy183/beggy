import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
	createArrayField,
	createNameField,
	createNumberField,
} from '../../src/utils/schema.util';

describe('createNumberField()', () => {
	it('parses a valid number and applies configured rounding', () => {
		const schema = createNumberField('bag', 'capacity');
		expect(schema.parse(10.456)).toBe(10.5); // decimals: 1
	});

	it('fails when value is below the minimum constraint', () => {
		const schema = createNumberField('bag', 'capacity');
		expect(() => schema.parse(0)).toThrow();
	});

	it('fails when value exceeds the maximum constraint', () => {
		const schema = createNumberField('bag', 'capacity');
		expect(() => schema.parse(1000)).toThrow();
	});

	it('fails when value is not a number', () => {
		const schema = createNumberField('bag', 'capacity');
		expect(() => schema.parse('10')).toThrow();
	});

	it('parses null when field is optional', () => {
		const schema = createNumberField('bag', 'capacity', false);
		expect(schema.parse(null)).toBeNull();
	});

	it('parses undefined when field is optional', () => {
		const schema = createNumberField('bag', 'capacity', false);
		expect(schema.parse(undefined)).toBeUndefined();
	});
});

describe('createNameField()', () => {
	it('parses a valid name value', () => {
		const schema = createNameField('person', 'First name');
		expect(schema.parse('Mohamed')).toBe('Mohamed');
	});

	it('trims surrounding whitespace', () => {
		const schema = createNameField('person', 'First name');
		expect(schema.parse('  Mohamed  ')).toBe('Mohamed');
	});

	it('fails when name is shorter than the minimum length', () => {
		const schema = createNameField('person', 'First name');
		expect(() => schema.parse('M')).toThrow();
	});

	it('fails when name contains invalid characters', () => {
		const schema = createNameField('person', 'First name');
		expect(() => schema.parse('Mohamed@123')).toThrow();
	});

	it('parses null when field is optional', () => {
		const schema = createNameField('person', 'First name', false);
		expect(schema.parse(null)).toBeNull();
	});

	it('parses undefined when field is optional', () => {
		const schema = createNameField('person', 'First name', false);
		expect(schema.parse(undefined)).toBeUndefined();
	});
});

describe('createArrayField()', () => {
	it('parses a valid required array', () => {
		const schema = createArrayField(z.string());
		expect(schema.parse(['a'])).toEqual(['a']);
	});

	it('fails when required array is empty', () => {
		const schema = createArrayField(z.string());
		expect(() => schema.parse([])).toThrow();
	});

	it('fails when array exceeds the maximum allowed length', () => {
		const schema = createArrayField(z.string());
		expect(() => schema.parse(['a', 'b', 'c', 'd', 'e', 'f'])).toThrow();
	});

	it('parses empty array when field is optional', () => {
		const schema = createArrayField(z.string(), false);
		expect(schema.parse([])).toEqual([]);
	});

	it('parses undefined when field is optional', () => {
		const schema = createArrayField(z.string(), false);
		expect(schema.parse(undefined)).toBeUndefined();
	});

	it('fails when array elements do not satisfy the element schema', () => {
		const schema = createArrayField(z.number());
		expect(() => schema.parse(['not-a-number'])).toThrow();
	});
});
