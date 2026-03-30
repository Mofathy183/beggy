import { faker } from '@faker-js/faker';
import {
	BagType,
	BagFeature,
	Size,
	Material,
	ContainerType,
} from '@prisma-generated/client';
import type {
	Bag,
	Container,
	ContainerItems,
	Item,
} from '@prisma-generated/client';
import type { BagWithContainer } from '@modules/bags';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fields the caller can override on the Bag record itself.
 *
 * @remarks
 * Physical constraint fields (maxCapacity, maxWeight, emptyWeight)
 * live on the Container and are overridable via ContainerFactoryOverrides.
 */
type BagFactoryOverrides = Partial<
	Pick<
		Bag,
		'id' | 'name' | 'type' | 'color' | 'size' | 'material' | 'features'
	>
>;

/**
 * Fields the caller can override on the Container record.
 */
type ContainerFactoryOverrides = Partial<
	Pick<Container, 'maxCapacity' | 'maxWeight' | 'emptyWeight'>
>;

/**
 * Optional configuration flags shared across all bag factories.
 */
type BagFactoryOptions = {
	/**
	 * When enabled, optional descriptive fields
	 * (color, material, features) are populated
	 * with realistic fake data.
	 *
	 * Defaults to `false` to reflect minimal real-world creation.
	 */
	withDetails?: boolean;

	/**
	 * Pre-built ContainerItems to include in the container.
	 *
	 * Useful when testing weight/capacity calculations
	 * with specific item configurations.
	 *
	 * Defaults to an empty array (empty container).
	 */
	containerItems?: (ContainerItems & { item: Item })[];
};

// ─────────────────────────────────────────────────────────────────────────────
// CONTAINER FACTORY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds a raw Prisma Container record.
 *
 * @remarks
 * - Used internally by bag factories.
 * - Can be used standalone when testing container-level logic.
 * - `containerItems` defaults to [] to represent an empty container.
 *
 * @param userId - Owner identifier.
 * @param overrides - Field-level overrides for the Container record.
 * @param containerItems - Pre-built packed items (for metrics testing).
 */
export const buildContainer = (
	userId: string,
	overrides: ContainerFactoryOverrides = {},
	containerItems: (ContainerItems & { item: Item })[] = []
): Container & { containerItems: (ContainerItems & { item: Item })[] } => ({
	id: faker.string.uuid(),
	type: ContainerType.BAG,
	maxCapacity:
		overrides.maxCapacity ?? faker.number.int({ min: 20, max: 120 }),
	maxWeight:
		overrides.maxWeight ??
		faker.number.float({ min: 5, max: 32, fractionDigits: 2 }),
	emptyWeight:
		overrides.emptyWeight ??
		faker.number.float({ min: 0.5, max: 5, fractionDigits: 2 }),
	userId,
	createdAt: faker.date.past(),
	updatedAt: faker.date.recent(),
	containerItems,
});

// ─────────────────────────────────────────────────────────────────────────────
// BAG INPUT FACTORY (non-persisted)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a valid **non-persisted** Bag input shape.
 *
 * Use this factory when testing:
 * - Service `createBag` / `updateBag` inputs
 * - Request body validation
 * - Prisma `create` data payloads before they hit the DB
 *
 * @remarks
 * - Does NOT generate `id`, `createdAt`, `updatedAt`, or `containerId`.
 * - Physical constraint fields are included here because the service
 *   receives them together with bag fields before splitting them.
 * - `userId` is required and must be provided explicitly.
 */
