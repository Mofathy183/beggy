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
import { ErrorResponse, sendServiceResponse } from '../../utils/error.js';
import SuccessResponse from '../../utils/successResponse.js';



//*======================================={Items Public Route}==============================================

export const getItemsById = async (req, res, next) => {
	try {
		const { itemId } = req.params;

		const item = await findItemById(itemId);

		if (sendServiceResponse(next, item)) return;

		if (!item)
			return next(
				new ErrorResponse(
					'Item not found',
					'Failed to find item by id',
					statusCode.notFoundCode
				)
			);

		if (item.error)
			return next(
				new ErrorResponse(
					'Failed to find item by id ' + item.error,
					'Failed to find item by id ' + item.error.message,
					statusCode.internalServerErrorCode
				)
			);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully found item by id',
				item
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Getting Item By Id'
					: error,
				'Failed to get item by id',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const getItemsByQuery = async (req, res, next) => {
	try {
		const {
			pagination,
			orderBy = undefined,
			searchFilter = undefined,
		} = req;

		const allItems = await findItemsByQuery(
			pagination,
			searchFilter,
			orderBy
		);

		if (sendServiceResponse(next, allItems)) return;

		const { items, meta } = allItems;

		if (items.error)
			return next(
				new ErrorResponse(
					'Failed to find all items ' + items.error,
					'Failed to find all items ' + items.error.message,
					statusCode.internalServerErrorCode
				)
			);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				`Successfully found all items${searchFilter ? ' by Search' : ''}`,
				items,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Getting Items By Filter'
					: error,
				'Failed to get all items',
				statusCode.internalServerErrorCode
			)
		);
	}
};

//*======================================={Items Public Route}=============================================

//*======================================={Items Private Route}==============================================

