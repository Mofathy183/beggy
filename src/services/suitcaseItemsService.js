import prisma from '../../prisma/prisma.js';
import { ErrorHandler } from '../utils/error.js';

/**
 * @function addItemToUserSuitcase
 * @description Adds a single item to a user's suitcase, ensuring that the suitcase's capacity and weight are not exceeded.
 * @param {string} userId - The ID of the user owning the suitcase.
 * @param {string} suitcaseId - The ID of the suitcase where the item will be added.
 * @param {Object} body - The request body containing the item ID.
 * @param {string} body.itemId - The ID of the item to add.
 * @returns {Promise<Object>} An object containing updated suitcase items and metadata, or an error if the operation fails.
 */
export const addItemToUserSuitcase = async (userId, suitcaseId, body) => {
	try {
		const { itemId } = body;

		const suitcase = await prisma.suitcases.findUnique({
			where: { userId: userId, id: suitcaseId },
		});

		if (!suitcase)
			return new ErrorHandler(
				'suitcase not found',
				'Failed to find suitcase in the database',
				'prisma Error'
			);

		if (suitcase.error)
			return new ErrorHandler(
				'prisma',
				suitcase.error,
				'Failed to find suitcase in the database ' +
					suitcase.error.message
			);

		const userItem = await prisma.items.findUnique({
			where: { userId: userId, id: itemId },
		});

		if (!userItem)
			return new ErrorHandler(
				'item not found',
				'Failed to find item in the database',
				'prisma Error'
			);

		if (userItem.error)
			return new ErrorHandler(
				'prisma',
				userItem.error,
				'Failed to find item in the database ' + userItem.error.message
			);

		if (
			!(
				suitcase.capacity >=
				(userItem.volume * userItem.quantity) / 100
			) &&
			!(suitcase.weight >= (userItem.weight * userItem.quantity) / 100)
		)
			return new ErrorHandler(
				'suitcase capacity or weight exceeded',
				'The suitcase does not have enough capacity or weight to accommodate the item',
				'suitcase capacity or weight exceeded'
			);

		const suitcaseItem = await prisma.suitcaseItems.upsert({
			where: {
				suitcaseId_itemId: { suitcaseId, itemId },
			},
			update: {
				itemId: itemId,
			},
			create: {
				suitcaseId: suitcaseId,
				itemId: itemId,
			},
		});

		if (!suitcaseItem)
			return new ErrorHandler(
				'item not added in suitcase',
				'Failed to add item to the suitcase in the database',
				'prisma Error'
			);

		if (suitcaseItem.error)
			return new ErrorHandler(
				'prisma',
				suitcaseItem.error,
				'Failed to add item to the suitcase in the database ' +
					suitcaseItem.error.message
			);

		const userSuitcase = await prisma.suitcases.findUnique({
			where: { userId: userId, id: suitcaseId },
			include: {
				suitcaseItems: {
					select: {
						item: true,
					},
				},
			},
		});

		if (!userSuitcase)
			return new ErrorHandler(
				'suitcase is not full',
				'The suitcase has enough capacity and weight to accommodate the item',
				'suitcase is not full'
			);

		if (userSuitcase.error)
			return new ErrorHandler(
				'prisma',
				userSuitcase.error,
				'Failed to find suitcase in the database ' +
					userSuitcase.error.message
			);

		if (userSuitcase.isWeightExceeded || userSuitcase.isCapacityExceeded)
			return new ErrorHandler(
				'suitcase is exceeded capacity and weight',
				'Cannot add that item to suitcase ',
				'The suitcase will be exceeded capacity and weight if you add that item'
			);

		const totalCount = await prisma.suitcaseItems.count({
			where: {
				suitcaseId: suitcaseId,
			},
		});

		const meta = {
			totalCount: totalCount,
			totalAdd: suitcaseItem ? 1 : 0,
		};

		return { suitcaseItems: userSuitcase, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to add item to user bag'
		);
	}
};

