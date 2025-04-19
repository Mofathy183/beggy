import { ErrorHandler } from '../utils/error.js';
import prisma from '../../prisma/prisma.js';

/**
 * Removes multiple items from the user's bag.
 *
 * @param {string} userId - The unique ID of the user.
 * @param {string} bagId - The unique ID of the bag.
 * @param {Object} body - The request body containing the item IDs to be removed.
 * @param {Array<string>} body.itemIds - The IDs of the items to be removed from the bag.
 *
 * @returns {Object|ErrorHandler} - Returns the updated bag items and metadata, or an ErrorHandler if an error occurs.
 */
export const removeItemsFromUserBag = async (userId, bagId, body) => {
	try {
		const { itemIds } = body;

		const deletedBagItems = await prisma.bagItems.deleteMany({
			where: {
				itemId: { in: itemIds },
				bagId: bagId,
			},
		});

		if (deletedBagItems.error)
			return new ErrorHandler(
				'prisma',
				deletedBagItems.error,
				'Failed to delete items from the database ' +
					deletedBagItems.error.message
			);

		const bagItems = await prisma.bags.findUnique({
			where: { id: bagId, userId: userId },
			include: {
				bagItems: {
					select: {
						item: true,
					},
				},
			},
		});

		const totalCount = await prisma.bagItems.count({
			where: {
				bagId: bagId,
			},
		});

		const meta = {
			totalCount: totalCount,
			totalDelete: deletedBagItems.count,
		};

		return { bagItems: bagItems, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to remove items from user bag'
		);
	}
};

/**
 * Removes a single item from the user's bag.
 *
 * @param {string} userId - The unique ID of the user.
 * @param {string} bagId - The unique ID of the bag.
 * @param {Object} body - The request body containing the item ID to be removed.
 * @param {string} body.itemId - The ID of the item to be removed from the bag.
 *
 * @returns {Object|ErrorHandler} - Returns the updated bag items and metadata, or an ErrorHandler if an error occurs.
 */
export const removeItemFromUserBag = async (userId, bagId, body) => {
	try {
		const { itemId } = body;

		const deletedBagItem = await prisma.bagItems.delete({
			where: { bagId_itemId: { bagId, itemId } },
		});

		if (!deletedBagItem)
			return new ErrorHandler(
				'bag item not deleted',
				'Failed to delete item from the database',
				'prisma Error'
			);

		if (deletedBagItem.error)
			return new ErrorHandler(
				'prisma',
				deletedBagItem.error,
				'Failed to delete item from the database ' +
					deletedBagItem.error.message
			);

		const bagItems = await prisma.bags.findUnique({
			where: { id: bagId, userId: userId },
			include: {
				bagItems: {
					select: {
						item: true,
					},
				},
			},
		});

		const totalCount = await prisma.bagItems.count({
			where: { bagId: bagId },
		});

		const meta = {
			totalCount: totalCount,
			totalDelete: deletedBagItem ? 1 : 0,
		};

		return { bagItems: bagItems, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'Catch',
			error,
			'Failed to remove item from user bag'
		);
	}
};

/**
 * Removes all items from the user's bag based on a search filter.
 *
 * @param {string} userId - The unique ID of the user.
 * @param {string} bagId - The unique ID of the bag.
 * @param {Object} searchFilter - The filter to search for items to be removed.
 *
 * @returns {Object|ErrorHandler} - Returns the updated bag items and metadata, or an ErrorHandler if an error occurs.
 */
export const removeAllItemsFromUserBag = async (
	userId,
	bagId,
	searchFilter
) => {
	try {
		const deletedBagItems = await prisma.bagItems.deleteMany({
			where: {
				item: searchFilter,
				bagId: bagId,
			},
		});

		if (deletedBagItems.error)
			return new ErrorHandler(
				'prisma',
				deletedBagItems.error,
				'Failed to delete all items from the database ' +
					deletedBagItems.error.message
			);

		const bagItems = await prisma.bags.findUnique({
			where: { id: bagId, userId: userId },
			include: {
				bagItems: {
					select: {
						item: true,
					},
				},
			},
		});

		const totalCount = await prisma.bagItems.count({
			where: {
				bagId: bagId,
			},
		});

		const meta = {
			totalCount: totalCount,
			totalDelete: deletedBagItems.count,
		};

		return { bagItems: bagItems, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to remove all items from user bag'
		);
	}
};

/**
 * Adds a single item to the user's bag.
 *
 * @param {string} userId - The unique ID of the user.
 * @param {string} bagId - The unique ID of the bag.
 * @param {Object} body - The request body containing the item ID to be added.
 * @param {string} body.itemId - The ID of the item to be added to the bag.
 *
 * @returns {Object|ErrorHandler} - Returns the updated bag items and metadata, or an ErrorHandler if an error occurs.
 */
