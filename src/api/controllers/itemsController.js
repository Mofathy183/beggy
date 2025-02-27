import {
	findItemsUserHas,
	findItemUserHas,
	addItemToUser,
	addItemsToUSer,
	findItemById,
	findItemsByQuery,
	findAllItems,
	removeAllItems,
	removeItemUserHas,
	removeAllItemsUserHas,
	replaceItemResource,
	modifyItemResource,
	replaceItemUserHas,
	modifyItemUserHas,
} from '../../services/itemsService.js';
import { statusCode } from '../../config/status.js';
import { sendCookies, storeSession } from '../../utils/authHelper.js';
import { ErrorResponse } from '../../utils/error.js';
import SuccessResponse from '../../utils/successResponse.js';

export const createItemForUser = async (req, res, next) => {
	try {
		const { body } = req;
		const { userId, userRole } = req.session;

		const item = await addItemToUser(userId, body);

		if (!item)
			return next(
				new ErrorResponse(
					'Item is not defined',
					'Item not defined',
					statusCode.badRequestCode
				)
			);

		if (item.error)
			return next(
				new ErrorResponse(
					item.error,
					'Failed to create item for user',
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.createdCode,
				'Item created successfully and add it to user',
				item
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to Create item for User',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const createItemsForUser = async (req, res, next) => {
	try {
		const { body } = req;
		const { userId, userRole } = req.session;

		const { createdItems, meta } = await addItemsToUSer(userId, body);

		if (!createdItems || createdItems.length === 0) {
			return next(
				new ErrorResponse(
					'No items provided',
					'No items were created',
					statusCode.badRequestCode
				)
			);
		}

		if (createdItems.error)
			return next(
				new ErrorResponse(
					createdItems.error,
					'Failed to create items for user',
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);

		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.createdCode,
				'Items created successfully and added to user',
				createdItems,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to Create items for User',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const getItemsBelongsToUser = async (req, res, next) => {
	try {
		const { pagination } = req;
		const { userId, userRole } = req.session;

		const { userItems, meta } = await findItemsUserHas(userId, pagination);

		if (!userItems)
			return next(
				new ErrorResponse(
					'No items found for user',
					'No items were found',
					statusCode.notFoundCode
				)
			);

		if (userItems.error)
			next(
				new ErrorResponse(
					'Error finding items' || userItems.error,
					"Couldn't find items user has" || userItems.error.message,
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res), storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully found items user has',
				userItems,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to get items Belongs to user',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const getItemBelongsToUser = async (req, res, next) => {
	try {
		const { itemId } = req.params;
		const { userId, userRole } = req.session;

		const item = await findItemUserHas(userId, itemId);

		if (!item)
			return next(
				new ErrorResponse(
					'Item not found',
					'Item not found',
					statusCode.notFoundCode
				)
			);

		if (item.error)
			return next(
				new ErrorResponse(
					'Error finding item' || item.error,
					"Couldn't find item user has" || item.error.message,
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res), storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully found item user has',
				item
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to get item Belongs to user',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const getItemsById = async (req, res, next) => {
	try {
		const { itemId } = req.params;

		const item = await findItemById(itemId);

		if (!item)
			return next(
				new ErrorResponse(
					'Item not found',
					'Failed to find item by id',
					statusCode.notFoundCode
				)
			);

		if (!item.error)
			return next(
				new ErrorResponse(
					item.error || 'Failed to find item by id',
					'Failed to find item by id',
					statusCode.internalServerErrorCode
				)
			);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to get item by id',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const getItemsByQuery = async (req, res, next) => {
	try {
		const { pagination, orderBy, searchFilter } = req;

		const { items, meta } = await findItemsByQuery(
			pagination,
			searchFilter,
			orderBy
		);

		if (!items.error)
			return next(
				new ErrorResponse(
					items.error || 'Failed to find all items',
					'Failed to find all items',
					statusCode.internalServerErrorCode
				)
			);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully found all items',
				items,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to get all items',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const getAllItems = async (req, res, next) => {
	try {
		const { pagination } = req;

		const { items, meta } = await findAllItems(pagination);

		if (!items.error)
			return next(
				new ErrorResponse(
					items.error || 'Failed to find all items',
					'Failed to find all items',
					statusCode.internalServerErrorCode
				)
			);

		sendCookies(req.session.userId, res);
		storeSession(req.session.userId, req.session.userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully found all items',
				items,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to get all items',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const replaceItemById = async (req, res, next) => {
	try {
		const { itemId } = req.params;
		const { body } = req;
		const { userId, userRole } = req.session;

		const itemUpdate = await replaceItemResource(itemId, body);

		if (itemUpdate.error)
			return next(
				new ErrorResponse(
					itemUpdate.error,
					'Failed to replace item by itemId',
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully replaced item by id',
				itemUpdate
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to replace item by id',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const modifyItemById = async (req, res, next) => {
	try {
		const { itemId } = req.params;
		const { body } = req;
		const { userId, userRole } = req.session;

		const itemUpdate = await modifyItemResource(itemId, body);

		if (itemUpdate.error)
			return next(
				new ErrorResponse(
					itemUpdate.error,
					'Failed to modify item by id',
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully modified item by id',
				itemUpdate
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to modify item by id',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const replaceItemBelongsToUser = async (req, res, next) => {
	try {
		const { itemId } = req.params;
		const { body } = req;
		const { userId, userRole } = req.session;

		const itemUpdate = await replaceItemUserHas(userId, itemId, body);

		if (!itemUpdate)
			return next(
				new ErrorResponse(
					'Item not found',
					'Failed to find item by id',
					statusCode.notFoundCode
				)
			);

		if (itemUpdate.error)
			return next(
				new ErrorResponse(
					itemUpdate.error,
					'Failed to replace item Belongs to user',
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully replaced item Belongs to user',
				itemUpdate
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to replace item Belongs to user',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const modifyItemBelongsToUser = async (req, res, next) => {
	try {
		const { itemId } = req.params;
		const { body } = req;
		const { userId, userRole } = req.session;

		const itemUpdate = await modifyItemUserHas(userId, itemId, body);

		if (itemUpdate.error)
			return next(
				new ErrorResponse(
					itemUpdate.error,
					'Failed to modify item Belongs to user',
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully modified item Belongs to user',
				itemUpdate
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to modify item Belongs to user',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const deleteAllItemsBelongsToUser = async (req, res, next) => {
	try {
		const { userId, userRole } = req.session;

		const deleteCount = await removeAllItemsUserHas(userId);

		if (deleteCount === 0)
			return next(
				new ErrorResponse(
					'No items found to delete',
					'Failed to delete all items Belongs to user',
					statusCode.notFoundCode
				)
			);

		if (deleteCount.error)
			return next(
				new ErrorResponse(
					deleteCount.error ||
						'Failed to delete all items Belongs to user',
					'Failed to delete all items Belongs to user',
					statusCode.internalServerErrorCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.noContentCode,
				'Successfully deleted all items Belongs to user',
				deleteCount
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to delete all items Belongs to user',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const deleteItemBelongsTo = async (req, res, next) => {
	try {
		const { itemId } = req.params;
		const { userId, userRole } = req.session;

		const deleteCount = await removeItemUserHas(userId, itemId);

		if (!deleteCount)
			return next(
				new ErrorResponse(
					'Item not found',
					'Failed to find item by id',
					statusCode.notFoundCode
				)
			);

		if (deleteCount.error)
			return next(
				new ErrorResponse(
					deleteCount.error ||
						'Failed to delete item Belongs to user',
					'Failed to delete item Belongs to user',
					statusCode.internalServerErrorCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully deleted item Belongs to user',
				deleteCount
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to delete item Belongs to user',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const deleteItemById = async (req, res, next) => {
	try {
		const { itemId } = req.params;
		const { userId, userRole } = req.session;

		const deleteCount = await deleteItemById(itemId);

		if (deleteCount.error)
			return next(
				new ErrorResponse(
					deleteCount.error || 'Failed to delete item by id',
					'Failed to delete item by id',
					statusCode.internalServerErrorCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully deleted item by id',
				deleteCount
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to delete item by id',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const deleteAllItems = async (req, res, next) => {
	try {
		const { userId, userRole } = req.session;

		const deleteCount = await removeAllItems();

		if (deleteCount.error)
			return next(
				new ErrorResponse(
					deleteCount.error || 'Failed to delete all items',
					'Failed to delete all items',
					statusCode.internalServerErrorCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully deleted all items',
				deleteCount
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to delete all items',
				statusCode.internalServerErrorCode
			)
		);
	}
};
