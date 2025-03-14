import { ErrorResponse } from '../../utils/error.js';
import { statusCode } from '../../config/status.js';
import SuccessResponse from '../../utils/successResponse.js';
import { sendCookies, storeSession } from '../../utils/authHelper.js';
import {
	findSuitcasesUserHas,
	findSuitcaseUserHasById,
	addSuitcaseToUser,
	replaceSuitcaseUserHas,
	modifySuitcaseUserHas,
	removeSuitcaseUserHasById,
	removeAllSuitcasesUserHas,
} from '../../services/suitcaseService.js';


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
