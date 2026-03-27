import type { Request, Response } from 'express';
import { type BagService, BagMapper } from '@modules/bags';
import type { BagDTO, BagOrderByInput } from '@beggy/shared/types';
import { apiResponseMap } from '@shared/utils';
import { BaseController } from '@shared/core';
import { logger } from '@shared/middlewares';
import type { PaginationPayload } from '@shared/types';
import { STATUS_CODE } from '@shared/constants';

/**
 * HTTP controller responsible for bag-related endpoints.
 *
 * @description
 * Handles request orchestration, authentication enforcement,
 * DTO mapping, and standardized API responses for bags.
 *
 * @remarks
 * - No business logic is implemented here.
 * - Relies on middleware to inject `req.user`, `req.pagination`, and `req.orderBy`.
 * - Delegates all domain operations to {@link BagService}.
 */
export class BagController extends BaseController {
	constructor(private readonly bagService: BagService) {
		super(
			logger.child({
				domain: 'bags',
				controller: 'BagController',
			})
		);
	}

	/**
	 * Returns paginated bags for the authenticated user.
	 *
	 * @route GET /bags
	 * @throws If authentication context is missing
	 */
	getBags = async (req: Request, res: Response): Promise<void> => {
		const { pagination, orderBy, query: filter } = req;

		this.assertAuthenticated(req);
		const userId = req.user.id;

		const { bags, meta } = await this.bagService.listBags(
			userId,
			pagination as PaginationPayload,
			filter,
			orderBy as BagOrderByInput
		);

		const data = BagMapper.toDTOList(bags);

		res.status(STATUS_CODE.OK).json(
			apiResponseMap.ok<BagDTO[]>(data, 'BAGS_FETCHED', meta)
		);
	};

	/**
	 * Returns a single bag owned by the authenticated user.
	 *
	 * @route GET /bags/:id
	 * @param req.params.id - Bag identifier
	 * @throws If authentication context is missing or bag is not found/accessible
	 */
	getBagById = async (req: Request, res: Response): Promise<void> => {
		const { id } = req.params;

		this.assertAuthenticated(req);
		const userId = req.user.id;

		const bag = await this.bagService.getBagById(userId, id as string);

		res.status(STATUS_CODE.OK).json(
			apiResponseMap.ok<BagDTO>(BagMapper.toDTO(bag), 'BAG_FETCHED')
		);
	};

	/**
	 * Creates a new bag for the authenticated user.
	 *
	 * @remarks
	 * - Assumes request body validation is handled upstream.
	 * - May create related resources (e.g., backing container).
	 *
	 * @route POST /bags
	 * @throws If authentication context is missing
	 */
	createBag = async (req: Request, res: Response): Promise<void> => {
		const { body } = req;

		this.assertAuthenticated(req);
		const userId = req.user.id;

		const bag = await this.bagService.createBag(userId, body);

		res.status(STATUS_CODE.CREATED).json(
			apiResponseMap.created<BagDTO>(BagMapper.toDTO(bag), 'BAG_CREATED')
		);
	};

	/**
	 * Partially updates a bag owned by the authenticated user.
	 *
	 * @route PATCH /bags/:id
	 * @param req.params.id - Bag identifier
	 * @throws If authentication context is missing or update fails
	 */
	updateBag = async (req: Request, res: Response): Promise<void> => {
		const {
			body,
			params: { id },
		} = req;

		this.assertAuthenticated(req);
		const userId = req.user.id;

		const updatedBag = await this.bagService.updateBag(
			userId,
			id as string,
			body
		);

		res.status(STATUS_CODE.OK).json(
			apiResponseMap.ok<BagDTO>(
				BagMapper.toDTO(updatedBag),
				'BAG_UPDATED'
			)
		);
	};

	/**
	 * Deletes a bag owned by the authenticated user.
	 *
	 * @remarks
	 * Also removes any associated backing resources.
	 *
	 * @route DELETE /bags/:id
	 * @param req.params.id - Bag identifier
	 * @throws If authentication context is missing or deletion fails
	 */
	deleteBagById = async (req: Request, res: Response): Promise<void> => {
		const { id } = req.params;

		this.assertAuthenticated(req);
		const userId = req.user.id;

		await this.bagService.deleteBagById(userId, id as string);

		res.sendStatus(STATUS_CODE.NO_CONTENT);
	};
}
