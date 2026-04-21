import type { Request, Response } from 'express';
import { BaseController } from '@shared/core';
import { ContainerMapper, type ContainerService } from '@modules/containers';
import type {
	ContainerStateDTO,
	ContainerSummaryDTO,
	MoveResultDTO,
	TypedContainerDTO,
} from '@beggy/shared/types';
import { ContainerType } from '@beggy/shared/constants';
import { BagMapper } from '@modules/bags';
import { SuitcaseMapper } from '@modules/suitcases';
import type { TypedContainerResult } from '@shared/types';

/**
 * HTTP controller for container operations (packing, moving, and state retrieval).
 *
 * @remarks
 * - Delegates all domain logic to {@link ContainerService}.
 * - Responsible for request extraction and DTO mapping only.
 * - Keeps transport layer concerns isolated from business logic.
 */
export class ContainerController extends BaseController {
	constructor(private readonly containerService: ContainerService) {
		super({ domain: 'containers', controller: 'ContainerController' });
	}

	/**
	 * Maps a typed container domain result into its corresponding DTO.
	 *
	 * @param result - Domain result containing container type and data
	 * @returns Typed DTO suitable for API response
	 *
	 * @remarks
	 * This method must remain aligned with supported {@link ContainerType} values.
	 * Missing cases may result in undefined behavior at runtime.
	 */
	private mapTypedContainer(result: TypedContainerResult): TypedContainerDTO {
		switch (result.type) {
			case ContainerType.BAG:
				return {
					type: result.type,
					data: BagMapper.toDTO(result.data),
				};

			case ContainerType.SUITCASE:
				return {
					type: result.type,
					data: SuitcaseMapper.toDTO(result.data),
				};
		}
	}

	/**
	 * Packs an item into a container.
	 *
	 * @param req - Express request containing authenticated user and packing payload
	 * @param res - Express response
	 *
	 * @remarks
	 * Expects `req.body` to include:
	 * - itemId
	 * - quantity
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
	 * Removes or reduces quantity of an item from a container.
	 *
	 * @param req - Express request containing unpack payload
	 * @param res - Express response
	 *
	 * @remarks
	 * Shares the same payload structure as {@link packItem}.
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
	 * @param req - Express request containing move payload
	 * @param res - Express response
	 *
	 * @returns Updated summaries for both source and destination containers
	 *
	 * @remarks
	 * This operation mutates two containers and returns both resulting states.
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
	 * Retrieves a container with its specific typed representation.
	 *
	 * @param req - Express request containing container identifier
	 * @param res - Express response
	 *
	 * @remarks
	 * The response shape varies depending on {@link ContainerType}.
	 */
	getContainer = async (req: Request, res: Response): Promise<void> => {
		const userId = this.getUserId(req);
		const containerId = this.getParam(req);

		const result = await this.containerService.getTypedContainer(
			userId,
			containerId
		);

		const dto = this.mapTypedContainer(result);

		this.ok<TypedContainerDTO>(
			res,
			dto,
			dto.type === ContainerType.BAG ? 'BAG_FETCHED' : 'SUITCASE_FETCHED'
		);
	};

	/**
	 * Retrieves the computed state of a container.
	 *
	 * @param req - Express request containing container identifier
	 * @param res - Express response
	 *
	 * @returns Container metrics including capacity, weight, and items
	 */
	getContainerState = async (req: Request, res: Response): Promise<void> => {
		const userId = this.getUserId(req);
		const containerId = this.getParam(req);

		const container = await this.containerService.getContainerState(
			userId,
			containerId
		);

		this.ok<ContainerStateDTO>(
			res,
			ContainerMapper.toContainerState(container),
			'CONTAINER_STATE_FETCHED'
		);
	};
}
