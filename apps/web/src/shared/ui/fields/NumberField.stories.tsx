'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useForm } from 'react-hook-form';
import { WEIGHT_UNIT_META } from '@shared-ui/mappers';
import NumberField from './NumberField';

// ─── Mock Data (Deterministic) ────────────────────────────────────────────────

const WEIGHT_UNIT_OPTIONS = WEIGHT_UNIT_META.map((m) => ({
	value: m.value,
	label: `${m.label} (${m.symbol})`,
	symbol: m.symbol,
}));

// ─── Story Meta ───────────────────────────────────────────────────────────────

const meta: Meta<typeof NumberField> = {
	title: 'UI/Fields/NumberField',
	component: NumberField,
	tags: ['autodocs'],

	parameters: {
		docs: {
			description: {
				component: `
A numeric input field designed for structured form entry, optionally paired with a unit selector.

---

### What it is
A self-contained form field that handles numeric input with optional unit selection, including label, description, and error messaging.

---

### When to use it
- Quantitative inputs (weight, distance, volume)
- Inputs requiring units (kg, lb, cm, etc.)
- Structured forms with validation feedback

---

### When NOT to use it
- Free text numeric input without validation
- Complex composite inputs (ranges, sliders)
- Non-numeric data entry

---

### Interaction model
- Users type numeric values directly
- Optional unit selector via dropdown
- Keyboard ↑ / ↓ increments supported
- Focus ring appears on input group

---

### Constraints
- Accepts only numeric values
- Optional min/max boundaries
- Unit selection is required when enabled
- Error states affect entire group

---

### Accessibility guarantees
- Proper label association via htmlFor
- aria-invalid for error states
- aria-describedby connects description + errors
- Keyboard accessible input and select
- Focus-visible ring for navigation

---

### Design-system notes
- Token-based styling only (no hardcoded colors)
- Supports grouped and standalone layouts
- RTL-safe via logical CSS properties
- Consistent spacing and density across forms
`,
			},
		},
	},

	argTypes: {
		label: {
			control: 'text',
			description: 'Field label displayed above the input.',
			table: {
				type: { summary: 'string' },
			},
		},
		description: {
			control: 'text',
			description: 'Helper text displayed below the field.',
			table: {
				type: { summary: 'string' },
			},
		},
		placeholder: {
			control: 'text',
			description: 'Placeholder text for the numeric input.',
			table: {
				type: { summary: 'string' },
				defaultValue: { summary: '0' },
			},
		},
		min: {
			control: 'number',
			description: 'Minimum allowed value.',
			table: {
				type: { summary: 'number' },
				defaultValue: { summary: '0' },
			},
		},
		max: {
			control: 'number',
			description: 'Maximum allowed value.',
			table: {
				type: { summary: 'number' },
			},
		},
		step: {
			control: 'text',
			description: 'Step increment for numeric input.',
			table: {
				type: { summary: 'number | "any"' },
				defaultValue: { summary: 'any' },
			},
		},
		optional: {
			control: 'boolean',
			description: 'Marks the field as optional.',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},

		// Hidden (implementation details)
		control: { table: { disable: true } },
		errors: { table: { disable: true } },
		valueName: { table: { disable: true } },
		unitName: { table: { disable: true } },
		unitOptions: { table: { disable: true } },
		valueErrorId: { table: { disable: true } },
		unitErrorId: { table: { disable: true } },
		className: { table: { disable: true } },
	},
};

export default meta;

type Story = StoryObj<typeof NumberField>;

// ─── Shared Render Helper ─────────────────────────────────────────────────────

const createForm = (defaultValues: any) => {
	const form = useForm({
		defaultValues,
	});

	return form;
};

// ─── Stories ──────────────────────────────────────────────────────────────────

/**
 * Default numeric input without unit.
 *
 * Users can enter a number with no additional context.
 */
export const Default: Story = {
	render: (args) => {
		const form = createForm({ value: undefined });

		return (
			<NumberField
				{...args}
				control={form.control}
				valueName="value"
				errors={{}}
				valueErrorId="default-error"
			/>
		);
	},
	args: {
		label: 'Bag weight',
		placeholder: '0.0',
	},
	parameters: {
		docs: {
			description: {
				story: 'Basic numeric input used for simple quantitative data without units.',
			},
		},
	},
};

