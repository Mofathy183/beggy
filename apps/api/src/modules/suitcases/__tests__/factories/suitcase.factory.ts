import { faker } from '@faker-js/faker';
import {
	SuitcaseType,
	SuitcaseFeature,
	WheelType,
	Size,
	Material,
	ContainerType,
} from '@prisma-generated/client';

import type {
	Suitcase,
	Container,
	ContainerItems,
	Item,
} from '@prisma-generated/client';

import type { SuitcaseWithContainer } from '@modules/suitcases';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type SuitcaseFactoryOverrides = Partial<
	Pick<
		Suitcase,
		| 'id'
		| 'name'
		| 'brand'
		| 'type'
		| 'color'
		| 'size'
		| 'material'
		| 'features'
		| 'wheels'
	>
>;

type ContainerFactoryOverrides = Partial<
	Pick<Container, 'maxCapacity' | 'maxWeight' | 'emptyWeight'>
>;

type SuitcaseFactoryOptions = {
	withDetails?: boolean;
	containerItems?: (ContainerItems & { item: Item })[];
};

// ─────────────────────────────────────────────────────────────────────────────
// CONTAINER FACTORY (SUITCASE VERSION)
// ─────────────────────────────────────────────────────────────────────────────

export const buildSuitcaseContainer = (
	userId: string,
	overrides: ContainerFactoryOverrides = {},
	containerItems: (ContainerItems & { item: Item })[] = []
): Container & { containerItems: (ContainerItems & { item: Item })[] } => ({
	id: faker.string.uuid(),
	type: ContainerType.SUITCASE,
	maxCapacity:
		overrides.maxCapacity ?? faker.number.int({ min: 30, max: 150 }),
	maxWeight:
		overrides.maxWeight ??
		faker.number.float({ min: 10, max: 40, fractionDigits: 2 }),
	emptyWeight:
		overrides.emptyWeight ??
		faker.number.float({ min: 2, max: 8, fractionDigits: 2 }),
	userId,
	createdAt: faker.date.past(),
	updatedAt: faker.date.recent(),
	containerItems,
});

// ─────────────────────────────────────────────────────────────────────────────
// INPUT FACTORY (non-persisted)
// ─────────────────────────────────────────────────────────────────────────────

export const suitcaseFactory = (
	userId: string,
	suitcaseOverrides: SuitcaseFactoryOverrides = {},
	containerOverrides: ContainerFactoryOverrides = {},
	options: SuitcaseFactoryOptions = {}
) => ({
	userId,

	// ── Suitcase fields ───────────────────────────────────────────
	name: suitcaseOverrides.name ?? faker.commerce.productName(),

	brand:
		suitcaseOverrides.brand ??
		(options.withDetails ? faker.company.name() : null),

	type:
		suitcaseOverrides.type ??
		faker.helpers.arrayElement(Object.values(SuitcaseType)),

	size:
		suitcaseOverrides.size ??
		faker.helpers.arrayElement(Object.values(Size)),

	color:
		suitcaseOverrides.color ??
		(options.withDetails ? faker.color.human() : 'black'),

	material:
		suitcaseOverrides.material ??
		(options.withDetails
			? faker.helpers.arrayElement(Object.values(Material))
			: null),

	features:
		suitcaseOverrides.features ??
		(options.withDetails
			? faker.helpers.arrayElements(Object.values(SuitcaseFeature), {
					min: 0,
					max: 4,
				})
			: []),

	wheels:
		suitcaseOverrides.wheels ??
		(options.withDetails
			? faker.helpers.arrayElement(Object.values(WheelType))
			: null),

	// ── Container fields ──────────────────────────────────────────
	maxCapacity:
		containerOverrides.maxCapacity ??
		faker.number.int({ min: 30, max: 150 }),

	maxWeight:
		containerOverrides.maxWeight ??
		faker.number.float({ min: 10, max: 40, fractionDigits: 2 }),

	emptyWeight:
		containerOverrides.emptyWeight ??
		faker.number.float({ min: 2, max: 8, fractionDigits: 2 }),
});

// ─────────────────────────────────────────────────────────────────────────────
// PERSISTED FACTORY (single)
// ─────────────────────────────────────────────────────────────────────────────

export const buildSuitcase = (
	userId: string,
	suitcaseOverrides: SuitcaseFactoryOverrides = {},
	containerOverrides: ContainerFactoryOverrides = {},
	options: SuitcaseFactoryOptions = {}
): SuitcaseWithContainer => {
	const containerId = faker.string.uuid();

	const container = buildSuitcaseContainer(
		userId,
		containerOverrides,
		options.containerItems ?? []
	);

	return {
		id: suitcaseOverrides.id ?? faker.string.uuid(),
		containerId,
		userId,

		// ── Suitcase fields ─────────────────────────────────────────
		name: suitcaseOverrides.name ?? faker.commerce.productName(),

		brand:
			suitcaseOverrides.brand ??
			(options.withDetails ? faker.company.name() : null),

		type:
			suitcaseOverrides.type ??
			faker.helpers.arrayElement(Object.values(SuitcaseType)),

		size:
			suitcaseOverrides.size ??
			faker.helpers.arrayElement(Object.values(Size)),

		color:
			suitcaseOverrides.color ??
			(options.withDetails ? faker.color.human() : 'black'),

		material:
			suitcaseOverrides.material ??
			(options.withDetails
				? faker.helpers.arrayElement(Object.values(Material))
				: null),

		features:
			suitcaseOverrides.features ??
			(options.withDetails
				? faker.helpers.arrayElements(Object.values(SuitcaseFeature), {
						min: 0,
						max: 4,
					})
				: []),

		wheels:
			suitcaseOverrides.wheels ??
			(options.withDetails
				? faker.helpers.arrayElement(Object.values(WheelType))
				: null),

		createdAt: faker.date.past(),
		updatedAt: faker.date.recent(),

		// ── Container ───────────────────────────────────────────────
		container: {
			...container,
			id: containerId,
		},
	};
};

// ─────────────────────────────────────────────────────────────────────────────
// LIST FACTORY
// ─────────────────────────────────────────────────────────────────────────────

export const buildSuitcases = (
	count: number,
	userId: string,
	suitcaseOverrides: SuitcaseFactoryOverrides = {},
	containerOverrides: ContainerFactoryOverrides = {},
	options: SuitcaseFactoryOptions = {}
): SuitcaseWithContainer[] =>
	Array.from({ length: count }, () =>
		buildSuitcase(userId, suitcaseOverrides, containerOverrides, options)
	);
