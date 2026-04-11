import type { PrismaClientType } from '@prisma';
import { ErrorCode } from '@beggy/shared/constants';
import { BaseService } from '@shared/core';
import type {
	PackItemInput,
	UnpackItemInput,
	MoveItemInput,
} from '@beggy/shared/types';
import type { ContainerWithItems } from '@modules/containers';

/**
 * Handles container item orchestration and persistence.
 *
 * @remarks
 * This service operates on container aggregates and ensures:
 * - Ownership enforcement (user-scoped access)
 * - Consistent item mutations (pack, unpack, move)
 * - Atomic operations where required (move)
 *
 * It intentionally returns fully hydrated containers for downstream mapping.
 */
export class ContainerService extends BaseService {
	constructor(private readonly prisma: PrismaClientType) {
		super({ domain: 'containers', service: 'ContainerService' });
	}

	/**
	 * Default include shape for container queries.
	 *
	 * @remarks
	 * Ensures all service methods return a consistent aggregate shape.
	 */
	private readonly containerInclude = {
		containerItems: { include: { item: true } },
	} as const;

	// ── Private helpers ───────────────────────────────────────────

	/**
	 * Retrieves a container owned by the given user.
	 *
	 * @throws {AppError} CONTAINER_NOT_FOUND if container does not exist or is not owned by user
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

	// ── Public operations ─────────────────────────────────────────

	/**
	 * Adds or increments an item in a container.
	 *
	 * @remarks
	 * - Uses upsert to ensure idempotent behavior per item
	 * - Always returns fresh container state after mutation
	 */
	async packItem(
		userId: string,
		containerId: string,
		input: PackItemInput
	): Promise<ContainerWithItems> {
		await this.findOwnedContainer(userId, containerId);

		const { itemId, quantity } = input;

		// Upsert: increment if exists, create if new
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
	 * @throws {AppError} CONTAINER_ITEM_NOT_FOUND if item does not exist in container
	 *
	 * @remarks
	 * - Deletes the item entry when quantity reaches zero
	 * - Assumes input quantity is validated upstream
	 */
	async unpackItem(
		userId: string,
		containerId: string,
		input: UnpackItemInput
	): Promise<ContainerWithItems> {
		await this.findOwnedContainer(userId, containerId);

		const { itemId, quantity } = input;

		const existing = await this.prisma.containerItems.findUnique({
			where: { containerId_itemId: { containerId, itemId } },
		});

		if (!existing) {
			this.throwNotFound(ErrorCode.CONTAINER_ITEM_NOT_FOUND);
		}

		if (existing.quantity <= quantity) {
			// Remove entirely when requested quantity exceeds or matches existing
			await this.prisma.containerItems.delete({
				where: { containerId_itemId: { containerId, itemId } },
			});
		} else {
			await this.prisma.containerItems.update({
				where: { containerId_itemId: { containerId, itemId } },
				data: { quantity: { decrement: quantity } },
			});
		}

		const updated = await this.findOwnedContainer(userId, containerId);

		this.log.info({ userId, containerId, itemId }, 'Item unpacked');
		return updated;
	}

	/**
	 * Moves an item between two containers.
	 *
	 * @returns Updated source and destination containers
	 *
	 * @throws {AppError} CONTAINER_ITEM_NOT_FOUND if item does not exist in source container
	 *
	 * @remarks
	 * - Executed within a database transaction to ensure atomicity
	 * - Prevents partial updates (no item duplication or loss)
	 * - Ownership of both containers is verified before transaction
	 */
	async moveItem(
		userId: string,
		input: MoveItemInput
	): Promise<{ from: ContainerWithItems; to: ContainerWithItems }> {
		const { fromContainerId, toContainerId, itemId, quantity } = input;

		// Verify ownership of both containers upfront
		await this.findOwnedContainer(userId, fromContainerId);
		await this.findOwnedContainer(userId, toContainerId);

		await this.prisma.$transaction(async (tx) => {
			// Remove from source
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

			// Add to destination
			await tx.containerItems.upsert({
				where: {
					containerId_itemId: { containerId: toContainerId, itemId },
				},
				update: { quantity: { increment: quantity } },
				create: { containerId: toContainerId, itemId, quantity },
			});
		});

		// Fetch both fresh states after transaction
		const [fromUpdated, toUpdated] = await Promise.all([
			this.findOwnedContainer(userId, fromContainerId),
			this.findOwnedContainer(userId, toContainerId),
		]);

		this.log.info(
			{ userId, fromContainerId, toContainerId, itemId },
			'Item moved'
		);

		return {
			from: fromUpdated,
			to: toUpdated,
		};
	}

	/**
	 * Retrieves the current container state.
	 *
	 * @remarks
	 * Acts as a read operation over the container aggregate.
	 */
	async getContainerState(
		userId: string,
		containerId: string
	): Promise<ContainerWithItems> {
		return this.findOwnedContainer(userId, containerId);
	}
}
