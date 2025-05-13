import { ErrorHandler } from '../utils/error.js';
import prisma from '../../prisma/prisma.js';
import { statusCode } from '../config/status.js';

/**
 * @function findItemsUserHas
 * @description Fetches the list of items associated with a specific user, based on filters, pagination, and sorting criteria.
 * @param {string} userId - The ID of the user whose items are being retrieved.
 * @param {Object} pagination - Contains page number, limit, and offset for paginated results.
 * @param {Object} searchFilter - Filtering conditions for the item search.
 * @param {Object} orderBy - Criteria to sort the results.
 * @returns {Promise<Object>} An object containing the user's items and metadata, or an error if the operation fails.
 */
export const findItemsUserHas = async (
	userId,
	pagination,
	searchFilter,
	orderBy
) => {
	try {
		const { page, limit, offset } = pagination;

		const userItems = await prisma.items.findMany({
			where: { ...searchFilter, userId: userId },
			take: limit,
			skip: offset,
			orderBy: orderBy,
		});

		if (userItems.error)
			return new ErrorHandler(
				'prisma',
				'User has no item' || userItems.error,
				'There is no item to that user' || userItems.error.message,
				statusCode.internalServerErrorCode
			);

		const itemsCount = await prisma.items.count({
			where: { userId: userId },
		});

		if (itemsCount.error)
			return new ErrorHandler(
				'prisma',
				'User has no item ' + itemsCount.error,
				'There is no item to that user ' + itemsCount.error.message,
				statusCode.internalServerErrorCode
			);

		const meta = {
			total: itemsCount,
			totalSearch: userItems.length,
			searchFilter,
			page: page,
			limit: limit,
			offset: offset,
			orderBy,
		};

		return { userItems: userItems, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			Object.keys(error).length === 0
				? 'Error Occur while Getting Your Items'
				: error,
			'Failed to get items user has ' + error.message,
			statusCode.internalServerErrorCode
		);
	}
};

/**
 * @function findItemUserHas
 * @description Retrieves a specific item owned by a user based on the item's ID.
 * @param {string} userId - The ID of the user who owns the item.
 * @param {string} itemId - The ID of the item to retrieve.
 * @returns {Promise<Object>} The item details, or an error if the operation fails.
 */
export const findItemUserHas = async (userId, itemId) => {
	try {
		const item = await prisma.items.findUnique({
			where: { id: itemId, userId: userId },
			select: {
				id: true,
				name: true,
				category: true,
				quantity: true,
				weight: true,
				volume: true,
				color: true,
				isFragile: true,
				userId: true,
			},
		});

		if (!item)
			return new ErrorHandler(
				'item',
				'Item not found',
				'Item not found in the database',
				statusCode.notFoundCode
			);

		if (item.error)
			return new ErrorHandler(
				'prisma',
				'Failed to find item in the database ' + item.error,
				'Failed to find item in the database ' + item.error.message,
				statusCode.internalServerErrorCode
			);

		return item;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			Object.keys(error).length === 0
				? 'Error Occur while Getting Your Item'
				: error,
			'Failed to find item user has',
			statusCode.internalServerErrorCode
		);
	}
};

/**
 * @function addItemToUser
 * @description Adds a new item for a user with the specified details.
 * @param {string} userId - The ID of the user to whom the item is being added.
 * @param {Object} body - Contains item details such as name, category, quantity, weight, etc.
 * @returns {Promise<Object>} The newly created item and metadata, or an error if the operation fails.
 */
