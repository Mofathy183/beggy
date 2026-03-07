import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useForm } from 'react-hook-form';

import MeasurementField from './MeasurementField';
import { VolumeUnit, WeightUnit } from '@beggy/shared/constants';
import { WEIGHT_UNIT_META, VOLUME_UNIT_META } from '@shared-ui/mappers';
import { useEffect } from 'react';

type FormValues = {
	weight?: number;
	weightUnit?: string;
	volume?: number;
	volumeUnit?: string;
};

const weightUnitOptions = WEIGHT_UNIT_META.map((m) => ({
	value: m.value,
	label: `${m.label} (${m.symbol})`,
	symbol: m.symbol,
}));

const volumeUnitOptions = VOLUME_UNIT_META.map((m) => ({
	value: m.value,
	label: `${m.label} (${m.symbol})`,
	symbol: m.symbol,
}));

function FormWrapper(props: React.ComponentProps<typeof MeasurementField>) {
	const form = useForm<FormValues>({
		defaultValues: {
			weight: undefined,
			weightUnit: WeightUnit.KILOGRAM,
			volume: undefined,
			volumeUnit: VolumeUnit.LITER,
		},
	});

	return (
		<div style={{ width: 360 }}>
			<MeasurementField
				{...props}
				control={form.control}
				errors={form.formState.errors}
			/>
		</div>
	);
}
const meta: Meta<typeof MeasurementField> = {
	title: 'Features/Items/Fields/MeasurementField',
	component: MeasurementField,
	tags: ['autodocs'],

	parameters: {
		layout: 'centered',

		docs: {
			description: {
				component: `
## MeasurementField

A compound form field combining a numeric input with a unit selector.

It is designed for **measurement entry** such as weight or volume and
ensures both the numeric value and the unit remain visually and logically grouped.

---

## Visual structure

The field renders a joined input group where:

• the numeric input occupies flexible width  
• the unit selector attaches to the right edge  
• both controls share a single outer border  

This pattern prevents layout gaps and keeps measurement units visually tied
to their values.

---

## Typical usage

This component is used inside form UIs that collect measurable item attributes.

Examples:

• weight entry  
• volume entry  
• size or dimension fields  

In Beggy it appears in:

• CreateItemFormUI  
• UpdateItemFormUI

---

## Interaction model

The user:

1. enters a numeric value
2. selects the measurement unit

Both fields are controlled through **react-hook-form Controllers**.

The component itself contains **no validation logic**.

---

## Error handling

The field can display errors for:

• the numeric value  
• the unit selector  

When either field has an error:

• the group border becomes destructive  
• error text appears below the field

---

## Accessibility

• Both controls expose descriptive aria labels  
• Error messages are connected through aria-describedby  
• Validation messages use role="alert"  
• Keyboard navigation works across input and select

---

## Design-system behavior

This component implements Beggy's **joined input group pattern**:

• shared border container  
• focus-within ring handling  
• seamless control attachment  
• consistent error styling
`,
			},
		},
	},

	argTypes: {
		control: { table: { disable: true } },
		errors: { table: { disable: true } },

		valueName: {
			control: 'text',
			description: 'Field name for the numeric value.',
			table: {
				type: { summary: 'string' },
			},
		},

		unitName: {
			control: 'text',
			description: 'Field name for the unit selector.',
			table: {
				type: { summary: 'string' },
			},
		},

		label: {
			control: 'text',
			description: 'Label displayed above the measurement field.',
			table: {
				type: { summary: 'string' },
			},
		},

		placeholder: {
			control: 'text',
			description: 'Placeholder for the numeric input.',
			table: {
				type: { summary: 'string' },
				defaultValue: { summary: '0.0' },
			},
		},

		unitOptions: {
			control: false,
			description: 'List of available unit options.',
			table: {
				type: { summary: 'UnitOption[]' },
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof MeasurementField>;

export const Default: Story = {
	render: (args) => (
		<FormWrapper
			{...args}
			valueName="weight"
			unitName="weightUnit"
			label="Weight"
			unitOptions={weightUnitOptions}
			valueErrorId="weight-error"
			unitErrorId="weight-unit-error"
		/>
	),

	parameters: {
		docs: {
			description: {
				story: 'Basic measurement field configured for weight input. Demonstrates the joined numeric input and unit selector using the default kilogram unit.',
			},
		},
	},
};

export const WithValue: Story = {
	render: (args) => {
		const form = useForm<FormValues>({
			defaultValues: {
				weight: 0.25,
				weightUnit: WeightUnit.GRAM,
			},
		});

		return (
			<div style={{ width: 360 }}>
				<MeasurementField
					{...args}
					control={form.control}
					errors={form.formState.errors}
					valueName="weight"
					unitName="weightUnit"
					label="Weight"
					unitOptions={weightUnitOptions}
					valueErrorId="weight-error"
					unitErrorId="weight-unit-error"
				/>
			</div>
		);
	},

	parameters: {
		docs: {
			description: {
				story: 'Shows the field populated with an existing value and unit. Useful for verifying how the component renders when editing an existing measurement.',
			},
		},
	},
};

export const WeightField: Story = {
	render: (args) => (
		<FormWrapper
			{...args}
			label="Weight"
			valueName="weight"
			unitName="weightUnit"
			unitOptions={weightUnitOptions}
			valueErrorId="weight-error"
			unitErrorId="weight-unit-error"
		/>
	),

	parameters: {
		docs: {
			description: {
				story: 'Measurement field configured specifically for weight entry using the available weight units defined in the shared unit metadata.',
			},
		},
	},
};

export const VolumeField: Story = {
	render: (args) => (
		<FormWrapper
			{...args}
			label="Volume"
			valueName="volume"
			unitName="volumeUnit"
			unitOptions={volumeUnitOptions}
			valueErrorId="volume-error"
			unitErrorId="volume-unit-error"
		/>
	),

	parameters: {
		docs: {
			description: {
				story: 'Measurement field configured for volume input using liter and milliliter units from the shared volume metadata.',
			},
		},
	},
};

export const WeightAndVolume: Story = {
	render: (args) => {
		const form = useForm<FormValues>({
			defaultValues: {},
		});

		return (
			<div className="space-y-4 w-[360px]">
				<MeasurementField
					{...args}
					control={form.control}
					errors={form.formState.errors}
					label="Weight"
					valueName="weight"
					unitName="weightUnit"
					unitOptions={weightUnitOptions}
					valueErrorId="weight-error"
					unitErrorId="weight-unit-error"
				/>

				<MeasurementField
					{...args}
					control={form.control}
					errors={form.formState.errors}
					label="Volume"
					valueName="volume"
					unitName="volumeUnit"
					unitOptions={volumeUnitOptions}
					valueErrorId="volume-error"
					unitErrorId="volume-unit-error"
				/>
			</div>
		);
	},
	parameters: {
		docs: {
			description: {
				story: 'Displays two MeasurementField components together, simulating the real layout used in item forms where both weight and volume are collected.',
			},
		},
	},
};

export const ErrorState: Story = {
	render: (args) => {
		const form = useForm<FormValues>({
			defaultValues: {},
		});

		useEffect(() => {
			form.setError('weight', { message: 'Weight is required' });
		}, [form]);

		return (
			<div style={{ width: 360 }}>
				<MeasurementField
					{...args}
					control={form.control}
					errors={form.formState.errors}
					label="Weight"
					valueName="weight"
					unitName="weightUnit"
					unitOptions={weightUnitOptions}
					valueErrorId="weight-error"
					unitErrorId="weight-unit-error"
				/>
			</div>
		);
	},

	parameters: {
		docs: {
			description: {
				story: 'Demonstrates the error state when validation fails. The field group border turns destructive and the error message is announced via role="alert".',
			},
		},
	},
};

export const DarkMode: Story = {
	render: (args) => (
		<FormWrapper
			{...args}
			label="Weight"
			valueName="weight"
			unitName="weightUnit"
			unitOptions={weightUnitOptions}
			valueErrorId="weight-error"
			unitErrorId="weight-unit-error"
		/>
	),

	parameters: {
		themes: { default: 'dark' },
		docs: {
			description: {
				story: 'Validates color tokens, contrast, and focus states when the component is rendered in dark theme.',
			},
		},
	},
};
