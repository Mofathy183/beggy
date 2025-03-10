import { ErrorResponse } from '../../utils/error.js';
import { statusCode } from '../../config/status.js';
import SuccessResponse from '../../utils/successResponse.js';
import { sendCookies, storeSession } from '../../utils/authHelper.js';
import {
	findAllBagsByQuery,
	findBagById,
	replaceBagResource,
	modifyBagResource,
	removeBagById,
	removeAllBags,
	findBagsUserHas,
	findBagUserHasById,
	addBagToUser,
	replaceBagUserHas,
	modifyBagUserHas,
	removeBagUserHasById,
	removeAllBagsUserHas,
	removeItemsFromUserBag,
	removeItemFromUserBag,
	removeAllItemsFromUserBag,
	addItemToUserBag,
	addItemsToUserBag,
} from '../../services/bagsService.js';

export const getAllBagsByQuery = async (req, res, next) => {
	try {
		const { searchFilter, pagination, orderBy } = req;
		const { bags, meta } = await findAllBagsByQuery(
			searchFilter,
			pagination,
			orderBy
		);

		if (bags.error)
			return next(
				new ErrorResponse(
					bags.error,
					'Failed to retrieve bags ' + bags.error.message,
					statusCode.internalServerErrorCode
				)
			);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				`Successfully Retrieved All Bags${searchFilter ? ' By Search' : ''}`,
				bags,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to retrieve bags ' + error.message,
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const getBagById = async (req, res, next) => {
	try {
		const { bagId } = req.params;
		const { bag, meta } = await findBagById(bagId);

		if (!bag)
			return next(
				new ErrorResponse(
					'Bag not found',
					'Failed to retrieve bag',
					statusCode.notFoundCode
				)
			);

		if (bag.error)
			return next(
				new ErrorResponse(
					bag.error,
					'Failed to retrieve bag ' + bag.error.message,
					statusCode.internalServerErrorCode
				)
			);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully Retrieved Bag By ID',
				bag,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to retrieve bag',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const replaceBagById = async (req, res, next) => {
	try {
		const { bagId } = req.params;
		const { body } = req;

		const bagUpdate = await replaceBagResource(bagId, body);

		if (!bagUpdate)
			return next(
				new ErrorResponse(
					'Bag not found',
					'Failed to replace bag',
					statusCode.notFoundCode
				)
			);

		if (bagUpdate.error)
			return next(
				new ErrorResponse(
					bagUpdate.error,
					'Failed to replace bag ' + bagUpdate.error.message,
					statusCode.badRequestCode
				)
			);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully Replaced Bag By ID',
				bagUpdate
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to replace bag',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const modifyBagById = async (req, res, next) => {
	try {
		const { bagId } = req.params;
		const { body } = req;

		const bagUpdate = await modifyBagResource(bagId, body);

		if (!bagUpdate)
			return next(
				new ErrorResponse(
					'Bag not found',
					'Failed to Modify bag',
					statusCode.notFoundCode
				)
			);

		if (bagUpdate.error)
			return next(
				new ErrorResponse(
					bagUpdate.error,
					'Failed to Modify bag ' + bagUpdate.error.message,
					statusCode.badRequestCode
				)
			);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully Replaced Bag By ID',
				bagUpdate
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to modify bag',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const deleteBagById = async (req, res, next) => {
	try {
		const { bagId } = req.params;

		const { bagDelete, meta } = await removeBagById(bagId);

		if (!bagDelete)
			return next(
				new ErrorResponse(
					'Bag not found',
					'Failed to delete bag',
					statusCode.notFoundCode
				)
			);

		if (bagDelete.error)
			return next(
				new ErrorResponse(
					bagDelete.error,
					'Failed to delete bag ' + bagDelete.error.message,
					statusCode.badRequestCode
				)
			);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully Deleted Bag By ID',
				bagDelete,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to delete bag',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const deleteAllBags = async (req, res, next) => {
	try {
		const { deleteCount, meta } = await removeAllBags();

		if (deleteCount.error)
			return next(
				new ErrorResponse(
					deleteCount.error,
					'Failed to delete all bags ' + deleteCount.error.message,
					statusCode.badRequestCode
				)
			);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully Delete All Bags',
				deleteCount,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to delete all bags',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const getBagsBelongsToUser = async (req, res, next) => {
	try {
		const { userId, userRole } = req.session;
		const {
			searchFilter = undefined,
			pagination,
			orderBy = undefined,
		} = req;

		const { userBags, meta } = await findBagsUserHas(
			userId,
			searchFilter,
			pagination,
			orderBy
		);

		if (!userBags)
			return next(
				new ErrorResponse(
					'No bags found for user',
					'No bags were found',
					statusCode.notFoundCode
				)
			);

		if (userBags.error)
			return next(
				new ErrorResponse(
					userBags.error,
					'Failed to retrieve bags ' + userBags.error.message,
					statusCode.internalServerErrorCode
				)
			);

		sendCookies(userId, res);

		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully Retrieved Bags User Has',
				userBags,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to retrieve items ' + error.message,
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const getBagBelongsToUser = async (req, res, next) => {
	try {
		const { bagId } = req.params;
		const { userId, userRole } = req.session;

		const { userBag, meta } = await findBagUserHasById(userId, bagId);

		console.log('found', userBag);

		if (!userBag)
			return next(
				new ErrorResponse(
					'Bag not found for user' + userBag,
					'Bag not found',
					statusCode.notFoundCode
				)
			);

		if (userBag.error)
			return next(
				new ErrorResponse(
					userBag.error,
					'Failed to retrieve bag',
					statusCode.internalServerErrorCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully Retrieved Bag User Has',
				userBag,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to retrieve bag',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const createBagForUser = async (req, res, next) => {
	try {
		const { userId, userRole } = req.session;
		const { body } = req;

		const { meta, newBag } = await addBagToUser(userId, body);

		if (!newBag)
			return next(
				new ErrorResponse(
					'Failed to create bag for user',
					'Failed to create bag',
					statusCode.badRequestCode
				)
			);

		if (newBag.error)
			return next(
				new ErrorResponse(
					newBag.error,
					'Failed to create bag for user ' + newBag.error.message,
					statusCode.internalServerErrorCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.createdCode,
				'Successfully Created Bag For User',
				newBag,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to create bag for user',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const createItemForUserBag = async (req, res, next) => {
	try {
		const { bagId } = req.params;
		const { userId, userRole } = req.session;
		const { body } = req;

		const { userBag, meta } = await addItemToUserBag(userId, bagId, body);

		if (!userBag)
			return next(
				new ErrorResponse(
					'Failed to create item for bag',
					'Failed to create item',
					statusCode.badRequestCode
				)
			);

		if (userBag.error)
			return next(
				new ErrorResponse(
					userBag.error,
					'Failed to create item for bag ' + userBag.error.message,
					statusCode.internalServerErrorCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.createdCode,
				"Successfully Added User's Item To User's Bag",
				userBag,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to create item for bag',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const createItemsForUserBag = async (req, res, next) => {
	try {
		const { bagId } = req.params;
		const { userId, userRole } = req.session;
		const { body } = req;

		const { bagItems, meta } = await addItemsToUserBag(userId, bagId, body);

		if (!bagItems)
			return next(
				new ErrorResponse(
					'Failed to create items for bag',
					'Failed to create items',
					statusCode.badRequestCode
				)
			);

		if (bagItems.error)
			return next(
				new ErrorResponse(
					bagItems.error,
					'Failed to create items for bag ' + bagItems.error.message,
					statusCode.internalServerErrorCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.createdCode,
				"Successfully Added User's Items To User's Bag",
				bagItems,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to create items for bag',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const replaceBagBelongsToUser = async (req, res, next) => {
	try {
		const { bagId } = req.params;
		const { userId, userRole } = req.session;
		const { body } = req;

		const bagUpdate = await replaceBagUserHas(userId, bagId, body);

		if (!bagUpdate)
			return next(
				new ErrorResponse(
					'Bag not found for user',
					'Failed to replace bag',
					statusCode.notFoundCode
				)
			);

		if (bagUpdate.error)
			return next(
				new ErrorResponse(
					bagUpdate.error,
					'Failed to replace bag for user ' + bagUpdate.error.message,
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				"Successfully Replace User's Bag",
				bagUpdate
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to modify bag for user',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const modifyBagBelongsToUser = async (req, res, next) => {
	try {
		const { bagId } = req.params;
		const { userId, userRole } = req.session;
		const { body } = req;

		const bagUpdate = await modifyBagUserHas(userId, bagId, body);

		if (!bagUpdate)
			return next(
				new ErrorResponse(
					'Bag not found for user',
					'Failed to modify bag',
					statusCode.notFoundCode
				)
			);

		if (bagUpdate.error)
			return next(
				new ErrorResponse(
					bagUpdate.error,
					'Failed to modify bag for user ' + bagUpdate.error.message,
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				"Successfully Modified User's Bag",
				bagUpdate
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to modify bag for user',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const deleteBagBelongsToUserById = async (req, res, next) => {
	try {
		const { bagId } = req.params;
		const { userId, userRole } = req.session;

		const { deletedBag, meta } = await removeBagUserHasById(userId, bagId);

		if (!deletedBag)
			return next(
				new ErrorResponse(
					'Bag not found for user',
					'Failed to delete bag',
					statusCode.notFoundCode
				)
			);

		if (deletedBag.error)
			return next(
				new ErrorResponse(
					deletedBag.error,
					'Failed to delete bag for user ' + deletedBag.error.message,
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				"Successfully Deleted User's Bag",
				deletedBag,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to delete bag for user',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const deleteItemFromUserBag = async (req, res, next) => {
	try {
		const { bagId } = req.params;
		const { userId, userRole } = req.session;
		const { body } = req;

		const { bagItems, meta } = await removeItemFromUserBag(
			userId,
			bagId,
			body
		);

		if (!bagItems)
			return next(
				new ErrorResponse(
					'Failed to delete item from bag',
					'Failed to delete item',
					statusCode.notFoundCode
				)
			);

		if (bagItems.error)
			return next(
				new ErrorResponse(
					bagItems.error,
					'Failed to delete item from bag ' + bagItems.error.message,
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				"Successfully Deleted Item From User's Bag",
				bagItems,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to delete item from bag',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const deleteItemsFromUserBag = async (req, res, next) => {
	try {
		const { bagId } = req.params;
		const { userId, userRole } = req.session;
		const { body } = req;

		const { bagItems, meta } = await removeItemsFromUserBag(
			userId,
			bagId,
			body
		);

		if (!bagItems)
			return next(
				new ErrorResponse(
					'Failed to delete items from bag',
					'Failed to delete items',
					statusCode.notFoundCode
				)
			);

		if (bagItems.error)
			return next(
				new ErrorResponse(
					bagItems.error,
					'Failed to delete items from bag ' + bagItems.error.message,
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				"Successfully Deleted Items From User's Bag",
				bagItems,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to delete items from bag',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const deleteAllItemsFromUserBag = async (req, res, next) => {
	try {
		const { userId, userRole } = req.session;
		const { bagId } = req.params;

		const { bagItems, meta } = await removeAllItemsFromUserBag(
			userId,
			bagId
		);

		if (!bagItems)
			return next(
				new ErrorResponse(
					'Failed to delete all items from bag',
					'Failed to delete all items',
					statusCode.notFoundCode
				)
			);

		if (bagItems.error)
			return next(
				new ErrorResponse(
					bagItems.error,
					'Failed to delete all items from bag ' +
						bagItems.error.message,
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				"Successfully Deleted All Items From User's Bag",
				bagItems,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to delete all items from bag',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const deleteAllBagsBelongsToUser = async (req, res, next) => {
	try {
		const { userId, userRole } = req.session;
		const { searchFilter = undefined } = req;

		const { deletedBags, meta } = await removeAllBagsUserHas(
			userId,
			searchFilter
		);

		if (!deletedBags)
			return next(
				new ErrorResponse(
					'No bags found for user',
					'Failed to delete all bags',
					statusCode.notFoundCode
				)
			);

		if (deletedBags.error)
			return next(
				new ErrorResponse(
					deletedBags.error,
					'Failed to delete all bags for user ' +
						deletedBags.error.message,
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				`Successfully Deleted All User's Bags${searchFilter ? ' By Search Filter' : ''}`,
				deletedBags,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to delete all bags for user',
				statusCode.internalServerErrorCode
			)
		);
	}
};
