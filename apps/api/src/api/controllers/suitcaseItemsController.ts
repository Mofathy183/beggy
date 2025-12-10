import { ErrorResponse, sendServiceResponse } from '../../utils/error.js';
import { statusCode } from '../../config/status.js';
import SuccessResponse from '../../utils/successResponse.js';
import { sendCookies, storeSession } from '../../utils/authHelper.js';
import {
	removeItemFromUserSuitcase,
	removeItemsFromUserSuitcase,
	removeAllItemsFromUserSuitcase,
	addItemToUserSuitcase,
	addItemsToUserSuitcase,
} from '../../services/suitcaseItemsService.js';

export const createItemForUserSuitcase = async (req, res, next) => {
	try {
		const { userId, userRole } = req.session;
		const { suitcaseId } = req.params;
		const { body } = req as Request<{}, {}, any>;

		const addHisItem = await addItemToUserSuitcase(
			userId,
			suitcaseId,
			body
		);

		if (sendServiceResponse(next, addHisItem)) return;

		const { suitcaseItems, meta } = addHisItem;

		if (!suitcaseItems)
			return next(
				new ErrorResponse(
					'Failed to create item for suitcase for user',
					'Failed to create item for suitcase for user',
					statusCode.badRequestCode
				)
			);

		if (suitcaseItems.error)
			return next(
				new ErrorResponse(
					suitcaseItems.error,
					'Failed to create item for suitcase for user ' +
						suitcaseItems.error.message,
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.createdCode,
				"Successfully Added User's Item To User's Suitcase",
				suitcaseItems,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Adding Your Item To Your Suitcase'
					: error,
				'Failed to create item for suitcase for user',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const createItemsForUserSuitcase = async (req, res, next) => {
	try {
		const { userId, userRole } = req.session;
		const { suitcaseId } = req.params;
		const { body } = req as Request<{}, {}, any>;

		const addHisItems = await addItemsToUserSuitcase(
			userId,
			suitcaseId,
			body
		);

		if (sendServiceResponse(next, addHisItems)) return;

		const { suitcaseItems, meta } = addHisItems;

		if (!suitcaseItems)
			return next(
				new ErrorResponse(
					'Failed to create items for suitcase for user',
					'Failed to create items for suitcase for user',
					statusCode.badRequestCode
				)
			);

		if (suitcaseItems.error)
			return next(
				new ErrorResponse(
					suitcaseItems.error,
					'Failed to create items for suitcase for user ' +
						suitcaseItems.error.message,
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.createdCode,
				"Successfully Added User's Items To User's Suitcase",
				suitcaseItems,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Adding Your Items To Your Suitcase'
					: error,
				'Failed to create items for suitcase for user',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const deleteItemsFromUserSuitcase = async (req, res, next) => {
	try {
		const { userId, userRole } = req.session;
		const { suitcaseId } = req.params;
		const { body } = req as Request<{}, {}, any>;

		const removeItems = await removeItemsFromUserSuitcase(
			userId,
			suitcaseId,
			body
		);

		if (sendServiceResponse(next, removeItems)) return;

		const { suitcaseItems, meta } = removeItems;

		if (!suitcaseItems)
			return next(
				new ErrorResponse(
					'Suitcase not found',
					'Failed to delete items from suitcase for user',
					statusCode.notFoundCode
				)
			);

		if (suitcaseItems.error)
			return next(
				new ErrorResponse(
					suitcaseItems.error,
					'Failed to delete items from suitcase for user ' +
						suitcaseItems.error.message,
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				"Successfully Deleted Items From User's Suitcase",
				suitcaseItems,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Removing Your Items From Your Suitcase'
					: error,
				'Failed to delete all items from suitcase for user',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const deleteAllItemsFromUserSuitcase = async (req, res, next) => {
	try {
		const { userId, userRole } = req.session;
		const { suitcaseId } = req.params;
		const { searchFilter = undefined } = req;

		const removeAllItems = await removeAllItemsFromUserSuitcase(
			userId,
			suitcaseId,
			searchFilter
		);

		if (sendServiceResponse(next, removeAllItems)) return;

		const { suitcaseItems, meta } = removeAllItems;

		if (!suitcaseItems)
			return next(
				new ErrorResponse(
					'Suitcase not found',
					'Failed to delete all items from suitcase for user',
					statusCode.notFoundCode
				)
			);

		if (suitcaseItems.error)
			return next(
				new ErrorResponse(
					suitcaseItems.error,
					'Failed to delete all items from suitcase for user ' +
						suitcaseItems.error.message,
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				`Successfully Delete All Items From User's Suitcase${searchFilter ? ' By Search' : ''}`,
				suitcaseItems,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Removing Your Items From Your Suitcase By Filter'
					: error,
				'Failed to delete all items from suitcase for user',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const deleteItemFromUserSuitcase = async (req, res, next) => {
	try {
		const { userId, userRole } = req.session;
		const { suitcaseId } = req.params;
		const { body } = req as Request<{}, {}, any>;

		const removeItem = await removeItemFromUserSuitcase(
			userId,
			suitcaseId,
			body
		);

		if (sendServiceResponse(next, removeItem)) return;

		const { suitcaseItems, meta } = removeItem;

		if (!suitcaseItems)
			return next(
				new ErrorResponse(
					'Suitcase not found',
					'Failed to delete item from suitcase for user',
					statusCode.notFoundCode
				)
			);

		if (suitcaseItems.error)
			return next(
				new ErrorResponse(
					suitcaseItems.error,
					'Failed to delete item from suitcase for user ' +
						suitcaseItems.error.message,
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				"Successfully Deleted Item From User's Suitcase",
				suitcaseItems,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Removing Your Item From Your Suitcase'
					: error,
				'Failed to delete item from suitcase for user',
				statusCode.internalServerErrorCode
			)
		);
	}
};