/**
 * Numeric input with unit selection.
 *
 * Users provide both value and measurement unit.
 */
export const WithUnit: Story = {
	render: (args) => {
		const form = createForm({
			weight: 2.5,
			weightUnit: 'KG',
		});

		return (
			<NumberField
				{...args}
				control={form.control}
				valueName="weight"
				unitName="weightUnit"
				unit
				unitOptions={WEIGHT_UNIT_OPTIONS}
				errors={{}}
				valueErrorId="weight-error"
				unitErrorId="unit-error"
			/>
		);
	},
	args: {
		label: 'Weight',
		step: 0.1,
	},
	parameters: {
		docs: {
			description: {
				story: 'Input paired with unit selector for structured measurement entry.',
			},
		},
	},
};

/**
 * Error state when validation fails.
 *
 * Input and/or unit field displays error messages.
 */
export const ErrorState: Story = {
	render: (args) => {
		const form = createForm({
			weight: '',
			weightUnit: '',
		});

		return (
			<NumberField
				{...args}
				control={form.control}
				valueName="weight"
				unitName="weightUnit"
				unit
				unitOptions={WEIGHT_UNIT_OPTIONS}
				errors={{
					weight: { type: 'required', message: 'Value is required' },
					weightUnit: {
						type: 'required',
						message: 'Unit is required',
					},
				}}
				valueErrorId="error-weight"
				unitErrorId="error-unit"
			/>
		);
	},
	args: {
		label: 'Weight',
	},
	parameters: {
		docs: {
			description: {
				story: 'Displays validation errors for both value and unit, highlighting the full input group.',
			},
		},
	},
};

/**
 * Disabled interaction state.
 *
 * Field appears inactive and does not accept input.
 */
export const Disabled: Story = {
	render: (args) => {
		const form = createForm({ value: 10 });

		return (
			<fieldset disabled>
				<NumberField
					{...args}
					control={form.control}
					valueName="value"
					errors={{}}
					valueErrorId="disabled-error"
				/>
			</fieldset>
		);
	},
	args: {
		label: 'Distance',
	},
	parameters: {
		docs: {
			description: {
				story: 'Entire field is disabled, preventing user interaction while maintaining readability.',
			},
		},
	},
};

/**
 * Empty state with no value entered.
 *
 * Placeholder guides the user.
 */
export const Empty: Story = {
	render: (args) => {
		const form = createForm({ value: undefined });

		return (
			<NumberField
				{...args}
				control={form.control}
				valueName="value"
				errors={{}}
				valueErrorId="empty-error"
			/>
		);
	},
	args: {
		label: 'Volume',
		placeholder: '0.0',
	},
	parameters: {
		docs: {
			description: {
				story: 'Represents initial state where no value has been entered yet.',
			},
		},
	},
};

/**
 * Narrow container layout stress test.
 *
 * Ensures layout remains stable in constrained width.
 */
export const NarrowContainer: Story = {
	render: (args) => {
		const form = createForm({
			weight: 1,
			weightUnit: 'KG',
		});

		return (
			<div className="w-[240px]">
				<NumberField
					{...args}
					control={form.control}
					valueName="weight"
					unitName="weightUnit"
					unit
					unitOptions={WEIGHT_UNIT_OPTIONS}
					errors={{}}
					valueErrorId="narrow-error"
					unitErrorId="narrow-unit-error"
				/>
			</div>
		);
	},
	args: {
		label: 'Weight',
	},
	parameters: {
		docs: {
			description: {
				story: 'Tests layout responsiveness in narrow containers to prevent overflow or breakage.',
			},
		},
	},
};

/**
 * Dark mode validation.
 *
 * Ensures proper contrast and visibility.
 */
export const DarkMode: Story = {
	render: (args) => {
		const form = createForm({
			weight: 3,
			weightUnit: 'LB',
		});

		return (
			<NumberField
				{...args}
				control={form.control}
				valueName="weight"
				unitName="weightUnit"
				unit
				unitOptions={WEIGHT_UNIT_OPTIONS}
				errors={{}}
				valueErrorId="dark-error"
				unitErrorId="dark-unit-error"
			/>
		);
	},
	args: {
		label: 'Weight',
	},
	globals: {
		theme: 'dark',
	},
	parameters: {
		docs: {
			description: {
				story: 'Validates color tokens, contrast, and focus visibility in dark mode.',
			},
		},
	},
};
