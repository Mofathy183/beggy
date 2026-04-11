import type { Request, Response } from 'express';
import { BaseController } from '@shared/core';
import { ContainerMapper, type ContainerService } from '@modules/containers';
import type {
	ContainerStatusDTO,
	ContainerSummaryDTO,
	MoveResultDTO,
} from '@beggy/shared/types';

/**
 * Handles HTTP requests for container operations such as packing,
 * unpacking, moving items, and retrieving container state.
 *
 * @remarks
 * This controller is intentionally thin and delegates all business
 * logic to the ContainerService. It is responsible only for request
 * extraction, response mapping, and HTTP formatting.
 */
export class ContainerController extends BaseController {
	constructor(private readonly containerService: ContainerService) {
		super({ domain: 'containers', controller: 'ContainerController' });
	}

	/**
	 * Packs an item into a container.
	 *
	 * @param req - Express request containing authenticated user and packing payload
	 * @param res - Express response
	 *
	 * @remarks
	 * Expects `req.body` to include itemId and quantity.
	 */
	packItem = async (req: Request, res: Response): Promise<void> => {
		const userId = this.getUserId(req);
		const containerId = this.getParam(req);

		const result = await this.containerService.packItem(
			userId,
			containerId,
			req.body
		);

		this.ok<ContainerSummaryDTO>(
			res,
			ContainerMapper.toPackResult(result),
			'ITEM_PACKED'
		);
	};

	/**
	 * Removes an item (or reduces quantity) from a container.
	 *
	 * @param req - Express request containing authenticated user and unpack payload
	 * @param res - Express response
	 *
	 * @remarks
	 * Uses the same payload structure as packItem.
	 */
	unpackItem = async (req: Request, res: Response): Promise<void> => {
		const userId = this.getUserId(req);
		const containerId = this.getParam(req);

		const result = await this.containerService.unpackItem(
			userId,
			containerId,
			req.body
		);

		this.ok<ContainerSummaryDTO>(
			res,
			ContainerMapper.toPackResult(result),
			'ITEM_UNPACKED'
		);
	};

	/**
	 * Moves an item between containers.
	 *
	 * @param req - Express request containing source, destination, and item payload
	 * @param res - Express response
	 *
	 * @returns A summary of both source and destination containers after the move
	 *
	 * @remarks
	 * Unlike pack/unpack, this operation affects two containers and returns both states.
	 */
	moveItem = async (req: Request, res: Response): Promise<void> => {
		const userId = this.getUserId(req);

		const { from, to } = await this.containerService.moveItem(
			userId,
			req.body
		);

		this.ok<MoveResultDTO>(
			res,
			ContainerMapper.toMoveResult(from, to),
			'ITEM_MOVED'
		);
	};

	/**
	 * Retrieves the current state of a container.
	 *
	 * @param req - Express request containing container identifier
	 * @param res - Express response
	 *
	 * @returns Container status including capacity, weight, and items
	 */
	getContainerState = async (req: Request, res: Response): Promise<void> => {
		const userId = this.getUserId(req);
		const containerId = this.getParam(req);

		const container = await this.containerService.getContainerState(
			userId,
			containerId
		);

		this.ok<ContainerStatusDTO>(
			res,
			ContainerMapper.toContainerStatus(container),
			'CONTAINER_STATE_FETCHED'
		);
	};
}