export const addItemToUserBag = async (userId, bagId, body) => {
	try {
		const { itemId } = body;

		const bag = await prisma.bags.findUnique({
			where: { userId: userId, id: bagId },
		});

		if (!bag)
			return new ErrorHandler(
				'bag not found',
				'Failed to find bag in the database',
				'prisma Error'
			);

		if (bag.error)
			return new ErrorHandler(
				'prisma',
				bag.error,
				'Failed to find bag in the database ' + bag.error.message
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
			!(bag.capacity >= (userItem.volume * userItem.quantity) / 100) &&
			!(bag.weight >= (userItem.weight * userItem.quantity) / 100)
		)
			return new ErrorHandler(
				'bag capacity or weight exceeded',
				'The bag does not have enough capacity or weight to accommodate the item',
				'Bag capacity or weight exceeded'
			);

		const bagItem = await prisma.bagItems.upsert({
			where: {
				bagId_itemId: { bagId, itemId },
			},
			update: {
				itemId: itemId,
			},
			create: {
				bagId: bagId,
				itemId: itemId,
			},
		});

		if (!bagItem)
			return new ErrorHandler(
				'item not added in Bag',
				'Failed to add item to the bag in the database',
				'prisma Error'
			);

		if (bagItem.error)
			return new ErrorHandler(
				'prisma',
				bagItem.error,
				'Failed to add item to the bag in the database ' +
					bagItem.error.message
			);

		const userBag = await prisma.bags.findUnique({
			where: { userId: userId, id: bagId },
			include: {
				bagItems: {
					select: {
						item: true,
					},
				},
			},
		});

		if (!userBag)
			return new ErrorHandler(
				'bag is not full',
				'The bag has enough capacity and weight to accommodate the item',
				'Bag is not full'
			);

		if (userBag.error)
			return new ErrorHandler(
				'prisma',
				userBag.error,
				'Failed to find bag in the database ' + userBag.error.message
			);

		if (userBag.isWeightExceeded || userBag.isCapacityExceeded)
			return new ErrorHandler(
				'bag is exceeded capacity and weight',
				'Cannot add that item to bag ',
				'The bag will be exceeded capacity and weight if you add that item'
			);

		const totalCount = await prisma.bagItems.count({
			where: {
				bagId: bagId,
			},
		});

		const meta = {
			totalCount: totalCount,
			totalAdd: bagItem ? 1 : 0,
		};

		return { userBag: userBag, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to add item to user bag'
		);
	}
};

/**
 * Adds multiple items to the user's bag.
 *
 * @param {string} userId - The unique ID of the user.
 * @param {string} bagId - The unique ID of the bag.
 * @param {Object} body - The request body containing the items to be added.
 * @param {Array<Object>} body.itemsIds - An array of objects containing the IDs of the items to be added to the bag.
 * @param {string} body.itemsIds.itemId - The ID of the item to be added.
 *
 * @returns {Object|ErrorHandler} - Returns the updated bag items and metadata, or an ErrorHandler if an error occurs.
 */
export const addItemsToUserBag = async (userId, bagId, body) => {
	try {
		const bag = await prisma.bags.findUnique({
			where: { id: bagId, userId: userId },
		});

		if (!bag)
			return new ErrorHandler(
				'bag not found',
				'Failed to find bag in the database',
				'prisma Error'
			);

		if (bag.error)
			return new ErrorHandler(
				'prisma',
				bag.error,
				'Failed to find bag in the database ' + bag.error.message
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
				bag.capacity >= item.volume && bag.weight >= item.weight;

			return canFit ? { itemId } : {};
		});

		if (userItemsIds.length === 0)
			return new ErrorHandler(
				'bag capacity or weight exceeded',
				'The bag does not have enough capacity or weight to accommodate all the items',
				'Bag capacity or weight exceeded'
			);

		const bagItems = await prisma.bagItems.createMany({
			data: userItemsIds.map((item) => ({
				bagId,
				itemId: item.itemId,
			})),
			skipDuplicates: true,
		});

		if (bagItems.error)
			return new ErrorHandler(
				'prisma',
				bagItems.error,
				'Failed to add items to the bag in the database ' +
					bagItems.error.message
			);

		const isBagFull = await prisma.bags.findUnique({
			where: { id: bagId },
			include: {
				bagItems: {
					select: {
						item: true,
					},
				},
			},
		});

		if (isBagFull.isWeightExceeded || isBagFull.isCapacityExceeded)
			return new ErrorHandler(
				'bag is exceeded capacity and weight',
				'Cannot add those items to bag ',
				'The bag will be exceeded capacity and weight if you add those items'
			);

		const totalCount = await prisma.bagItems.count({
			where: {
				bagId: bagId,
			},
		});

		const meta = {
			totalCount: totalCount,
			totalAdd: bagItems ? bagItems.count : 0,
		};

		return { bagItems: isBagFull, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to add items to user bag'
		);
	}
};