/**
 * @function addItemsToUserSuitcase
 * @description Adds multiple items to a user's suitcase in bulk, ensuring that the suitcase's capacity and weight are not exceeded.
 * @param {string} userId - The ID of the user owning the suitcase.
 * @param {string} suitcaseId - The ID of the suitcase where the items will be added.
 * @param {Object} body - The request body containing an array of item IDs.
 * @param {Array<Object>} body.itemsIds - An array of objects containing item IDs to add.
 * @returns {Promise<Object>} An object containing updated suitcase items and metadata, or an error if the operation fails.
 */
export const addItemsToUserSuitcase = async (userId, suitcaseId, body) => {
	try {
		const suitcase = await prisma.suitcases.findUnique({
			where: { id: suitcaseId, userId: userId },
		});

		if (!suitcase)
			return new ErrorHandler(
				'suitcase not found',
				'Failed to find suitcase in the database',
				'prisma Error'
			);

		if (suitcase.error)
			return new ErrorHandler(
				'prisma',
				suitcase.error,
				'Failed to find suitcase in the database ' +
					suitcase.error.message
			);

		const userItems = await prisma.items.findMany({
			where: { userId: userId },
		});

		if (!userItems)
			return new ErrorHandler(
				'items not found',
				'Failed to find items in the database',
				'prisma Error'
			);

		if (userItems.error)
			return new ErrorHandler(
				'prisma',
				userItems.error,
				'Failed to find items in the database ' +
					userItems.error.message
			);

		const userItemsIds = userItems.map((item, index) => {
			let itemId = body.itemsIds[index].itemId;
			let canFit =
				suitcase.capacity >= item.volume &&
				suitcase.weight >= item.weight;

			return canFit ? { itemId } : {};
		});

		if (userItemsIds.length === 0)
			return new ErrorHandler(
				'suitcase capacity or weight exceeded',
				'The suitcase does not have enough capacity or weight to accommodate all the items',
				'suitcase capacity or weight exceeded'
			);

		const suitcaseItems = await prisma.suitcaseItems.createMany({
			data: userItemsIds.map((item) => ({
				suitcaseId,
				itemId: item.itemId,
			})),
			skipDuplicates: true,
		});

		if (suitcaseItems.error)
			return new ErrorHandler(
				'prisma',
				suitcaseItems.error,
				'Failed to add items to the suitcase in the database ' +
					suitcaseItems.error.message
			);

		const isSuitcaseFull = await prisma.suitcases.findUnique({
			where: { id: suitcaseId },
			include: {
				suitcaseItems: {
					select: {
						item: true,
					},
				},
			},
		});

		if (
			isSuitcaseFull.isWeightExceeded ||
			isSuitcaseFull.isCapacityExceeded
		)
			return new ErrorHandler(
				'suitcase is exceeded capacity and weight',
				'Cannot add those items to suitcase ',
				'The suitcase will be exceeded capacity and weight if you add those items'
			);

		const totalCount = await prisma.suitcaseItems.count({
			where: {
				suitcaseId: suitcaseId,
			},
		});

		const meta = {
			totalCount: totalCount,
			totalAdd: suitcaseItems ? suitcaseItems.count : 0,
		};

		return { suitcaseItems: isSuitcaseFull, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to add items to user suitcase'
		);
	}
};

/**
 * @function removeItemFromUserSuitcase
 * @description Removes a single item from a user's suitcase.
 * @param {string} userId - The ID of the user owning the suitcase.
 * @param {string} suitcaseId - The ID of the suitcase from which the item will be removed.
 * @param {Object} body - The request body containing the item ID.
 * @param {string} body.itemId - The ID of the item to remove.
 * @returns {Promise<Object>} An object containing updated suitcase items and metadata, or an error if the operation fails.
 */
