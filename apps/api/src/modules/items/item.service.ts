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
 * Service responsible for managing user-owned items.
 *
 * @remarks
 * Enforces strict tenant isolation via `userId` scoping.
 * All operations assume the caller is already authenticated.
 */
export class ItemService extends BaseService {
	constructor(private readonly prisma: PrismaClientType) {
		super({ domain: 'items', service: 'ItemService' });
	}

	/**
	 * Lists items for a given user with pagination, filtering, and sorting.
	 *
	 * @param userId - Owner identifier
	 * @param pagination - Offset-based pagination configuration
	 * @param filter - Optional filtering criteria
	 * @param orderBy - Sorting configuration
	 *
	 * @returns Paginated items with metadata
	 *
	 * @remarks
	 * Fetches `limit + 1` records to determine page boundaries.
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
	 * Retrieves a user-owned item by ID.
	 *
	 * @param userId - Owner identifier
	 * @param id - Item identifier
	 *
	 * @returns The matching item
	 *
	 * @throws {AppError} When item is not found or not owned by user
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
	 * Creates a new item for a user.
	 *
	 * @param userId - Owner identifier
	 * @param input - Validated creation payload
	 *
	 * @returns Newly created item
	 *
	 * @remarks
	 * Assumes `userId` is derived from a trusted source (e.g. auth context).
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
	 * Updates a user-owned item.
	 *
	 * @param userId - Owner identifier
	 * @param id - Item identifier
	 * @param input - Partial update payload
	 *
	 * @returns Updated item
	 *
	 * @remarks
	 * Nullish values are stripped to prevent unintended overwrites.
	 */
	async updateItem(
		userId: string,
		id: string,
		input: UpdateItemInput
	): Promise<Item> {
		await this.getItemById(userId, id);

		const updatedItem = await this.prisma.item.update({
			where: { id, userId },
			data: this.stripNullish(input as Record<string, unknown>),
		});

		this.log.info({ userId, itemId: id }, 'Item updated');

		return updatedItem;
	}

	/**
	 * Deletes a user-owned item.
	 *
	 * @param userId - Owner identifier
	 * @param id - Item identifier
	 *
	 * @returns Deleted item
	 *
	 * @remarks
	 * Operation is scoped to the user to prevent cross-tenant deletion.
	 */
	async deleteItemById(userId: string, id: string): Promise<Item> {
		await this.getItemById(userId, id);

		const deletedItem = await this.prisma.item.delete({
			where: { id, userId },
		});

		this.log.info({ userId, itemId: id }, 'Item deleted');

		return deletedItem;
	}
}
