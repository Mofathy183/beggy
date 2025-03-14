import { ErrorResponse } from '../../utils/error.js';
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
		const { body } = req;

		const { suitcaseItems, meta } = await addItemToUserSuitcase(
			userId,
			suitcaseId,
			body
		);

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
				error,
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
		const { body } = req;

		const { suitcaseItems, meta } = await addItemsToUserSuitcase(
			userId,
			suitcaseId,
			body
		);

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
				error,
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
		const { body } = req;

		const { suitcaseItems, meta } = await removeItemsFromUserSuitcase(
			userId,
			suitcaseId,
			body
		);

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
				error,
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

		const { suitcaseItems, meta } = await removeAllItemsFromUserSuitcase(
			userId,
			suitcaseId,
			searchFilter
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
				error,
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
		const { body } = req;

		const { suitcaseItems, meta } = await removeItemFromUserSuitcase(
			userId,
			suitcaseId,
			body
		);

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
				error,
				'Failed to delete item from suitcase for user',
				statusCode.internalServerErrorCode
			)
		);
	}
};
