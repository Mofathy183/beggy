import { ErrorResponse } from '../../utils/error.js';
import { statusCode } from '../../config/status.js';
import SuccessResponse from '../../utils/successResponse.js';
import { sendCookies, storeSession } from '../../utils/authHelper.js';
import {
	removeItemsFromUserBag,
	removeItemFromUserBag,
	removeAllItemsFromUserBag,
	addItemToUserBag,
	addItemsToUserBag,
} from '../../services/bagItemsService.js';

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
		const { searchFilter = undefined } = req;

		const { bagItems, meta } = await removeAllItemsFromUserBag(
			userId,
			bagId,
			searchFilter
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
				`Successfully Deleted All Items From User's Bag${searchFilter ? ' By Search' : ''}`,
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
