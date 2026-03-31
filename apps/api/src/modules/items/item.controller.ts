import type { Request, Response } from 'express';
import { type ItemService, ItemMapper } from '@modules/items';
import type { ItemDTO, ItemOrderByInput } from '@beggy/shared/types';
import { BaseController } from '@shared/core';
/**
 * HTTP controller responsible for item-related endpoints.
 *
 * @description
 * Orchestrates request handling, authentication enforcement,
 * DTO mapping, and standardized API responses.
 *
 * @remarks
 * - Contains no business logic.
 * - Delegates all domain operations to ItemService.
 * - Assumes authentication and pagination middleware augment the request object.
 */
export class ItemController extends BaseController {
	constructor(private readonly itemService: ItemService) {
		super({
			domain: 'items',
			controller: 'ItemController',
		});
	}

	/**
	 * GET /items
	 *
	 * @description
	 * Returns paginated items belonging to the authenticated user.
	 *
	 * @route GET /items
	 */
	getItems = async (req: Request, res: Response): Promise<void> => {
		const userId = this.getUserId(req);

		const { items, meta } = await this.itemService.listItems(
			userId,
			this.getPagination(req),
			req.query,
			this.getOrderBy<ItemOrderByInput>(req)
		);

		this.ok<ItemDTO[]>(
			res,
			ItemMapper.toDTOList(items),
			'ITEMS_FETCHED',
			meta
		);
	};

	/**
	 * GET /items/:id
	 *
	 * @description
	 * Returns a single item owned by the authenticated user.
	 *
	 * @route GET /items/:id
	 */
	getItemById = async (req: Request, res: Response): Promise<void> => {
		const userId = this.getUserId(req);
		const id = this.getParam(req);

		const item = await this.itemService.getItemById(userId, id);

		this.ok<ItemDTO>(res, ItemMapper.toDTO(item), 'ITEM_FETCHED');
	};

	/**
	 * POST /items
	 *
	 * @description
	 * Creates a new item.
	 *
	 * @remarks
	 * Assumes request body validation is performed upstream.
	 *
	 * @route POST /items
	 */
	createItem = async (req: Request, res: Response): Promise<void> => {
		const userId = this.getUserId(req);

		const item = await this.itemService.createItem(userId, req.body);

		this.created<ItemDTO>(res, ItemMapper.toDTO(item), 'ITEM_CREATED');
	};

	/**
	 * PATCH /items/:id
	 *
	 * @description
	 * Updates a user-owned item.
	 *
	 * @route PATCH /items/:id
	 */
	updateItem = async (req: Request, res: Response): Promise<void> => {
		const userId = this.getUserId(req);
		const id = this.getParam(req);

		const updatedItem = await this.itemService.updateItem(
			userId,
			id,
			req.body
		);

		this.ok<ItemDTO>(res, ItemMapper.toDTO(updatedItem), 'ITEM_UPDATED');
	};

	/**
	 * DELETE /items/:id
	 *
	 * @description
	 * Deletes a user-owned item.
	 *
	 * @route DELETE /items/:id
	 */
	deleteItemById = async (req: Request, res: Response): Promise<void> => {
		const userId = this.getUserId(req);
		const id = this.getParam(req);

		await this.itemService.deleteItemById(userId, id);

		this.noContent(res);
	};
}
