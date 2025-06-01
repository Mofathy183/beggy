import { ErrorResponse, sendServiceResponse } from '../../utils/error.js';
import { statusCode } from '../../config/status.js';
import SuccessResponse from '../../utils/successResponse.js';
import { sendCookies, storeSession } from '../../utils/authHelper.js';
import {
	replaceBagResource,
	modifyBagResource,
	removeBagById,
	removeAllBags,
	replaceSuitcaseResource,
	modifySuitcaseResource,
	removeSuitcaseById,
	removeAllSuitcases,
	replaceItemResource,
	modifyItemResource,
	removeAllItems,
	removeItemById,
} from '../../services/privateService.js';

//*======================================={Bags Private Route}==============================================

export const replaceBagById = async (req, res, next) => {
	try {
		const { bagId } = req.params;
		const { body } = req;
		const { userId, userRole } = req.session;

		const bagUpdate = await replaceBagResource(bagId, body);

		if (sendServiceResponse(next, bagUpdate)) return;

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

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

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
				Object.keys(error).length === 0
					? 'Error Occur while Replacing Bag'
					: error,
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
		const { userId, userRole } = req.session;

		const bagUpdate = await modifyBagResource(bagId, body);

		if (sendServiceResponse(next, bagUpdate)) return;

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

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully Modifying Bag By ID',
				bagUpdate
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Modifying Bag'
					: error,
				'Failed to modify bag',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const deleteBagById = async (req, res, next) => {
	try {
		const { bagId } = req.params;
		const { userId, userRole } = req.session;

		const removeBag = await removeBagById(bagId);

		if (sendServiceResponse(next, removeBag)) return;

		const { bagDelete, meta } = removeBag;

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

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

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
				Object.keys(error).length === 0
					? 'Error Occur while Removing Bag'
					: error,
				'Failed to delete bag',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const deleteAllBags = async (req, res, next) => {
	try {
		const { searchFilter = undefined } = req;
		const { userId, userRole } = req.session;

		const removeBags = await removeAllBags(searchFilter);

		if (sendServiceResponse(next, removeBags)) return;

		const { deleteCount, meta } = removeBags;

		if (deleteCount.error)
			return next(
				new ErrorResponse(
					deleteCount.error,
					'Failed to delete all bags ' + deleteCount.error.message,
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				`Successfully Delete All Bags${searchFilter ? ' By Search' : ''}`,
				deleteCount,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Removing Bags By Filter'
					: error,
				'Failed to delete all bags',
				statusCode.internalServerErrorCode
			)
		);
	}
};

//*======================================={Bags Private Route}==============================================

//*======================================={Suitcase Private Route}==============================================

export const replaceSuitcaseById = async (req, res, next) => {
	try {
		const { suitcaseId } = req.params;
		const { body } = req;
		const { userId, userRole } = req.session;

		const updatedSuitcase = await replaceSuitcaseResource(suitcaseId, body);

		if (sendServiceResponse(next, updatedSuitcase)) return;

		if (!updatedSuitcase)
			return next(
				new ErrorResponse(
					'Suitcase not found',
					'Failed to replace suitcase by id',
					statusCode.notFoundCode
				)
			);

		if (updatedSuitcase.error)
			return next(
				new ErrorResponse(
					updatedSuitcase.error,
					'Failed to replace suitcase by id ' +
						updatedSuitcase.error.message,
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully Replaced Suitcase By Its ID',
				updatedSuitcase
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Replacing Suitcase'
					: error,
				'Failed to replace suitcase by id',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const modifySuitcaseById = async (req, res, next) => {
	try {
		const { suitcaseId } = req.params;
		const { body } = req;
		const { userId, userRole } = req.session;

		console.log(suitcaseId, body, userRole, userId);

		const updatedSuitcase = await modifySuitcaseResource(suitcaseId, body);

		if (sendServiceResponse(next, updatedSuitcase)) return;

		if (!updatedSuitcase)
			return next(
				new ErrorResponse(
					'Suitcase not found',
					'Failed to modify suitcase by id',
					statusCode.notFoundCode
				)
			);

		if (updatedSuitcase.error)
			return next(
				new ErrorResponse(
					updatedSuitcase.error,
					'Failed to modify suitcase by id ' +
						updatedSuitcase.error.message,
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully Modified Suitcase By Its ID',
				updatedSuitcase
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Modifying Suitcase'
					: error,
				'Failed to modify suitcase by id',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const deleteSuitcaseById = async (req, res, next) => {
	try {
		const { suitcaseId } = req.params;
		const { userId, userRole } = req.session;

		const removeSuitcase = await removeSuitcaseById(suitcaseId);

		if (sendServiceResponse(next, removeSuitcase)) return;

		const { deletedSuitcase, meta } = removeSuitcase;

		if (!deletedSuitcase)
			return next(
				new ErrorResponse(
					'Suitcase not found',
					'Failed to delete suitcase by id',
					statusCode.notFoundCode
				)
			);

		if (deletedSuitcase.error)
			return next(
				new ErrorResponse(
					deletedSuitcase.error,
					'Failed to delete suitcase by id ' +
						deletedSuitcase.error.message,
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully Deleted Suitcase By Its ID',
				deletedSuitcase,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Removing Suitcase'
					: error,
				'Failed to delete suitcase by id',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const deleteAllSuitcases = async (req, res, next) => {
	try {
		const { userId, userRole } = req.session;
		const { searchFilter = undefined } = req;

		const removedSuitcases = await removeAllSuitcases(searchFilter);

		if (sendServiceResponse(next, removedSuitcases)) return;

		const { deleteCount, meta } = removedSuitcases;

		if (deleteCount.error)
			return next(
				new ErrorResponse(
					deleteCount.error,
					'Failed to delete all suitcases ' +
						deleteCount.error.message,
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				`Successfully Delete All Suitcases${searchFilter ? ' By Search' : ''}`,
				deleteCount,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Removing Suitcases By Filter'
					: error,
				'Failed to delete all suitcases',
				statusCode.internalServerErrorCode
			)
		);
	}
};

//*======================================={Suitcase Private Route}==============================================

//*======================================={Items Private Route}==============================================

export const replaceItemById = async (req, res, next) => {
	try {
		const { itemId } = req.params;
		const { body } = req;
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
		const { body } = req;
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
