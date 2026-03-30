import {
	Gender,
	Role,
	ItemCategory,
	BagType,
	Size,
	Material,
	BagFeature,
	ContainerStatus,
	ContainerStatusReason,
} from '@beggy/shared/constants';

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

	// Size
	CircleIcon,
	SquareArrowExpand01Icon,
	SquareArrowHorizontalIcon,
	MaximizeIcon,

	// Material
	ShieldIcon,
	FireIcon,
	FlowerIcon,
	Diamond01Icon,
	Layers01Icon,
	HexagonIcon,
	Grid02Icon,
	HandBag02Icon,

	// Feature
	DropletIcon,
	LaptopPhoneSyncIcon,
	MobileNavigator01Icon,
	SecurityLockIcon,
	PackageIcon,
	WeightScaleIcon,
	Expand,
	ShoppingBag03Icon,
	HandBag01Icon,
	TravelBagIcon,
	Briefcase02Icon,
	Briefcase01Icon,
	ShoppingBag01Icon,
	RowDeleteIcon,
	BriefcaseIcon as TrolleyIcon,
	EyeIcon,
	ShieldKeyIcon,

	// ContainerStatus
	CheckmarkCircle01Icon,
	InboxIcon,
	WeightIcon,
	PackageRemoveIcon,
} from '@hugeicons/core-free-icons';

/**
 * Represents a UI-friendly option derived from a domain enum.
 *
 * Used by form controls, dropdowns, filters, and other UI components
 * that need a human-readable label and optional visual metadata.
 *
 * @template E Enum value type
 */
export type UiEnumOptions<E extends string> = {
	/** Enum value used internally by the application */
	value: E;

	/** Human-readable label displayed in the UI */
	label: string;

	/**
	 * Short label for compact contexts (badges, chips, table cells).
	 * Falls back to `label` if not provided.
	 */
	shortLabel?: string;

	/** Optional icon associated with the value */
	icon?: IconSvgElement;

	/** Marks the option as unavailable for selection */
	disabled?: boolean;
};

/**
 * Retrieves the display label associated with a given enum value.
 *
 * @template E Enum value type
 * @param options UI option definitions derived from an enum
 * @param value Enum value to resolve
 * @returns The corresponding label, or `undefined` if the value is not present
 *
 * @remarks
 * This helper avoids duplicating `.find(...).label` logic across
 * forms, filters, and UI components when rendering enum values.
 *
 * @example
 * getEnumLabel(BAG_TYPE_OPTIONS, BagType.BACKPACK) // "Backpack"
 * getEnumLabel(SIZE_OPTIONS, Size.EXTRA_LARGE)     // "Extra large"
 */
export function getEnumLabel<E extends string>(
	options: readonly UiEnumOptions<E>[],
	value?: E
) {
	return options.find((o) => o.value === value)?.label;
}

/**
 * Retrieves the short label for compact display.
 * Falls back to the full label if no `shortLabel` is defined.
 */
export function getEnumShortLabel<E extends string>(
	options: readonly UiEnumOptions<E>[],
	value?: E
): string | undefined {
	const opt = options.find((o) => o.value === value);
	return opt?.shortLabel ?? opt?.label;
}

/**
 * Retrieves the icon for a given enum value.
 */
export function getEnumIcon<E extends string>(
	options: readonly UiEnumOptions<E>[],
	value?: E
): IconSvgElement | undefined {
	return options.find((o) => o.value === value)?.icon;
}

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

// ─── BagType ──────────────────────────────────────────────────────────────────

/**
 * UI metadata for {@link BagType} enum values.
 *
 * Used in:
 * - Bag type badges (card header)
 * - Create/edit form type selectors
 * - Filter chips in `BagsFilters`
 *
 * @remarks
 * Icons reinforce the physical nature of each bag type,
 * helping users build their personal inventory more confidently.
 */
export const BAG_TYPE_OPTIONS = [
	{
		value: BagType.BACKPACK,
		label: 'Backpack',
		icon: Backpack01Icon,
	},
	{
		value: BagType.DUFFEL,
		label: 'Duffel',
		icon: ShoppingBag01Icon,
	},
	{
		value: BagType.TOTE,
		label: 'Tote',
		icon: ShoppingBag01Icon,
	},
	{
		value: BagType.MESSENGER,
		label: 'Messenger',
		icon: Briefcase02Icon,
	},
	{
		value: BagType.LAPTOP_BAG,
		label: 'Laptop bag',
		icon: LaptopIcon,
	},
	{
		value: BagType.TRAVEL_BAG,
		label: 'Travel bag',
		icon: TravelBagIcon,
	},
	{
		value: BagType.HANDBAG,
		label: 'Handbag',
		icon: HandBag01Icon,
	},
	{
		value: BagType.CROSSBODY,
		label: 'Crossbody',
		icon: Briefcase01Icon,
	},
	{
		value: BagType.SHOULDER_BAG,
		label: 'Shoulder bag',
		icon: ShoppingBag03Icon,
	},
] as const satisfies readonly UiEnumOptions<BagType>[];

