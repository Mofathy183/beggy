import { ErrorResponse } from '../../utils/error.js';
import { statusCode } from '../../config/status.js';
import SuccessResponse from '../../utils/successResponse.js';
import { sendCookies, storeSession } from '../../utils/authHelper.js';
import {
	findAllSuitcasesByQuery,
	findSuitcaseById,
	replaceSuitcaseResource,
	modifySuitcaseResource,
	removeSuitcaseById,
	removeAllSuitcases,
	findSuitcasesUserHas,
	findSuitcaseUserHasById,
	addSuitcaseToUser,
	replaceSuitcaseUserHas,
	modifySuitcaseUserHas,
	removeSuitcaseUserHasById,
	removeAllSuitcasesUserHas,
	removeItemFromUserSuitcase,
	removeItemsFromUserSuitcase,
	removeAllItemsFromUserSuitcase,
	addItemToUserSuitcase,
	addItemsToUserSuitcase,
} from '../../services/suitcaseService.js';

export const getAllSuitcasesByQuery = async (req, res, next) => {
	try {
		const {
			searchFilter = undefined,
			pagination,
			orderBy = undefined,
		} = req;
		const { suitcases, meta } = await findAllSuitcasesByQuery(
			searchFilter,
			pagination,
			orderBy
		);

		if (!suitcases)
			return next(
				new ErrorResponse(
					'No suitcases found',
					'Failed to retrieve any suitcases',
					statusCode.notFoundCode
				)
			);

		if (suitcases.error)
			return next(
				new ErrorResponse(
					suitcases.error,
					'Failed to retrieve suitcases ' + suitcases.error.message,
					statusCode.internalServerErrorCode
				)
			);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				`Retrieved All Suitcases Successfully${searchFilter ? ' By Search' : ''}`,
				suitcases,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to get all suitcases by query',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const getSuitcaseById = async (req, res, next) => {
	try {
		const { suitcaseId } = req.params;
		const suitcase = await findSuitcaseById(suitcaseId);

		if (!suitcase)
			return next(
				new ErrorResponse(
					'Suitcase not found',
					'Failed to retrieve suitcase by id',
					statusCode.notFoundCode
				)
			);

		if (suitcase.error)
			return next(
				new ErrorResponse(
					suitcase.error,
					'Failed to retrieve suitcase by id ' +
						suitcase.error.message,
					statusCode.internalServerErrorCode
				)
			);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Retrieved Suitcase By ID Successfully',
				suitcase
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to get suitcase by id',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const replaceSuitcaseById = async (req, res, next) => {
	try {
		const { suitcaseId } = req.params;
		const { body } = req;
		const { userId, userRole } = req.session;

		const updatedSuitcase = await replaceSuitcaseResource(suitcaseId, body);

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
				error,
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

		const updatedSuitcase = await modifySuitcaseResource(suitcaseId, body);

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
				error,
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

		const { deletedSuitcase, meta } = await removeSuitcaseById(suitcaseId);

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
				error,
				'Failed to delete suitcase by id',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const deleteAllSuitcases = async (req, res, next) => {
	try {
		const { userId, userRole } = req.session;

		const { deleteCount, meta } = await removeAllSuitcases();

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
				'Successfully Delete All Suitcases',
				deleteCount,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to delete all suitcases',
				statusCode.internalServerErrorCode
			)
		);
	}
};

//*==================================={suitcases Route For User}===================================

export const getSuitcasesBelongsToUser = async (req, res, next) => {
	try {
		const { userId, userRole } = req.session;
		const {
			searchFilter = undefined,
			pagination,
			orderBy = undefined,
		} = req;

		const { meta, suitcases } = await findSuitcasesUserHas(
			userId,
			searchFilter,
			pagination,
			orderBy
		);

		if (!suitcases)
			return next(
				new ErrorResponse(
					'Suitcases not found',
					'Failed to retrieve suitcases belonging to user',
					statusCode.notFoundCode
				)
			);

		if (suitcases.error)
			return next(
				new ErrorResponse(
					suitcases.error,
					'Failed to retrieve suitcases belonging to user ' +
						suitcases.error.message,
					statusCode.internalServerErrorCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				`Retrieved Suitcases Belonging To User Successfully${searchFilter ? ' By Search' : ''}`,
				suitcases,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to get suitcases belonging to user',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const getSuitcaseBelongsToUser = async (req, res, next) => {
	try {
		const { userId, userRole } = req.session;
		const { suitcaseId } = req.params;

		const suitcase = await findSuitcaseUserHasById(userId, suitcaseId);

		if (!suitcase)
			return next(
				new ErrorResponse(
					'Suitcase not found',
					'Failed to retrieve suitcase belonging to user by id',
					statusCode.notFoundCode
				)
			);

		if (suitcase.error)
			return next(
				new ErrorResponse(
					suitcase.error,
					'Failed to retrieve suitcase belonging to user by id ' +
						suitcase.error.message,
					statusCode.internalServerErrorCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Retrieved Suitcase Belonging To User By Its ID Successfully',
				suitcase
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to get suitcase belonging to user by id',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const createSuitcaseForUser = async (req, res, next) => {
	try {
		const { userId, userRole } = req.session;
		const { body } = req;

		const { newSuitcase, meta } = await addSuitcaseToUser(userId, body);

		if (!newSuitcase)
			return next(
				new ErrorResponse(
					'Failed to create suitcase for user',
					'Failed to create suitcase for user',
					statusCode.badRequestCode
				)
			);

		if (newSuitcase.error)
			return next(
				new ErrorResponse(
					newSuitcase.error,
					'Failed to create suitcase for user ' +
						newSuitcase.error.message,
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.createdCode,
				'Created Suitcase For User Successfully',
				newSuitcase,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to create suitcase for user',
				statusCode.internalServerErrorCode
			)
		);
	}
};

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

export const replaceSuitcaseBelongsToUser = async (req, res, next) => {
	try {
		const { userId, userRole } = req.session;
		const { suitcaseId } = req.params;
		const { body } = req;

		const updatedSuitcase = await replaceSuitcaseUserHas(
			userId,
			suitcaseId,
			body
		);

		if (!updatedSuitcase)
			return next(
				new ErrorResponse(
					'Suitcase not found',
					'Failed to replace suitcase belonging to user by id',
					statusCode.notFoundCode
				)
			);

		if (updatedSuitcase.error)
			return next(
				new ErrorResponse(
					updatedSuitcase.error,
					'Failed to replace suitcase belonging to user by id ' +
						updatedSuitcase.error.message,
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				"Successfully Replaced User's Suitcase By Its ID",
				updatedSuitcase
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to replace suitcase belonging to user by id',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const modifySuitcaseBelongsToUser = async (req, res, next) => {
	try {
		const { userId, userRole } = req.session;
		const { suitcaseId } = req.params;
		const { body } = req;

		const updatedSuitcase = await modifySuitcaseUserHas(
			userId,
			suitcaseId,
			body
		);

		if (!updatedSuitcase)
			return next(
				new ErrorResponse(
					'Suitcase not found',
					'Failed to modify suitcase belonging to user by id',
					statusCode.notFoundCode
				)
			);

		if (updatedSuitcase.error)
			return next(
				new ErrorResponse(
					updatedSuitcase.error,
					'Failed to modify suitcase belonging to user by id ' +
						updatedSuitcase.error.message,
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				"Successfully Modified User's Suitcase By Its ID",
				updatedSuitcase
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to modify suitcase belonging to user by id',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const deleteSuitcaseBelongsToUserById = async (req, res, next) => {
	try {
		const { userId, userRole } = req.session;
		const { suitcaseId } = req.params;

		const { deletedSuitcase, meta } = await removeSuitcaseUserHasById(
			userId,
			suitcaseId
		);

		if (!deletedSuitcase)
			return next(
				new ErrorResponse(
					'Suitcase not found',
					'Failed to delete suitcase belonging to user by id',
					statusCode.notFoundCode
				)
			);

		if (deletedSuitcase.error)
			return next(
				new ErrorResponse(
					deletedSuitcase.error,
					'Failed to delete suitcase belonging to user by id ' +
						deletedSuitcase.error.message,
					statusCode.internalServerErrorCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				"Successfully Deleted User's Suitcase By Its ID",
				deletedSuitcase,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to delete suitcase belonging to user by id',
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

export const deleteAllSuitcasesBelongsToUser = async (req, res, next) => {
	try {
		const { userId, userRole } = req.session;

		const { searchFilter = undefined } = req;

		const { deletedSuitcases, meta } = await removeAllSuitcasesUserHas(
			userId,
			searchFilter
		);

		if (deletedSuitcases.error)
			return next(
				new ErrorResponse(
					deletedSuitcases.error,
					'Failed to delete all suitcases belonging to user ' +
						deletedSuitcases.error.message,
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				"Successfully Delete All User's Suitcases",
				deletedSuitcases,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to delete all suitcases belonging to user',
				statusCode.internalServerErrorCode
			)
		);
	}
};