export const replaceItemById = async (req, res, next) => {
	try {
		const { itemId } = req.params;
		const { body } = req as Request<{}, {}, any>;
		const { userId, userRole } = req.session;

		const itemUpdate = await replaceItemResource(itemId, body);

		if (sendServiceResponse(next, itemUpdate)) return;

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
					'Failed to replace item by itemId ' +
						itemUpdate.error.message,
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully Replaced Item by ID',
				itemUpdate
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Replacing Item'
					: error,
				'Failed to replace item by id',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const modifyItemById = async (req, res, next) => {
	try {
		const { itemId } = req.params;
		const { body } = req as Request<{}, {}, any>;
		const { userId, userRole } = req.session;

		const itemUpdate = await modifyItemResource(itemId, body);

		if (sendServiceResponse(next, itemUpdate)) return;

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
					'Failed to modify item by id' + itemUpdate.error.message,
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully Modified Item by ID',
				itemUpdate
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Modifying Item'
					: error,
				'Failed to modify item by id',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const deleteItemById = async (req, res, next) => {
	try {
		const { itemId } = req.params;
		const { userId, userRole } = req.session;

		const removeItem = await removeItemById(itemId);

		if (sendServiceResponse(next, removeItem)) return;

		const { deletedItem, meta } = removeItem;

		if (deletedItem.error)
			return next(
				new ErrorResponse(
					'Failed to delete item by id ' + deletedItem.error,
					'Failed to delete item by id ' + deletedItem.error.message,
					statusCode.internalServerErrorCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully Deleted Item by ID',
				deletedItem,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Removing Item'
					: error,
				'Failed to delete item by id',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const deleteAllItems = async (req, res, next) => {
	try {
		const { userId, userRole } = req.session;
		const { searchFilter = undefined } = req;

		const removeItems = await removeAllItems(searchFilter);

		if (sendServiceResponse(next, removeItems)) return;

		const { deleteCount, meta } = removeItems;

		if (deleteCount.error)
			return next(
				new ErrorResponse(
					'Failed to delete all items ' + deleteCount.error,
					'Failed to delete all items ' + deleteCount.error.message,
					statusCode.internalServerErrorCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				`Successfully Delete All Items${searchFilter ? ' By Search' : ''}`,
				deleteCount,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Removing Items By Filter'
					: error,
				'Failed to delete all items',
				statusCode.internalServerErrorCode
			)
		);
	}
};

//*======================================={Items Private Route}==============================================


//*======================================={Items ME Route}==============================================

export const getItemsBelongsToUser = async (req, res, next) => {
	try {
		const {
			pagination,
			searchFilter = undefined,
			orderBy = undefined,
		} = req;
		const { userId, userRole } = req.session;

		const hisItems = await findItemsUserHas(
			userId,
			pagination,
			searchFilter,
			orderBy
		);

		if (sendServiceResponse(next, hisItems)) return;

		const { userItems, meta } = hisItems;

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
				`Successfully Found All Items User Has${searchFilter ? ' By Search' : ''}`,
				userItems,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Getting Your Items'
					: error,
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

		if (sendServiceResponse(next, item)) return;

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
				Object.keys(error).length === 0
					? 'Error Occur while Getting Your Item'
					: error,
				'Failed to get item Belongs to user',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const createItemForUser = async (req, res, next) => {
	try {
		const { body } = req as Request<{}, {}, any>;
		const { userId, userRole } = req.session;

		const hisItem = await addItemToUser(userId, body);

		if (sendServiceResponse(next, hisItem)) return;

		const { item, meta } = hisItem;

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
				Object.keys(error).length === 0
					? 'Error Occur while Making Your Item'
					: error,
				'Failed to Create item for User',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const createItemsForUser = async (req, res, next) => {
	try {
		const { body } = req as Request<{}, {}, any>;
		const { userId, userRole } = req.session;

		const hisItem = await addItemsToUSer(userId, body);

		if (sendServiceResponse(next, hisItem)) return;

		const { createdItems, meta } = hisItem;

		if (!createdItems)
			return next(
				new ErrorResponse(
					'Items are not defined',
					'Items not defined',
					statusCode.badRequestCode
				)
			);

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
				Object.keys(error).length === 0
					? 'Error Occur while Making Your Items'
					: error,
				'Failed to Create items for User',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const replaceItemBelongsToUser = async (req, res, next) => {
	try {
		const { itemId } = req.params;
		const { body } = req as Request<{}, {}, any>;
		const { userId, userRole } = req.session;

		const itemUpdate = await replaceItemUserHas(userId, itemId, body);

		if (sendServiceResponse(next, itemUpdate)) return;

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
				Object.keys(error).length === 0
					? 'Error Occur while Replacing Your Item'
					: error,
				'Failed to replace item Belongs to user',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const modifyItemBelongsToUser = async (req, res, next) => {
	try {
		const { itemId } = req.params;
		const { body } = req as Request<{}, {}, any>;
		const { userId, userRole } = req.session;

		const itemUpdate = await modifyItemUserHas(userId, itemId, body);

		if (sendServiceResponse(next, itemUpdate)) return;

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
				Object.keys(error).length === 0
					? 'Error Occur while Modifying Your Item'
					: error,
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

		const deletingHisItem = await removeItemUserHas(userId, itemId);

		if (sendServiceResponse(next, deletingHisItem)) return;

		const { deletedItem, meta } = deletingHisItem;

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
				Object.keys(error).length === 0
					? 'Error Occur while Removing Your Item'
					: error,
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

		const deletingHisItems = await removeAllItemsUserHas(
			userId,
			searchFilter
		);

		if (sendServiceResponse(next, deletingHisItems)) return;

		const { deletedItems, meta } = deletingHisItems;

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
				`Successfully Deleted All Items Belongs to User${searchFilter ? ' By Search' : ''}`,
				deletedItems,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Removing Your Items By Filter'
					: error,
				'Failed to delete all items Belongs to user',
				statusCode.internalServerErrorCode
			)
		);
	}
};

//*======================================={Items ME Route}==============================================