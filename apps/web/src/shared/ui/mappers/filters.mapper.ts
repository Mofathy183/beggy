import { WeightUnit, VolumeUnit } from '@beggy/shared/constants';

/**
 * UnitMeta
 *
 * Describes metadata and normalization logic for a measurable unit.
 *
 * This abstraction allows:
 * - Display-friendly labels and symbols in the UI
 * - Safe conversion into a canonical "base unit" for filtering and comparison
 *
 * @typeParam U - Union of supported unit values (e.g., WeightUnit, VolumeUnit)
 */
export type UnitMeta<U extends string> = {
	/**
	 * Enum value representing the unit.
	 */
	value: U;

	/**
	 * Human-readable label for UI display.
	 */
	label: string;

	/**
	 * Short unit symbol (used in inputs, badges, etc.).
	 */
	symbol: string;

	/**
	 * Converts a value in this unit into the base unit.
	 *
	 * Base Units:
	 * - Weight → kilogram (kg)
	 * - Volume → liter (L)
	 *
	 * This ensures consistent comparisons when filtering,
	 * sorting, or persisting numeric values.
	 */
	toBase: (value: number) => number;
};

/**
 * WEIGHT_UNIT_META
 *
 * Metadata definitions for supported weight units.
 *
 * Base unit: **Kilogram (kg)**
 *
 * All weight values are normalized to kilograms
 * before storage, comparison, or filtering.
 */
export const WEIGHT_UNIT_META: readonly UnitMeta<WeightUnit>[] = [
	{
		value: WeightUnit.KILOGRAM,
		label: 'Kilogram',
		symbol: 'kg',
		toBase: (v) => v,
	},
	{
		value: WeightUnit.GRAM,
		label: 'Gram',
		symbol: 'g',
		toBase: (v) => v / 1000,
	},
	{
		value: WeightUnit.POUND,
		label: 'Pound',
		symbol: 'lb',
		toBase: (v) => v * 0.453592,
	},
	{
		value: WeightUnit.OUNCE,
		label: 'Ounce',
		symbol: 'oz',
		toBase: (v) => v * 0.0283495,
	},
] as const;

/**
 * VOLUME_UNIT_META
 *
 * Metadata definitions for supported volume units.
 *
 * Base unit: **Liter (L)**
 *
 * All volume values are normalized to liters
 * before storage, comparison, or filtering.
 */
export const VOLUME_UNIT_META: readonly UnitMeta<VolumeUnit>[] = [
	{
		value: VolumeUnit.LITER,
		label: 'Liter',
		symbol: 'L',
		toBase: (v) => v,
	},
	{
		value: VolumeUnit.ML,
		label: 'Milliliter',
		symbol: 'ml',
		toBase: (v) => v / 1000,
	},
	{
		value: VolumeUnit.CU_CM,
		label: 'Cubic centimeter',
		symbol: 'cm³',
		toBase: (v) => v / 1000,
	},
	{
		value: VolumeUnit.CU_IN,
		label: 'Cubic inch',
		symbol: 'in³',
		toBase: (v) => v * 0.0163871,
	},
] as const;