export const addItemToUser = async (userId, body) => {
	try {
		const { name, category, quantity, weight, volume, color, isFragile } =
			body;

		const item = await prisma.items.create({
			data: {
				name,
				category,
				quantity,
				weight,
				volume,
				color,
				isFragile,
				userId: userId,
			},
			select: {
				id: true,
				name: true,
				category: true,
				quantity: true,
				weight: true,
				volume: true,
				color: true,
				isFragile: true,
				userId: true,
			},
		});

		if (!item)
			return new ErrorHandler(
				'Item null',
				'Item not Created',
				'Could not Make item',
				statusCode.noContentCode
			);

		if (item.error)
			return new ErrorHandler(
				'prisma',
				'Failed to create item in the database ' + item.error,
				'Failed to create item in the database ' + item.error.message,
				statusCode.internalServerErrorCode
			);

		const totalCount = await prisma.items.count({
			where: { userId: userId },
		});

		const meta = {
			totalCount: totalCount,
			created: 1,
		};

		return { item: item, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			Object.keys(error).length === 0
				? 'Error Occur while Making Your Item'
				: error,
			'Failed to add item to user',
			statusCode.internalServerErrorCode
		);
	}
};

/**
 * @function addItemsToUSer
 * @description Adds multiple items for a user in bulk, based on the input details.
 * @param {string} userId - The ID of the user to whom the items are being added.
 * @param {Array<Object>} body - Array containing details for each item to be added.
 * @returns {Promise<Object>} Metadata for the created items, or an error if the operation fails.
 */
export const addItemsToUSer = async (userId, body) => {
	try {
		const items = body.map((item) => ({
			userId: userId,
			name: item.name,
			category: item.category,
			quantity: item.quantity,
			weight: item.weight || undefined,
			volume: item.volume || undefined,
			color: item.color || undefined,
			isFragile: item.isFragile || undefined,
		}));

		const createdItems = await prisma.items.createMany({
			data: items,
		});

		if (!createdItems)
			return new ErrorHandler(
				'Items null',
				'Items not Created',
				'Could not Make items',
				statusCode.notFoundCode
			);

		if (createdItems.error)
			return new ErrorHandler(
				'prisma',
				'Failed to create items in the database ' + createdItems.error,
				'Failed to create items in the database ' +
					createdItems.error.message,
				statusCode.internalServerErrorCode
			);

		const totalCount = await prisma.items.count({
			where: { userId: userId },
		});

		const meta = {
			totalCount: totalCount,
			created: createdItems.count,
		};

		return { createdItems: createdItems, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			Object.keys(error).length === 0
				? 'Error Occur while Making Your Items'
				: error,
			'Failed to add items to user',
			statusCode.internalServerErrorCode
		);
	}
};

/**
 * @function replaceItemUserHas
 * @description Replaces the details of an existing item owned by a user.
 * @param {string} userId - The ID of the user who owns the item.
 * @param {string} itemId - The ID of the item to be replaced.
 * @param {Object} body - New data to update the item.
 * @returns {Promise<Object>} The updated item details, or an error if the operation fails.
 */
export const replaceItemUserHas = async (userId, itemId, body) => {
	try {
		const { name, category, weight, volume, color, isFragile, quantity } =
			body;

		const itemUpdate = await prisma.items.update({
			where: { id: itemId, userId: userId },
			data: {
				name: name,
				category: category,
				quantity: quantity,
				isFragile: isFragile,
				color: color,
				weight: weight,
				volume: volume,
			},
			select: {
				id: true,
				name: true,
				category: true,
				quantity: true,
				weight: true,
				volume: true,
				color: true,
				isFragile: true,
				userId: true,
			},
		});

		if (!itemUpdate)
			return new ErrorHandler(
				'item',
				'Item not found',
				'Item not found in the database',
				statusCode.notFoundCode
			);

		if (itemUpdate.error)
			return new ErrorHandler(
				'prisma',
				'Failed to update item in the database ' + itemUpdate.error,
				'Failed to update item in the database ' +
					itemUpdate.error.message,
				statusCode.internalServerErrorCode
			);

		return itemUpdate;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			Object.keys(error).length === 0
				? 'Error Occur while Replacing Your Item'
				: error,
			'Failed to replace item user has ' + error.message,
			statusCode.internalServerErrorCode
		);
	}
};

/**
 * @function modifyItemUserHas
 * @description Modifies specific fields of an item owned by a user, based on the provided details.
 * @param {string} userId - The ID of the user who owns the item.
 * @param {string} itemId - The ID of the item to be modified.
 * @param {Object} body - Partial fields to update.
 * @returns {Promise<Object>} The modified item details, or an error if the operation fails.
 */