// ─── Size ─────────────────────────────────────────────────────────────────────

/**
 * UI metadata for {@link Size} enum values.
 *
 * Used in:
 * - Size badges (compact: `shortLabel`; detail: `label`)
 * - Filter chips (single-select)
 * - Form size selector
 *
 * @remarks
 * `shortLabel` is critical here — "Extra large" in a badge
 * inside a card header is too wide. Always use `shortLabel`
 * in `BagSizeBadge` and filter chips.
 */
export const SIZE_OPTIONS = [
	{
		value: Size.SMALL,
		label: 'Small',
		shortLabel: 'S',
		icon: CircleIcon,
	},
	{
		value: Size.MEDIUM,
		label: 'Medium',
		shortLabel: 'M',
		icon: SquareArrowHorizontalIcon,
	},
	{
		value: Size.LARGE,
		label: 'Large',
		shortLabel: 'L',
		icon: SquareArrowExpand01Icon,
	},
	{
		value: Size.EXTRA_LARGE,
		label: 'Extra large',
		shortLabel: 'XL',
		icon: MaximizeIcon,
	},
] as const satisfies readonly UiEnumOptions<Size>[];

// ─── Material ─────────────────────────────────────────────────────────────────

/**
 * UI metadata for {@link Material} enum values.
 *
 * Used in:
 * - Material badge (card header, detail page)
 * - Filter chips in `BagsFilters`
 * - Form material selector
 *
 * @remarks
 * Material is supplementary metadata — muted styling is intentional.
 * Icons convey the material's physical character at a glance.
 */
export const MATERIAL_OPTIONS = [
	{
		value: Material.LEATHER,
		label: 'Leather',
		icon: Diamond01Icon,
	},
	{
		value: Material.SYNTHETIC,
		label: 'Synthetic',
		icon: FlowerIcon,
	},
	{
		value: Material.FABRIC,
		label: 'Fabric',
		icon: Grid02Icon,
	},
	{
		value: Material.POLYESTER,
		label: 'Polyester',
		icon: FireIcon,
	},
	{
		value: Material.NYLON,
		label: 'Nylon',
		icon: Layers01Icon,
	},
	{
		value: Material.CANVAS,
		label: 'Canvas',
		icon: HandBag02Icon,
	},
	{
		value: Material.HARD_SHELL,
		label: 'Hard shell',
		icon: ShieldIcon,
	},
	{
		value: Material.METAL,
		label: 'Metal',
		icon: HexagonIcon,
	},
] as const satisfies readonly UiEnumOptions<Material>[];

// ─── BagFeature ───────────────────────────────────────────────────────────────

/**
 * UI metadata for {@link BagFeature} enum values.
 *
 * Used in:
 * - `BagFeatureChips` (card + detail page)
 * - Create/edit form feature multi-select
 * - Filter chips in `BagsFilters`
 *
 * @remarks
 * Features are ALWAYS rendered as chips, not badges.
 * They represent a collection, not a single semantic state.
 *
 * `shortLabel` is essential — "Padded laptop compartment" is 27 chars.
 * Use `shortLabel` in `BagFeatureChips` and anywhere space is constrained.
 */
export const BAG_FEATURE_OPTIONS = [
	{
		value: BagFeature.WATERPROOF,
		label: 'Waterproof',
		shortLabel: 'Waterproof',
		icon: DropletIcon,
	},
	{
		value: BagFeature.PADDED_LAPTOP_COMPARTMENT,
		label: 'Padded laptop compartment',
		shortLabel: 'Laptop slot',
		icon: LaptopPhoneSyncIcon,
	},
	{
		value: BagFeature.USB_PORT,
		label: 'USB port',
		shortLabel: 'USB port',
		icon: MobileNavigator01Icon,
	},
	{
		value: BagFeature.ANTI_THEFT,
		label: 'Anti-theft',
		shortLabel: 'Anti-theft',
		icon: SecurityLockIcon,
	},
	{
		value: BagFeature.MULTIPLE_POCKETS,
		label: 'Multiple pockets',
		shortLabel: 'Multi-pocket',
		icon: PackageIcon,
	},
	{
		value: BagFeature.LIGHTWEIGHT,
		label: 'Lightweight',
		shortLabel: 'Lightweight',
		icon: WeightScaleIcon,
	},
	{
		value: BagFeature.EXPANDABLE,
		label: 'Expandable',
		shortLabel: 'Expandable',
		icon: Expand,
	},
	{
		value: BagFeature.REINFORCED_STRAPS,
		label: 'Reinforced straps',
		shortLabel: 'Reinforced',
		icon: RowDeleteIcon,
	},
	{
		value: BagFeature.TROLLEY_SLEEVE,
		label: 'Trolley sleeve',
		shortLabel: 'Trolley sleeve',
		icon: TrolleyIcon,
	},
	{
		value: BagFeature.HIDDEN_POCKET,
		label: 'Hidden pocket',
		shortLabel: 'Hidden pocket',
		icon: EyeIcon,
	},
	{
		value: BagFeature.RFID_BLOCKING,
		label: 'RFID blocking',
		shortLabel: 'RFID',
		icon: ShieldKeyIcon,
	},
] as const satisfies readonly UiEnumOptions<BagFeature>[];

