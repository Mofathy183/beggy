import type { PrismaClientType } from '@prisma';
import { type Bag, ContainerType } from '@prisma-generated/client';
import type {
	BagFilterInput,
	BagOrderByInput,
	CreateBagInput,
	UpdateBagInput,
	PaginationMeta,
} from '@beggy/shared/types';
import { ErrorCode } from '@beggy/shared/constants';
import { BaseService } from '@shared/core';
import type { PaginationPayload } from '@shared/types';
import { buildBagQuery, buildMeta } from '@shared/utils';
import type { BagWithContainer } from '@modules/bags';

/**
 * Domain service responsible for managing user-owned bags.
 *
 * @description
 * Encapsulates bag lifecycle operations while enforcing strict tenant isolation.
 * Coordinates persistence across Bag and Container aggregates.
 *
 * @remarks
 * - All operations are scoped by `userId`.
 * - Throws domain-level errors only (no transport concerns).
 * - Bag ↔ Container is a required 1:1 relationship.
 */
export class BagService extends BaseService {
	constructor(private readonly prisma: PrismaClientType) {
		super({ domain: 'bags', service: 'BagService' });
	}

	/**
	 * Prisma include fragment required for downstream DTO mapping.
	 *
	 * @remarks
	 * Must stay in sync with {@link BagWithContainer}.
	 * Missing relations will break mapper assumptions at runtime.
	 */
	private readonly bagInclude = {
		container: {
			include: {
				containerItems: {
					include: {
						item: true,
					},
				},
			},
		},
	} as const;

	/**
	 * Returns paginated bags belonging to a user.
	 *
	 * @param userId - Owner identifier (tenant boundary)
	 * @param pagination - Pagination configuration
	 * @param filter - Optional filtering criteria
	 * @param orderBy - Sorting configuration
	 *
	 * @returns Paginated bags with preloaded container data
	 *
	 * @remarks
	 * - Uses offset-based pagination (`skip` / `take`)
	 * - Fetches `limit + 1` records to determine next-page existence
	 */
	async listBags(
		userId: string,
		pagination: PaginationPayload,
		filter: BagFilterInput,
		orderBy: BagOrderByInput
	): Promise<{ bags: BagWithContainer[]; meta: PaginationMeta }> {
		const { offset, page, limit } = pagination;

		const { where, orderBy: prismaOrderBy } = buildBagQuery(
			filter,
			orderBy
		);

		const bags = await this.prisma.bag.findMany({
			where: {
				userId,
				...where,
			},
			orderBy: prismaOrderBy,
			take: limit + 1,
			skip: offset,
			include: this.bagInclude,
		});

		this.log.debug({ userId, page, limit }, 'Bags listed');

		return { bags, meta: buildMeta<Bag>(bags, limit, page) };
	}

	/**
	 * Retrieves a single user-owned bag by its identifier.
	 *
	 * @param userId - Owner identifier
	 * @param id - Bag identifier
	 *
	 * @returns Bag with container and items
	 *
	 * @throws {AppError} BAG_NOT_FOUND
	 * Thrown when the bag does not exist or is not owned by the user.
	 *
	 * @remarks
	 * Relies on composite uniqueness (`id`, `userId`) for isolation.
	 */
	async getBagById(userId: string, id: string): Promise<BagWithContainer> {
		const bag = await this.prisma.bag.findUnique({
			where: { id, userId },
			include: this.bagInclude,
		});

		return this.assertFound<BagWithContainer>(
			bag,
			ErrorCode.BAG_NOT_FOUND,
			{
				userId,
				bagId: id,
			}
		);
	}

	/**
	 * Creates a new bag and its backing container atomically.
	 *
	 * @param userId - Owner identifier
	 * @param input - Validated creation payload
	 *
	 * @returns Newly created bag with container
	 *
	 * @remarks
	 * - Executed inside a transaction to guarantee referential integrity
	 * - Physical constraints are stored on Container
	 * - Cosmetic properties are stored on Bag
	 */
	async createBag(
		userId: string,
		input: CreateBagInput
	): Promise<BagWithContainer> {
		const {
			name,
			type,
			color,
			size,
			maxCapacity,
			maxWeight,
			emptyWeight,
			material,
			features,
		} = input;

		const bag = await this.prisma.$transaction(async (tx) => {
			const container = await tx.container.create({
				data: {
					type: ContainerType.BAG,
					maxCapacity,
					maxWeight,
					emptyWeight: emptyWeight ?? 0,
					userId,
				},
			});

			return tx.bag.create({
				data: {
					containerId: container.id,
					name,
					type,
					color,
					size,
					material,
					features: {
						set: features ?? [],
					},
					userId,
				},
				include: this.bagInclude,
			});
		});

		this.log.info({ userId, bagId: bag.id }, 'Bag created');

		return bag;
	}

	/**
	 * Applies partial updates to a bag and/or its container.
	 *
	 * @param userId - Owner identifier
	 * @param id - Bag identifier
	 * @param input - Partial update payload
	 *
	 * @returns Updated bag with container
	 *
	 * @throws {AppError} BAG_NOT_FOUND
	 *
	 * @remarks
	 * - Separates physical constraint updates (Container) from cosmetic updates (Bag)
	 * - Filters out `undefined` and `null` values to preserve PATCH semantics
	 * - Entire operation is transactional
	 */
	async updateBag(
		userId: string,
		id: string,
		input: UpdateBagInput
	): Promise<BagWithContainer> {
		const existing = await this.getBagById(userId, id);

		const { maxCapacity, maxWeight, emptyWeight, ...bagFields } = input;

		const updatedBag = await this.prisma.$transaction(async (tx) => {
			// Route physical constraint fields to the Container record
			const containerData = this.stripNullish({
				maxCapacity,
				maxWeight,
				emptyWeight,
			} as Record<string, unknown>);

			if (Object.keys(containerData).length > 0) {
				await tx.container.update({
					where: { id: existing.containerId },
					data: containerData,
				});
			}

			return tx.bag.update({
				where: { id, userId },
				data: this.stripNullish(bagFields as Record<string, unknown>),
				include: this.bagInclude,
			});
		});

		this.log.info({ userId, bagId: id }, 'Bag updated');

		return updatedBag;
	}

	/**
	 * Deletes a user-owned bag.
	 *
	 * @param userId - Owner identifier
	 * @param id - Bag identifier
	 *
	 * @throws {AppError} BAG_NOT_FOUND
	 *
	 * @remarks
	 * - Relies on Prisma cascade rules to remove related container and items
	 * - Ownership is verified before deletion
	 */
	async deleteBagById(userId: string, id: string): Promise<void> {
		await this.getBagById(userId, id);

		await this.prisma.bag.delete({
			where: { id, userId },
		});

		this.log.info({ userId, bagId: id }, 'Bag deleted');
	}
}