export const bagFactory = (
	userId: string,
	bagOverrides: BagFactoryOverrides = {},
	containerOverrides: ContainerFactoryOverrides = {},
	options: BagFactoryOptions = {}
) => ({
	userId,

	// ── Bag fields ──────────────────────────────────────────────────────────
	name: bagOverrides.name ?? faker.commerce.productName(),
	type:
		bagOverrides.type ?? faker.helpers.arrayElement(Object.values(BagType)),
	size: bagOverrides.size ?? faker.helpers.arrayElement(Object.values(Size)),
	color:
		bagOverrides.color ??
		(options.withDetails ? faker.color.human() : 'black'),
	material:
		bagOverrides.material ??
		(options.withDetails
			? faker.helpers.arrayElement(Object.values(Material))
			: null),
	features:
		bagOverrides.features ??
		(options.withDetails
			? faker.helpers.arrayElements(Object.values(BagFeature), {
					min: 0,
					max: 3,
				})
			: []),

	// ── Container fields (routed to Container record by the service) ─────────
	maxCapacity:
		containerOverrides.maxCapacity ??
		faker.number.int({ min: 20, max: 120 }),
	maxWeight:
		containerOverrides.maxWeight ??
		faker.number.float({ min: 5, max: 32, fractionDigits: 2 }),
	emptyWeight:
		containerOverrides.emptyWeight ??
		faker.number.float({ min: 0.5, max: 5, fractionDigits: 2 }),
});

// ─────────────────────────────────────────────────────────────────────────────
// PERSISTED BAG FACTORY (single)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds a **persisted** Prisma Bag entity with its backing Container.
 *
 * Use this factory when testing:
 * - Service return values (`getBagById`, `createBag`, `updateBag`)
 * - Mapper input (`BagMapper.toDTO`)
 * - Ownership and authorization rules
 * - Weight / capacity / status calculations
 *
 * @remarks
 * - Generates realistic `id`, `containerId`, `createdAt`, `updatedAt`.
 * - Returns `BagWithContainer` — the exact shape the service returns.
 * - Pass `containerItems` in options to test non-empty containers.
 *
 * @param userId - Owner identifier.
 * @param bagOverrides - Bag-level field overrides.
 * @param containerOverrides - Container-level field overrides.
 * @param options - Factory behaviour flags.
 */
export const buildBag = (
	userId: string,
	bagOverrides: BagFactoryOverrides = {},
	containerOverrides: ContainerFactoryOverrides = {},
	options: BagFactoryOptions = {}
): BagWithContainer => {
	const containerId = faker.string.uuid();

	const container = buildContainer(
		userId,
		containerOverrides,
		options.containerItems ?? []
	);

	return {
		id: bagOverrides.id ?? faker.string.uuid(),
		containerId,
		userId,

		// ── Bag fields ────────────────────────────────────────────────────────
		name: bagOverrides.name ?? faker.commerce.productName(),
		type:
			bagOverrides.type ??
			faker.helpers.arrayElement(Object.values(BagType)),
		size:
			bagOverrides.size ??
			faker.helpers.arrayElement(Object.values(Size)),
		color:
			bagOverrides.color ??
			(options.withDetails ? faker.color.human() : 'black'),
		material:
			bagOverrides.material ??
			(options.withDetails
				? faker.helpers.arrayElement(Object.values(Material))
				: null),
		features:
			bagOverrides.features ??
			(options.withDetails
				? faker.helpers.arrayElements(Object.values(BagFeature), {
						min: 0,
						max: 3,
					})
				: []),

		createdAt: faker.date.past(),
		updatedAt: faker.date.recent(),

		// ── Container (with packed items for metric derivation) ───────────────
		container: {
			...container,
			id: containerId,
		},
	};
};

// ─────────────────────────────────────────────────────────────────────────────
// PERSISTED BAG LIST FACTORY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds a list of **persisted** Prisma Bag entities.
 *
 * Use this factory when testing:
 * - `listBags` service method
 * - Pagination logic
 * - Ownership scenarios across multiple bags
 * - Mapper batch conversion (`BagMapper.toDTOList`)
 *
 * @remarks
 * - All bags belong to the provided `userId`.
 * - Each bag is generated independently with a unique container.
 * - Use `bagOverrides` to pin shared fields across all bags (e.g. same type).
 *
 * @param count - Number of bags to generate.
 * @param userId - Owner identifier.
 * @param bagOverrides - Bag-level overrides applied to every bag.
 * @param containerOverrides - Container-level overrides applied to every bag.
 * @param options - Factory behaviour flags.
 */
export const buildBags = (
	count: number,
	userId: string,
	bagOverrides: BagFactoryOverrides = {},
	containerOverrides: ContainerFactoryOverrides = {},
	options: BagFactoryOptions = {}
): BagWithContainer[] =>
	Array.from({ length: count }, () =>
		buildBag(userId, bagOverrides, containerOverrides, options)
	);
