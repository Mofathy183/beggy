import type { PrismaClientType } from '@prisma';
import type { BagWithContainer } from '@modules/bags';
import type { SuitcaseWithContainer } from '@modules/suitcases';
import type { TypedContainerResult } from '@shared/types';
import { ErrorCode, ContainerType } from '@beggy/shared/constants';
import { BaseService } from '@shared/core';
import type {
	PackItemInput,
	UnpackItemInput,
	MoveItemInput,
} from '@beggy/shared/types';
import type { ContainerWithItems } from '@modules/containers';

/**
 * Application service responsible for container item orchestration.
 *
 * @remarks
 * - Enforces user ownership on all operations
 * - Coordinates persistence and transactional consistency
 * - Returns fully hydrated aggregates for downstream mapping
 */
export class ContainerService extends BaseService {
	constructor(private readonly prisma: PrismaClientType) {
		super({ domain: 'containers', service: 'ContainerService' });
	}

	/**
	 * Shared include shape for container aggregate queries.
	 *
	 * @remarks
	 * Guarantees a consistent data structure across all service methods.
	 */
	private readonly containerInclude = {
		containerItems: { include: { item: true } },
	} as const;

	// ── Private helpers ───────────────────────────────────────────

	/**
	 * Retrieves a container owned by the given user.
	 *
	 * @param userId - Owner identifier
	 * @param containerId - Container identifier
	 * @returns Fully hydrated container aggregate
	 *
	 * @throws {AppError} CONTAINER_NOT_FOUND if not found or not owned by user
	 */
	private async findOwnedContainer(
		userId: string,
		containerId: string
	): Promise<ContainerWithItems> {
		const container = await this.prisma.container.findUnique({
			where: { id: containerId, userId },
			include: this.containerInclude,
		});

		return this.assertFound(container, ErrorCode.CONTAINER_NOT_FOUND, {
			userId,
			containerId,
		});
	}

	/**
	 * Retrieves an item owned by the given user.
	 *
	 * @param userId - Owner identifier
	 * @param itemId - Item identifier
	 * @returns Item entity
	 *
	 * @throws {AppError} ITEM_NOT_FOUND if not found or not owned by user
	 */
	private async findOwnedItem(userId: string, itemId: string) {
		const item = await this.prisma.item.findUnique({
			where: { id: itemId, userId },
		});

		return this.assertFound(item, ErrorCode.ITEM_NOT_FOUND, {
			userId,
			itemId,
		});
	}

	// ── Public operations ─────────────────────────────────────────

	/**
	 * Adds or increments an item in a container.
	 *
	 * @param userId - Owner identifier
	 * @param containerId - Target container
	 * @param input - Pack payload
	 * @returns Updated container aggregate
	 *
	 * @remarks
	 * Uses upsert to ensure idempotent behavior per item.
	 */
	async packItem(
		userId: string,
		containerId: string,
		input: PackItemInput
	): Promise<ContainerWithItems> {
		await this.findOwnedContainer(userId, containerId);

		const { itemId, quantity } = input;

		await this.findOwnedItem(userId, itemId);

		await this.prisma.containerItems.upsert({
			where: { containerId_itemId: { containerId, itemId } },
			update: { quantity: { increment: quantity } },
			create: { containerId, itemId, quantity },
		});

		const updated = await this.findOwnedContainer(userId, containerId);

		this.log.info({ userId, containerId, itemId }, 'Item packed');
		return updated;
	}

	/**
	 * Removes or decrements an item from a container.
	 *
	 * @param userId - Owner identifier
	 * @param containerId - Target container
	 * @param input - Unpack payload
	 * @returns Updated container aggregate
	 *
	 * @throws {AppError} CONTAINER_ITEM_NOT_FOUND if item is not present
	 *
	 * @remarks
	 * Deletes the item entry when quantity reaches zero.
	 * Assumes input quantity is validated upstream.
	 */
	async unpackItem(
		userId: string,
		containerId: string,
		input: UnpackItemInput
	): Promise<ContainerWithItems> {
		await this.findOwnedContainer(userId, containerId);

		const { itemId, quantity } = input;

		await this.findOwnedItem(userId, itemId);

		await this.prisma.$transaction(async (tx) => {
			const existing = await tx.containerItems.findUnique({
				where: { containerId_itemId: { containerId, itemId } },
			});

			if (!existing) {
				this.throwNotFound(ErrorCode.CONTAINER_ITEM_NOT_FOUND);
			}

			if (existing.quantity <= quantity) {
				await tx.containerItems.delete({
					where: { containerId_itemId: { containerId, itemId } },
				});
			} else {
				await tx.containerItems.update({
					where: { containerId_itemId: { containerId, itemId } },
					data: { quantity: { decrement: quantity } },
				});
			}
		});

		const updated = await this.findOwnedContainer(userId, containerId);

		this.log.info({ userId, containerId, itemId }, 'Item unpacked');
		return updated;
	}

