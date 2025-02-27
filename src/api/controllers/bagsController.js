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
} from '../../services/bagsService.js';

export const getAllBagsByQuery = async (req, res, next) => {
	try {
		const { searchFilter, pagination, orderBy } = req;
		const { bags, meta } = await findAllBagsByQuery(
			searchFilter,
			pagination,
			orderBy
		);

		if (!bags)
			return next(
				new ErrorResponse(
					'No bags found',
					'Failed to retrieve any bags',
					statusCode.notFoundCode
				)
			);

		if (bags.error)
			return next(
				new ErrorResponse(
					bags.error,
					'Failed to retrieve bags',
					statusCode.internalServerErrorCode
				)
			);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully retrieved bags',
				bags,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error.message || 'Failed to retrieve bags',
				'Failed to retrieve bags',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const getBagById = async (req, res, next) => {
	try {
		const { bagId } = req.params;
		const bag = await findBagById(bagId);

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
					'Failed to retrieve bag',
					statusCode.internalServerErrorCode
				)
			);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully retrieved bag',
				bag
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
					'Failed to replace bag',
					statusCode.badRequestCode
				)
			);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully replaced bag',
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
					'Failed to replace bag',
					statusCode.notFoundCode
				)
			);

		if (bagUpdate.error)
			return next(
				new ErrorResponse(
					bagUpdate.error,
					'Failed to replace bag',
					statusCode.badRequestCode
				)
			);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully replaced bag',
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

		const bagDelete = await removeBagById(bagId);

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
					'Failed to delete bag',
					statusCode.badRequestCode
				)
			);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully deleted bag',
				bagDelete
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
		const bagsDelete = await removeAllBags();

		if (!bagsDelete)
			return next(
				new ErrorResponse(
					'No bags found',
					'Failed to delete all bags',
					statusCode.notFoundCode
				)
			);

		if (bagsDelete.error)
			return next(
				new ErrorResponse(
					bagsDelete.error,
					'Failed to delete all bags',
					statusCode.badRequestCode
				)
			);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully deleted all bags',
				bagsDelete
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
		const { searchFilter, pagination, orderBy } = req;

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
					'Failed to retrieve bags',
					statusCode.internalServerErrorCode
				)
			);

		sendCookies(userId, res);

		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully retrieved bags for user',
				userBags,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to retrieve items',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const getBagBelongsToUser = async (req, res, next) => {
	try {
		const { bagId } = req.params;
		const { userId, userRole } = req.session;

		const userBag = await findBagUserHasById(userId, bagId);

		if (!userBag)
			return next(
				new ErrorResponse(
					'Bag not found for user',
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
				'Successfully retrieved bag for user',
				userBag
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

		const newBag = await addBagToUser(userId, body);

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
					'Failed to create bag for user',
					statusCode.internalServerErrorCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.createdCode,
				'Bag created successfully and added to user',
				newBag
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
					'Failed to replace bag for user',
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Bag replaced successfully for user',
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
					'Failed to modify bag for user',
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Bag modified successfully for user',
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

		const deleteBag = await removeBagUserHasById(userId, bagId);

		if (!deleteBag)
			return next(
				new ErrorResponse(
					'Bag not found for user',
					'Failed to delete bag',
					statusCode.notFoundCode
				)
			);

		if (deleteBag.error)
			return next(
				new ErrorResponse(
					deleteBag.error,
					'Failed to delete bag for user',
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Bag deleted successfully for user',
				deleteBag
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

export const deleteAllBagsBelongsToUser = async (req, res, next) => {
	try {
		const { userId, userRole } = req.session;

		const deleteAllBags = await removeAllBagsUserHas(userId);

		if (!deleteAllBags)
			return next(
				new ErrorResponse(
					'No bags found for user',
					'Failed to delete all bags',
					statusCode.notFoundCode
				)
			);

		if (deleteAllBags.error)
			return next(
				new ErrorResponse(
					deleteAllBags.error,
					'Failed to delete all bags for user',
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'All bags deleted successfully for user',
				deleteAllBags
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
