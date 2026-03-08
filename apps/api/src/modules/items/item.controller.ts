import type { Request, Response } from 'express';
import { type ItemService, ItemMapper } from '@modules/items';
import type { ItemDTO, ItemOrderByInput } from '@beggy/shared/types';
import { apiResponseMap } from '@shared/utils';
import { BaseController } from '@shared/core';
import { logger } from '@shared/middlewares';
import type { PaginationPayload } from '@shared/types';
import { STATUS_CODE } from '@shared/constants';

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
		super(
			logger.child({
				domain: 'items',
				controller: 'ItemController',
			})
		);
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
		const { pagination, orderBy, query: filter } = req;

		this.assertAuthenticated(req);
		const userId = req.user.id;

		const { items, meta } = await this.itemService.listItems(
			userId,
			pagination as PaginationPayload,
			filter,
			orderBy as ItemOrderByInput
		);

		const data = ItemMapper.toDTOList(items);

		res.status(STATUS_CODE.OK).json(
			apiResponseMap.ok<ItemDTO[]>(data, 'ITEMS_FETCHED', meta)
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
		const { id } = req.params;

		this.assertAuthenticated(req);
		const userId = req.user.id;

		const item = await this.itemService.getItemById(userId, id as string);

		res.status(STATUS_CODE.OK).json(
			apiResponseMap.ok<ItemDTO>(ItemMapper.toDTO(item), 'ITEM_FETCHED')
		);
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
		const { body } = req;

		this.assertAuthenticated(req);
		const userId = req.user.id;

		const item = await this.itemService.createItem(userId, body);

		res.status(STATUS_CODE.CREATED).json(
			apiResponseMap.created<ItemDTO>(
				ItemMapper.toDTO(item),
				'ITEM_CREATED'
			)
		);
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
		const {
			body,
			params: { id },
		} = req;

		this.assertAuthenticated(req);
		const userId = req.user.id;

		const updatedItem = await this.itemService.updateItem(
			userId,
			id as string,
			body
		);

		res.status(STATUS_CODE.OK).json(
			apiResponseMap.ok<ItemDTO>(
				ItemMapper.toDTO(updatedItem),
				'ITEM_UPDATED'
			)
		);
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
		const { id } = req.params;

		this.assertAuthenticated(req);
		const userId = req.user.id;

		await this.itemService.deleteItemById(userId, id as string);

		res.sendStatus(STATUS_CODE.NO_CONTENT);
	};
}