export const modifyItemUserHas = async (userId, itemId, body) => {
	try {
		const { name, category, weight, volume, color, isFragile, quantity } =
			body;

		const itemUpdate = await prisma.items.update({
			where: { id: itemId, userId: userId },
			data: {
				name: name || undefined,
				category: category || undefined,
				quantity: quantity || undefined,
				isFragile: isFragile || undefined,
				color: color || undefined,
				weight: weight || undefined,
				volume: volume || undefined,
			},
			select: {
				id: true,
				name: true,
				category: true,
				quantity: true,
				weight: true,
				volume: true,
				color: true,
				isFragile: true,
				userId: true,
			},
		});

		if (!itemUpdate)
			return new ErrorHandler(
				'item',
				'Item not found',
				'Item not found in the database',
				statusCode.notFoundCode
			);

		if (itemUpdate.error)
			return new ErrorHandler(
				'prisma',
				'Failed to update item in the database ' + itemUpdate.error,
				'Failed to update item in the database ' +
					itemUpdate.error.message,
				statusCode.internalServerErrorCode
			);

		return itemUpdate;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			Object.keys(error).length === 0
				? 'Error Occur while Modifying Your Item'
				: error,
			'Failed to modify item user has' + error.message,
			statusCode.internalServerErrorCode
		);
	}
};

/**
 * @function removeAllItemsUserHas
 * @description Deletes all items associated with a user based on filtering criteria.
 * @param {string} userId - The ID of the user whose items are being deleted.
 * @param {Object} searchFilter - Filtering conditions for item deletion.
 * @returns {Promise<Object>} Metadata of the deletion operation, or an error if the operation fails.
 */
export const removeAllItemsUserHas = async (userId, searchFilter) => {
	try {
		const deletedItems = await prisma.items.deleteMany({
			where: { ...searchFilter, userId: userId },
		});

		if (!deletedItems)
			return new ErrorHandler(
				'item',
				'Items not found',
				'You have no items to delete',
				statusCode.notFoundCode
			);

		if (deletedItems.error)
			return new ErrorHandler(
				'prisma',
				'Failed to delete all items from the database ' +
					deletedItems.error,
				'Failed to delete all items from the database ' +
					deletedItems.error.message,
				statusCode.internalServerErrorCode
			);

		const meta = {
			deleteCount: deletedItems.count,
			deleted: deletedItems.count,
		};

		return { deletedItems: deletedItems, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			Object.keys(error).length === 0
				? 'Error Occur while Removing Your Items By Filter'
				: error,
			'Failed to remove all items user has',
			statusCode.internalServerErrorCode
		);
	}
};

/**
 * @function removeItemUserHas
 * @description Removes a specific item owned by a user based on the item's ID.
 * @param {string} userId - The ID of the user who owns the item.
 * @param {string} itemId - The ID of the item to delete.
 * @returns {Promise<Object>} An object with metadata and the deleted item details, or an error if the operation fails.
 */
export const removeItemUserHas = async (userId, itemId) => {
	try {
		const deletedItem = await prisma.items.delete({
			where: { id: itemId, userId: userId },
		});

		if (!deletedItem)
			return new ErrorHandler(
				'item',
				'Item not found',
				'Item not found in the database',
				statusCode.notFoundCode
			);

		if (deletedItem.error)
			return new ErrorHandler(
				'prisma',
				'Failed to delete item from the database ' + deletedItem.error,
				'Failed to delete item from the database ' +
					deletedItem.error.message,
				statusCode.internalServerErrorCode
			);

		const totalCount = await prisma.items.count({
			where: { userId: userId },
		});

		const meta = {
			deleteCount: totalCount,
			deleted: 1,
		};

		return { deletedItem: deletedItem, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			Object.keys(error).length === 0
				? 'Error Occur while Removing Your Item'
				: error,
			'Failed to remove item user has',
			statusCode.internalServerErrorCode
		);
	}
};