// ─── ContainerStatus ──────────────────────────────────────────────────────────

/**
 * UI metadata for ContainerStatus.
 *
 * Shared between bags and suitcases — lives in shared layer.
 *
 * Badge variant intent:
 *   OK            → 'success'     (within limits)
 *   FULL          → 'warning'     (at limit, still functional)
 *   EMPTY         → 'secondary'   (neutral, not an error)
 *   OVERWEIGHT    → 'destructive' (exceeds weight)
 *   OVER_CAPACITY → 'destructive' (exceeds volume, distinct label+icon)
 */
export const CONTAINER_STATUS_OPTIONS = [
	{
		value: ContainerStatus.OK,
		label: 'Good to go',
		shortLabel: 'OK',
		icon: CheckmarkCircle01Icon,
	},
	{
		value: ContainerStatus.FULL,
		label: 'Full',
		shortLabel: 'Full',
		icon: PackageIcon,
	},
	{
		value: ContainerStatus.EMPTY,
		label: 'Empty',
		shortLabel: 'Empty',
		icon: InboxIcon,
	},
	{
		value: ContainerStatus.OVERWEIGHT,
		label: 'Overweight',
		shortLabel: 'Overweight',
		icon: WeightIcon,
	},
	{
		value: ContainerStatus.OVER_CAPACITY,
		label: 'Over capacity',
		shortLabel: 'Over capacity',
		icon: PackageRemoveIcon,
	},
] as const satisfies readonly UiEnumOptions<ContainerStatus>[];

/** Maps ContainerStatus → shadcn Badge variant prop. Single source of truth. */
export const CONTAINER_STATUS_BADGE_VARIANT = {
	[ContainerStatus.OK]: 'success',
	[ContainerStatus.FULL]: 'warning',
	[ContainerStatus.EMPTY]: 'secondary',
	[ContainerStatus.OVERWEIGHT]: 'destructive',
	[ContainerStatus.OVER_CAPACITY]: 'destructive',
} as const satisfies Record<ContainerStatus, string>;

/** Maps ContainerStatus → Progress bar indicator class ([&>div] targets inner track). */
export const CONTAINER_STATUS_PROGRESS_CLASS = {
	[ContainerStatus.OK]: '[&>div]:bg-success',
	[ContainerStatus.FULL]: '[&>div]:bg-warning',
	[ContainerStatus.EMPTY]: '[&>div]:bg-muted-foreground',
	[ContainerStatus.OVERWEIGHT]: '[&>div]:bg-destructive',
	[ContainerStatus.OVER_CAPACITY]: '[&>div]:bg-destructive',
} as const satisfies Record<ContainerStatus, string>;

/**
 * UI metadata for ContainerStatusReason.
 *
 * Shared between bags and suitcases.
 * Rendered as small muted chips on detail pages only — never in list cards.
 */
export const CONTAINER_STATUS_REASON_OPTIONS = [
	{
		value: ContainerStatusReason.WEIGHT_OVER_LIMIT,
		label: 'Weight over limit',
		icon: WeightIcon,
	},
	{
		value: ContainerStatusReason.WEIGHT_NEAR_LIMIT,
		label: 'Approaching weight limit',
		icon: WeightScaleIcon,
	},
	{
		value: ContainerStatusReason.CAPACITY_OVER_LIMIT,
		label: 'Capacity exceeded',
		icon: PackageRemoveIcon,
	},
	{
		value: ContainerStatusReason.CAPACITY_NEAR_LIMIT,
		label: 'Nearing capacity',
		icon: PackageIcon,
	},
	{
		value: ContainerStatusReason.EMPTY,
		label: 'No items packed yet',
		icon: InboxIcon,
	},
] as const satisfies readonly UiEnumOptions<ContainerStatusReason>[];
