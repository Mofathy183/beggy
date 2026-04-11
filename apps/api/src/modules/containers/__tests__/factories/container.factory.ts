import { faker } from '@faker-js/faker';
import type { Container, ContainerItems, Item } from '@prisma-generated/client';
import { ContainerType } from '@prisma-generated/client';

import { buildItem } from '@modules/items/__tests__/factories/item.factory';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type ContainerFactoryOverrides = Partial<
	Pick<Container, 'type' | 'maxCapacity' | 'maxWeight' | 'emptyWeight'>
>;

type ContainerFactoryOmitFields = Omit<
	Container,
	'id' | 'createdAt' | 'updatedAt'
>;

type ContainerFactoryOptions = {
	containerItems?: (ContainerItems & { item: Item })[];
};

// ─────────────────────────────────────────────────────────────────────────────
// CONTAINER INPUT FACTORY (NON-PERSISTED)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a valid **non-persisted** Container input shape.
 *
 * Use for:
 * - DTO validation
 * - service inputs
 * - schema tests
 *
 * IMPORTANT:
 * - Does NOT generate id or timestamps
 */
export const containerFactory = (
	userId?: string,
	overrides: ContainerFactoryOverrides = {}
): ContainerFactoryOmitFields => ({
	type: overrides.type ?? ContainerType.BAG,

	maxCapacity:
		overrides.maxCapacity ?? faker.number.int({ min: 20, max: 120 }),

	maxWeight:
		overrides.maxWeight ??
		faker.number.float({ min: 5, max: 32, fractionDigits: 2 }),

	emptyWeight:
		overrides.emptyWeight ??
		faker.number.float({ min: 0.5, max: 5, fractionDigits: 2 }),

	userId: userId ?? null,
});

// ─────────────────────────────────────────────────────────────────────────────
// CONTAINER ITEMS FACTORY (CRITICAL)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds packed container items with linked Item entities.
 *
 * Use for:
 * - mapper tests
 * - metrics calculations
 * - container state scenarios
 */
export const buildContainerItems = (
	count: number,
	userId: string,
	overrides: Partial<ContainerItems> = {}
): (ContainerItems & { item: Item })[] =>
	Array.from({ length: count }, () => {
		const item = buildItem(userId);

		return {
			containerId: faker.string.uuid(),
			itemId: item.id,
			quantity:
				overrides.quantity ?? faker.number.int({ min: 1, max: 5 }),

			createdAt: faker.date.past(),
			updatedAt: faker.date.recent(),

			...overrides,

			item,
		};
	});

// ─────────────────────────────────────────────────────────────────────────────
// PERSISTED CONTAINER FACTORY (SINGLE)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds a **persisted** Container with optional packed items.
 *
 * Use for:
 * - mapper input (ContainerMapper)
 * - service return values
 * - business logic tests
 */
export const buildContainer = (
	userId: string,
	overrides: ContainerFactoryOverrides = {},
	options: ContainerFactoryOptions = {}
): Container & { containerItems: (ContainerItems & { item: Item })[] } => ({
	id: faker.string.uuid(),

	type: overrides.type ?? ContainerType.BAG,

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

	containerItems: options.containerItems ?? [],
});

// ─────────────────────────────────────────────────────────────────────────────
// PERSISTED CONTAINER LIST
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds multiple persisted containers.
 *
 * Use for:
 * - list endpoints
 * - pagination
 * - multi-container scenarios
 */
export const buildContainers = (
	count: number,
	userId: string,
	overrides: ContainerFactoryOverrides = {},
	options: ContainerFactoryOptions = {}
): (Container & {
	containerItems: (ContainerItems & { item: Item })[];
})[] =>
	Array.from({ length: count }, () =>
		buildContainer(userId, overrides, options)
	);
