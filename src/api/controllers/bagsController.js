import { ErrorResponse, sendServiceResponse } from '../../utils/error.js';
import { statusCode } from '../../config/status.js';
import SuccessResponse from '../../utils/successResponse.js';
import { sendCookies, storeSession } from '../../utils/authHelper.js';
import {
	findBagsUserHas,
	findBagUserHasById,
	addBagToUser,
	replaceBagUserHas,
	modifyBagUserHas,
	removeBagUserHasById,
	removeAllBagsUserHas,
} from '../../services/bagsService.js';

export const getBagsBelongsToUser = async (req, res, next) => {
	try {
		const { userId, userRole } = req.session;
		const {
			searchFilter = undefined,
			pagination,
			orderBy = undefined,
		} = req;

		const allUserBags = await findBagsUserHas(
			userId,
			searchFilter,
			pagination,
			orderBy
		);

		if (sendServiceResponse(next, allUserBags)) return;

		const { userBags, meta } = allUserBags;

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
				Object.keys(error).length === 0
					? 'Error Occur while Getting Your Bags'
					: error,
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

		const hisBag = await findBagUserHasById(userId, bagId);

		if (sendServiceResponse(next, hisBag)) return;

		const { userBag, meta } = hisBag;

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
				Object.keys(error).length === 0
					? 'Error Occur while Getting Your Bag By Id'
					: error,
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

		const hisNewBag = await addBagToUser(userId, body);

		if (sendServiceResponse(next, hisNewBag)) return;

		const { newBag, meta } = hisNewBag;

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
				Object.keys(error).length === 0
					? 'Error Occur while Making Your New Bag'
					: error,
				'Failed to create bag for user',
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

		if (sendServiceResponse(next, bagUpdate)) return;

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
				Object.keys(error).length === 0
					? 'Error Occur while Replacing Your Bag'
					: error,
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

		if (sendServiceResponse(next, bagUpdate)) return;

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
				Object.keys(error).length === 0
					? 'Error Occur while Modifying Your Bag'
					: error,
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

		const removedBag = await removeBagUserHasById(userId, bagId);

		if (sendServiceResponse(next, removedBag)) return;

		const { deletedBag, meta } = removedBag;

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
				Object.keys(error).length === 0
					? 'Error Occur while Removing Your Bag'
					: error,
				'Failed to delete bag for user',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const deleteAllBagsBelongsToUser = async (req, res, next) => {
	try {
		const { userId, userRole } = req.session;
		const { searchFilter = undefined } = req;

		const removedBags = await removeAllBagsUserHas(userId, searchFilter);

		if (sendServiceResponse(next, removedBags)) return;

		const { deletedBags, meta } = removedBags;

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
				Object.keys(error).length === 0
					? 'Error Occur while Removing Your Bags By Filter'
					: error,
				'Failed to delete all bags for user',
				statusCode.internalServerErrorCode
			)
		);
	}
};
