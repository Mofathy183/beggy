import type { PrismaClientType } from '@prisma';
import type { Item } from '@prisma/generated/prisma/client';
import type {
	ItemFilterInput,
	ItemOrderByInput,
	UpdateItemInput,
	PaginationMeta,
	CreateItemInput,
} from '@beggy/shared/types';
import { ErrorCode } from '@beggy/shared/constants';
import type { PaginationPayload } from '@shared/types';
import { BaseService } from '@shared/core';
import { buildItemQuery, buildMeta } from '@shared/utils';

/**
 * Domain service responsible for managing user-owned items.
 *
 * @description
 * Encapsulates business rules related to item lifecycle while enforcing
 * strict multi-tenant isolation through `userId` scoping.
 *
 * @remarks
 * - All operations are scoped to a specific user.
 * - Throws domain-level errors only (never HTTP errors).
 * - Persistence concerns are delegated to Prisma.
 * - Assumes a composite unique constraint on `{ id, userId }`.
 */
export class ItemService extends BaseService {
	constructor(private readonly prisma: PrismaClientType) {
		super({ domain: 'items', service: 'ItemService' });
	}

	/**
	 * Returns paginated items belonging to a user.
	 *
	 * @param userId - Owner identifier used for tenant isolation.
	 * @param pagination - Pagination payload containing `page`, `limit`, and `offset`.
	 * @param filter - Optional filtering criteria.
	 * @param orderBy - Sorting configuration.
	 *
	 * @returns Items and computed pagination metadata.
	 *
	 * @remarks
	 * Uses offset-based pagination and relies on `buildMeta`
	 * to determine page boundaries and next-page existence.
	 */
	async listItems(
		userId: string,
		pagination: PaginationPayload,
		filter: ItemFilterInput,
		orderBy: ItemOrderByInput
	): Promise<{ items: Item[]; meta: PaginationMeta }> {
		const { offset, page, limit } = pagination;

		const { where, orderBy: prismaOrderBy } = buildItemQuery(
			filter,
			orderBy
		);

		const items = await this.prisma.item.findMany({
			where: {
				userId,
				...where,
			},
			orderBy: prismaOrderBy,
			take: limit + 1,
			skip: offset,
		});

		this.log.debug({ userId, page, limit }, 'Items listed');

		return { items, meta: buildMeta<Item>(items, limit, page) };
	}

	/**
	 * Retrieves a single user-owned item by its identifier.
	 *
	 * @param userId - Owner identifier.
	 * @param id - Item identifier.
	 *
	 * @returns The matching item.
	 *
	 * @throws {AppError} ITEM_NOT_FOUND
	 * If the item does not exist or does not belong to the user.
	 */
	async getItemById(userId: string, id: string): Promise<Item> {
		const item = await this.prisma.item.findUnique({
			where: { id, userId },
		});

		return this.assertFound<Item>(item, ErrorCode.ITEM_NOT_FOUND, {
			userId,
			itemId: id,
		});
	}

	/**
	 * Creates a new item.
	 *
	 * @param input - Validated item creation payload.
	 *
	 * @returns The newly created item.
	 *
	 * @remarks
	 * Assumes:
	 * - Input validation has already been performed upstream.
	 * - `userId` is trusted and provided by the application layer.
	 */
	async createItem(userId: string, input: CreateItemInput): Promise<Item> {
		const item = await this.prisma.item.create({
			data: {
				...input,
				userId,
			},
		});

		this.log.info({ userId, itemId: item.id }, 'Item created');

		return item;
	}

	/**
	 * Applies partial updates to a user-owned item.
	 *
	 * @description
	 * Removes `undefined` and `null` fields before persisting to avoid
	 * accidental overwrites.
	 *
	 * @param userId - Owner identifier.
	 * @param id - Item identifier.
	 * @param input - Partial update payload.
	 *
	 * @returns The updated item.
	 *
	 * @throws {Prisma.PrismaClientKnownRequestError}
	 * If the item does not exist or does not belong to the user.
	 */
	async updateItem(
		userId: string,
		id: string,
		input: UpdateItemInput
	): Promise<Item> {
		const updatedItem = await this.prisma.item.update({
			where: { id, userId },
			data: this.stripNullish(input as Record<string, unknown>),
		});

		this.log.info({ userId, itemId: id }, 'Item updated');

		return updatedItem;
	}

	/**
	 * Permanently deletes a user-owned item.
	 *
	 * @param userId - Owner identifier.
	 * @param id - Item identifier.
	 *
	 * @returns The deleted item record.
	 *
	 * @throws {Prisma.PrismaClientKnownRequestError}
	 * If the item does not exist or does not belong to the user.
	 */
	async deleteItemById(userId: string, id: string): Promise<Item> {
		const deletedItem = await this.prisma.item.delete({
			where: { id, userId },
		});

		this.log.info({ userId, itemId: id }, 'Item deleted');

		return deletedItem;
	}
}