export const removeItemFromUserSuitcase = async (userId, suitcaseId, body) => {
	try {
		const { itemId } = body;

		const deletedSuitcaseItem = await prisma.suitcaseItems.delete({
			where: { suitcaseId_itemId: { suitcaseId, itemId } },
		});

		if (!deletedSuitcaseItem)
			return new ErrorHandler(
				'suitcase item not deleted',
				'Failed to delete item from the database',
				'prisma Error'
			);

		if (deletedSuitcaseItem.error)
			return new ErrorHandler(
				'prisma',
				deletedSuitcaseItem.error,
				'Failed to delete item from the database ' +
					deletedSuitcaseItem.error.message
			);

		const suitcaseItems = await prisma.suitcases.findUnique({
			where: { id: suitcaseId, userId: userId },
			include: {
				suitcaseItems: {
					select: {
						item: true,
					},
				},
			},
		});

		const totalCount = await prisma.suitcaseItems.count({
			where: { suitcaseId: suitcaseId },
		});

		const meta = {
			totalCount: totalCount,
			totalDelete: deletedSuitcaseItem ? 1 : 0,
		};

		return { suitcaseItems: suitcaseItems, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'Catch',
			error,
			'Failed to remove item from user suitcase'
		);
	}
};

/**
 * @function removeItemsFromUserSuitcase
 * @description Removes multiple items from a user's suitcase in bulk.
 * @param {string} userId - The ID of the user owning the suitcase.
 * @param {string} suitcaseId - The ID of the suitcase from which the items will be removed.
 * @param {Object} body - The request body containing an array of item IDs.
 * @param {Array<string>} body.itemsIds - An array of item IDs to remove.
 * @returns {Promise<Object>} An object containing updated suitcase items and metadata, or an error if the operation fails.
 */
export const removeItemsFromUserSuitcase = async (userId, suitcaseId, body) => {
	try {
		const { itemsIds } = body;

		const deletedSuitcaseItems = await prisma.suitcaseItems.deleteMany({
			where: {
				suitcaseId: suitcaseId,
				itemId: { in: itemsIds },
			},
		});

		if (deletedSuitcaseItems.error)
			return new ErrorHandler(
				'prisma',
				deletedSuitcaseItems.error,
				'Failed to delete items from the database ' +
					deletedSuitcaseItems.error.message
			);

		const suitcaseItems = await prisma.suitcases.findUnique({
			where: { id: suitcaseId, userId: userId },
			include: {
				suitcaseItems: {
					select: {
						item: true,
					},
				},
			},
		});

		const totalCount = await prisma.suitcaseItems.count({
			where: {
				suitcaseId: suitcaseId,
			},
		});

		const meta = {
			totalCount: totalCount,
			totalDelete: deletedSuitcaseItems.count,
		};

		return { suitcaseItems: suitcaseItems, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to remove items from user suitcase'
		);
	}
};

/**
 * @function removeAllItemsFromUserSuitcase
 * @description Removes all items from a user's suitcase based on filtering criteria.
 * @param {string} userId - The ID of the user owning the suitcase.
 * @param {string} suitcaseId - The ID of the suitcase from which all items will be removed.
 * @param {Object} searchFilter - Filtering conditions for the items to remove.
 * @returns {Promise<Object>} An object containing updated suitcase items and metadata, or an error if the operation fails.
 */
export const removeAllItemsFromUserSuitcase = async (
	userId,
	suitcaseId,
	searchFilter
) => {
	try {
		const deletedSuitcaseItems = await prisma.suitcaseItems.deleteMany({
			where: {
				item: searchFilter,
				suitcaseId: suitcaseId,
			},
		});

		if (deletedSuitcaseItems.error)
			return new ErrorHandler(
				'prisma',
				deletedSuitcaseItems.error,
				'Failed to delete all items from the database ' +
					deletedSuitcaseItems.error.message
			);

		const suitcaseItems = await prisma.suitcases.findUnique({
			where: { id: suitcaseId, userId: userId },
			include: {
				suitcaseItems: {
					select: {
						item: true,
					},
				},
			},
		});

		const totalCount = await prisma.suitcaseItems.count({
			where: {
				suitcaseId: suitcaseId,
			},
		});

		const meta = {
			totalCount: totalCount,
			totalDelete: deletedSuitcaseItems.count,
		};

		return { suitcaseItems: suitcaseItems, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to remove all items from user suitcase'
		);
	}
};