	/**
	 * Moves an item between two containers atomically.
	 *
	 * @param userId - Owner identifier
	 * @param input - Move payload
	 * @returns Updated source and destination containers
	 *
	 * @throws {AppError} CONTAINER_ITEM_NOT_FOUND if item is missing in source
	 *
	 * @remarks
	 * Executed within a transaction to prevent partial updates.
	 */
	async moveItem(
		userId: string,
		input: MoveItemInput
	): Promise<{ from: ContainerWithItems; to: ContainerWithItems }> {
		const { fromContainerId, toContainerId, itemId, quantity } = input;

		await this.findOwnedItem(userId, itemId);

		await this.findOwnedContainer(userId, fromContainerId);
		await this.findOwnedContainer(userId, toContainerId);

		await this.prisma.$transaction(async (tx) => {
			const source = await tx.containerItems.findUnique({
				where: {
					containerId_itemId: {
						containerId: fromContainerId,
						itemId,
					},
				},
			});

			if (!source) this.throwNotFound(ErrorCode.CONTAINER_ITEM_NOT_FOUND);

			if (source.quantity <= quantity) {
				await tx.containerItems.delete({
					where: {
						containerId_itemId: {
							containerId: fromContainerId,
							itemId,
						},
					},
				});
			} else {
				await tx.containerItems.update({
					where: {
						containerId_itemId: {
							containerId: fromContainerId,
							itemId,
						},
					},
					data: { quantity: { decrement: quantity } },
				});
			}

			await tx.containerItems.upsert({
				where: {
					containerId_itemId: { containerId: toContainerId, itemId },
				},
				update: { quantity: { increment: quantity } },
				create: { containerId: toContainerId, itemId, quantity },
			});
		});

		const [fromUpdated, toUpdated] = await Promise.all([
			this.findOwnedContainer(userId, fromContainerId),
			this.findOwnedContainer(userId, toContainerId),
		]);

		this.log.info(
			{ userId, fromContainerId, toContainerId, itemId },
			'Item moved'
		);

		return { from: fromUpdated, to: toUpdated };
	}

	/**
	 * Retrieves a container with its type-specific aggregate.
	 *
	 * @param userId - Owner identifier
	 * @param containerId - Container identifier
	 * @returns Typed container result
	 *
	 * @remarks
	 * The returned shape depends on {@link ContainerType}.
	 */
	async getTypedContainer(
		userId: string,
		containerId: string
	): Promise<TypedContainerResult> {
		const container = await this.findOwnedContainer(userId, containerId);

		switch (container.type) {
			case ContainerType.BAG: {
				const bag = await this.prisma.bag.findUnique({
					where: { containerId },
					include: {
						container: {
							include: this.containerInclude,
						},
					},
				});

				return {
					type: ContainerType.BAG,
					data: this.assertFound<BagWithContainer>(
						bag,
						ErrorCode.BAG_NOT_FOUND
					),
				};
			}

			case ContainerType.SUITCASE: {
				const suitcase = await this.prisma.suitcase.findUnique({
					where: { containerId },
					include: {
						container: {
							include: this.containerInclude,
						},
					},
				});

				return {
					type: ContainerType.SUITCASE,
					data: this.assertFound<SuitcaseWithContainer>(
						suitcase,
						ErrorCode.SUITCASE_NOT_FOUND
					),
				};
			}

			default: {
				throw this.throwNotFound(ErrorCode.CONTAINER_NOT_FOUND);
			}
		}
	}

	/**
	 * Retrieves the container aggregate for read operations.
	 *
	 * @param userId - Owner identifier
	 * @param containerId - Container identifier
	 * @returns Container aggregate
	 */
	async getContainerState(
		userId: string,
		containerId: string
	): Promise<ContainerWithItems> {
		return this.findOwnedContainer(userId, containerId);
	}
}
