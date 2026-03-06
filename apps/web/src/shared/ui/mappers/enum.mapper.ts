import { Gender, Role, ItemCategory } from '@beggy/shared/constants';

import type { IconSvgElement } from '@hugeicons/react';
import {
	Male02Icon,
	Female02Icon,
	User02Icon,
	LaptopIcon,
	Sofa01Icon,
	MedicineBottleIcon,
	TShirtIcon,
	BookOpen01Icon,
	Apple01Icon,
	ShampooIcon,
	File02Icon,
	DumbbellIcon,
	Backpack01Icon,
} from '@hugeicons/core-free-icons';

/**
 * Represents a UI-friendly option derived from a domain enum.
 *
 * Used by form controls, dropdowns, filters, and other UI components
 * that need a human-readable label and optional visual metadata.
 *
 * @template E Enum value type
 */
type UiEnumOptions<E extends string> = {
	/** Enum value used internally by the application */
	value: E;

	/** Human-readable label displayed in the UI */
	label: string;

	/** Optional icon associated with the value */
	icon?: IconSvgElement;

	/** Marks the option as unavailable for selection */
	disabled?: boolean;
};

/**
 * UI metadata for {@link Role} enum values.
 *
 * Used in role selectors, admin panels, and user management UIs.
 */
export const ROLE_OPTIONS = [
	{
		value: Role.USER,
		label: 'User',
	},
	{
		value: Role.MODERATOR,
		label: 'Moderator',
	},
	{
		value: Role.MEMBER,
		label: 'Member',
	},
	{
		value: Role.ADMIN,
		label: 'Admin',
	},
] as const satisfies readonly UiEnumOptions<Role>[];

/**
 * UI metadata for {@link Gender} enum values.
 *
 * Primarily used in profile forms and user-related settings.
 */
export const GENDER_OPTIONS = [
	{
		value: Gender.MALE,
		label: 'Male',
		icon: Male02Icon,
	},
	{
		value: Gender.FEMALE,
		label: 'Female',
		icon: Female02Icon,
	},
	{
		value: Gender.OTHER,
		label: 'Other',
		icon: User02Icon,
	},
] as const satisfies readonly UiEnumOptions<Gender>[];

/**
 * UI metadata for {@link ItemCategory} enum values.
 *
 * Provides display labels and icons for item categorization
 * across inventory, packing lists, and item creation forms.
 */
export const ITEM_CATEGORY_OPTIONS = [
	{
		value: ItemCategory.ELECTRONICS,
		label: 'Electronics',
		icon: LaptopIcon,
	},
	{
		value: ItemCategory.ACCESSORIES,
		label: 'Accessories',
		icon: Backpack01Icon,
	},
	{
		value: ItemCategory.FURNITURE,
		label: 'Furniture',
		icon: Sofa01Icon,
	},
	{
		value: ItemCategory.MEDICINE,
		label: 'Medicine',
		icon: MedicineBottleIcon,
	},
	{
		value: ItemCategory.CLOTHING,
		label: 'Clothing',
		icon: TShirtIcon,
	},
	{
		value: ItemCategory.BOOKS,
		label: 'Books',
		icon: BookOpen01Icon,
	},
	{
		value: ItemCategory.FOOD,
		label: 'Food',
		icon: Apple01Icon,
	},
	{
		value: ItemCategory.TOILETRIES,
		label: 'Toiletries',
		icon: ShampooIcon,
	},
	{
		value: ItemCategory.DOCUMENTS,
		label: 'Documents',
		icon: File02Icon,
	},
	{
		value: ItemCategory.SPORTS,
		label: 'Sports',
		icon: DumbbellIcon,
	},
] as const satisfies readonly UiEnumOptions<ItemCategory>[];
