import {
	findItemsUserHas,
	findItemUserHas,
	addItemToUser,
	addItemsToUSer,
	removeItemUserHas,
	removeAllItemsUserHas,
	replaceItemUserHas,
	modifyItemUserHas,
} from '../../services/itemsService.js';
import { statusCode } from '../../config/status.js';
import { sendCookies, storeSession } from '../../utils/authHelper.js';
import { ErrorResponse } from '../../utils/error.js';
import SuccessResponse from '../../utils/successResponse.js';


export const getItemsBelongsToUser = async (req, res, next) => {
	try {
		const { pagination, searchFilter = undefined, orderBy = undefined } = req;
		const { userId, userRole } = req.session;

		const { userItems, meta } = await findItemsUserHas(userId, pagination, searchFilter, orderBy);

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
					'Error finding items ' + userItems.error,
					"Couldn't find items user has " + userItems.error.message,
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				`Successfully Found All Items User Has${searchFilter ? " By Search" : ""}`,
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
					'Error finding item ' + item.error,
					"Couldn't find item user has " + item.error.message,
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully Found Item User Has By ID',
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

export const createItemForUser = async (req, res, next) => {
	try {
		const { body } = req;
		const { userId, userRole } = req.session;

		const { item, meta } = await addItemToUser(userId, body);

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
					'Failed to create item for user ' + item.error.message,
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.createdCode,
				'Item Created Successfully For User',
				item,
				meta
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

		if (createdItems.error)
			return next(
				new ErrorResponse(
					createdItems.error,
					'Failed to create items for user ' +
						createdItems.error.message,
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);

		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.createdCode,
				'Items Created Successfully For User',
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
					'Failed to replace item Belongs to user ' +
						itemUpdate.error.message,
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully Replaced Item Belongs to User',
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
					'Failed to modify item Belongs to user ' +
						itemUpdate.error.message,
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully Modified Item Belongs to User',
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

export const deleteItemBelongsTo = async (req, res, next) => {
	try {
		const { itemId } = req.params;
		const { userId, userRole } = req.session;

		const { deletedItem, meta } = await removeItemUserHas(userId, itemId);

		if (!deletedItem)
			return next(
				new ErrorResponse(
					'Item not found',
					'Failed to find item by id',
					statusCode.notFoundCode
				)
			);

		if (deletedItem.error)
			return next(
				new ErrorResponse(
					'Failed to delete item Belongs to user ' +
						deletedItem.error,
					'Failed to delete item Belongs to user ' +
						deletedItem.error.message,
					statusCode.internalServerErrorCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully Deleted Item Belongs to User',
				deletedItem,
				meta
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

export const deleteAllItemsBelongsToUser = async (req, res, next) => {
	try {
		const { userId, userRole } = req.session;
        const { searchFilter = undefined } = req;

		const { deletedItems, meta } = await removeAllItemsUserHas(userId, searchFilter);

		if (deletedItems.error)
			return next(
				new ErrorResponse(
					'Failed to delete all items Belongs to user ' +
						deletedItems.error,
					'Failed to delete all items Belongs to user ' +
						deletedItems.error.message,
					statusCode.internalServerErrorCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				`Successfully Deleted All Items Belongs to User${searchFilter ? " By Search" : ""}`,
				deletedItems,
				meta
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
