// import { ErrorResponse, sendServiceResponse } from '../../utils/error.js';
// import { statusCode } from '../../config/status.js';
// import SuccessResponse from '../../utils/successResponse.js';
// import { sendCookies, storeSession } from '../../utils/authHelper.js';
// import {
// 	findSuitcasesUserHas,
// 	findSuitcaseUserHasById,
// 	addSuitcaseToUser,
// 	replaceSuitcaseUserHas,
// 	modifySuitcaseUserHas,
// 	removeSuitcaseUserHasById,
// 	removeAllSuitcasesUserHas,
// } from '../../services/suitcaseService.js';

// //*==================================={suitcases Route For User}===================================

// export const getSuitcasesBelongsToUser = async (req, res, next) => {
// 	try {
// 		const { userId, userRole } = req.session;
// 		const {
// 			searchFilter = undefined,
// 			pagination,
// 			orderBy = undefined,
// 		} = req;

// 		const hisSuitcases = await findSuitcasesUserHas(
// 			userId,
// 			searchFilter,
// 			pagination,
// 			orderBy
// 		);

// 		if (sendServiceResponse(next, hisSuitcases)) return;

// 		const { suitcases, meta } = hisSuitcases;

// 		if (!suitcases)
// 			return next(
// 				new ErrorResponse(
// 					'Suitcases not found',
// 					'Failed to retrieve suitcases belonging to user',
// 					statusCode.notFoundCode
// 				)
// 			);

// 		if (suitcases.error)
// 			return next(
// 				new ErrorResponse(
// 					suitcases.error,
// 					'Failed to retrieve suitcases belonging to user ' +
// 						suitcases.error.message,
// 					statusCode.internalServerErrorCode
// 				)
// 			);

// 		sendCookies(userId, res);
// 		storeSession(userId, userRole, req);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				`Retrieved Suitcases Belonging To User Successfully${searchFilter ? ' By Search' : ''}`,
// 				suitcases,
// 				meta
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Getting Your Suitcases'
// 					: error,
// 				'Failed to get suitcases belonging to user',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// export const getSuitcaseBelongsToUser = async (req, res, next) => {
// 	try {
// 		const { userId, userRole } = req.session;
// 		const { suitcaseId } = req.params;

// 		const suitcase = await findSuitcaseUserHasById(userId, suitcaseId);

// 		if (sendServiceResponse(next, suitcase)) return;

// 		if (!suitcase)
// 			return next(
// 				new ErrorResponse(
// 					'Suitcase not found',
// 					'Failed to retrieve suitcase belonging to user by id',
// 					statusCode.notFoundCode
// 				)
// 			);

// 		if (suitcase.error)
// 			return next(
// 				new ErrorResponse(
// 					suitcase.error,
// 					'Failed to retrieve suitcase belonging to user by id ' +
// 						suitcase.error.message,
// 					statusCode.internalServerErrorCode
// 				)
// 			);

// 		sendCookies(userId, res);
// 		storeSession(userId, userRole, req);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				'Retrieved Suitcase Belonging To User By Its ID Successfully',
// 				suitcase
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Getting Your Suitcase'
// 					: error,
// 				'Failed to get suitcase belonging to user by id',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// export const createSuitcaseForUser = async (req, res, next) => {
// 	try {
// 		const { userId, userRole } = req.session;
// 		const { body } = req as Request<{}, {}, any>;

// 		const hisNewSuitcase = await addSuitcaseToUser(userId, body);

// 		if (sendServiceResponse(next, hisNewSuitcase)) return;

// 		const { newSuitcase, meta } = hisNewSuitcase;

// 		if (!newSuitcase)
// 			return next(
// 				new ErrorResponse(
// 					'Failed to create suitcase for user',
// 					'Failed to create suitcase for user',
// 					statusCode.badRequestCode
// 				)
// 			);

// 		if (newSuitcase.error)
// 			return next(
// 				new ErrorResponse(
// 					newSuitcase.error,
// 					'Failed to create suitcase for user ' +
// 						newSuitcase.error.message,
// 					statusCode.badRequestCode
// 				)
// 			);

// 		sendCookies(userId, res);
// 		storeSession(userId, userRole, req);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.createdCode,
// 				'Created Suitcase For User Successfully',
// 				newSuitcase,
// 				meta
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Making Your Suitcase'
// 					: error,
// 				'Failed to create suitcase for user',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// export const replaceSuitcaseBelongsToUser = async (req, res, next) => {
// 	try {
// 		const { userId, userRole } = req.session;
// 		const { suitcaseId } = req.params;
// 		const { body } = req as Request<{}, {}, any>;

// 		const updatedSuitcase = await replaceSuitcaseUserHas(
// 			userId,
// 			suitcaseId,
// 			body
// 		);

// 		if (sendServiceResponse(next, updatedSuitcase)) return;

// 		if (!updatedSuitcase)
// 			return next(
// 				new ErrorResponse(
// 					'Suitcase not found',
// 					'Failed to replace suitcase belonging to user by id',
// 					statusCode.notFoundCode
// 				)
// 			);

// 		if (updatedSuitcase.error)
// 			return next(
// 				new ErrorResponse(
// 					updatedSuitcase.error,
// 					'Failed to replace suitcase belonging to user by id ' +
// 						updatedSuitcase.error.message,
// 					statusCode.badRequestCode
// 				)
// 			);

// 		sendCookies(userId, res);
// 		storeSession(userId, userRole, req);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				"Successfully Replaced User's Suitcase By Its ID",
// 				updatedSuitcase
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Replacing Your Suitcase'
// 					: error,
// 				'Failed to replace suitcase belonging to user by id',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// export const modifySuitcaseBelongsToUser = async (req, res, next) => {
// 	try {
// 		const { userId, userRole } = req.session;
// 		const { suitcaseId } = req.params;
// 		const { body } = req as Request<{}, {}, any>;

// 		const updatedSuitcase = await modifySuitcaseUserHas(
// 			userId,
// 			suitcaseId,
// 			body
// 		);

// 		if (sendServiceResponse(next, updatedSuitcase)) return;

// 		if (!updatedSuitcase)
// 			return next(
// 				new ErrorResponse(
// 					'Suitcase not found',
// 					'Failed to modify suitcase belonging to user by id',
// 					statusCode.notFoundCode
// 				)
// 			);

// 		if (updatedSuitcase.error)
// 			return next(
// 				new ErrorResponse(
// 					updatedSuitcase.error,
// 					'Failed to modify suitcase belonging to user by id ' +
// 						updatedSuitcase.error.message,
// 					statusCode.badRequestCode
// 				)
// 			);

// 		sendCookies(userId, res);
// 		storeSession(userId, userRole, req);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				"Successfully Modified User's Suitcase By Its ID",
// 				updatedSuitcase
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Modifying Your Suitcase'
// 					: error,
// 				'Failed to modify suitcase belonging to user by id',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// export const deleteSuitcaseBelongsToUserById = async (req, res, next) => {
// 	try {
// 		const { userId, userRole } = req.session;
// 		const { suitcaseId } = req.params;

// 		const removedSuitcase = await removeSuitcaseUserHasById(
// 			userId,
// 			suitcaseId
// 		);

// 		if (sendServiceResponse(next, removedSuitcase)) return;

// 		const { deletedSuitcase, meta } = removedSuitcase;

// 		if (!deletedSuitcase)
// 			return next(
// 				new ErrorResponse(
// 					'Suitcase not found',
// 					'Failed to delete suitcase belonging to user by id',
// 					statusCode.notFoundCode
// 				)
// 			);

// 		if (deletedSuitcase.error)
// 			return next(
// 				new ErrorResponse(
// 					deletedSuitcase.error,
// 					'Failed to delete suitcase belonging to user by id ' +
// 						deletedSuitcase.error.message,
// 					statusCode.internalServerErrorCode
// 				)
// 			);

// 		sendCookies(userId, res);
// 		storeSession(userId, userRole, req);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				"Successfully Deleted User's Suitcase By Its ID",
// 				deletedSuitcase,
// 				meta
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Removing Your Suitcase'
// 					: error,
// 				'Failed to delete suitcase belonging to user by id',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// export const deleteAllSuitcasesBelongsToUser = async (req, res, next) => {
// 	try {
// 		const { userId, userRole } = req.session;

// 		const { searchFilter = undefined } = req;

// 		const removedSuitcases = await removeAllSuitcasesUserHas(
// 			userId,
// 			searchFilter
// 		);

// 		if (sendServiceResponse(next, removedSuitcases)) return;

// 		const { deletedSuitcases, meta } = removedSuitcases;

// 		if (deletedSuitcases.error)
// 			return next(
// 				new ErrorResponse(
// 					deletedSuitcases.error,
// 					'Failed to delete all suitcases belonging to user ' +
// 						deletedSuitcases.error.message,
// 					statusCode.badRequestCode
// 				)
// 			);

// 		sendCookies(userId, res);
// 		storeSession(userId, userRole, req);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				`Successfully Delete All User's Suitcases${searchFilter ? ' By Search' : ''}`,
// 				deletedSuitcases,
// 				meta
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Removing Your Suitcases By Filter'
// 					: error,
// 				'Failed to delete all suitcases belonging to user',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// //*==================================={suitcases Route For User}===================================

// //*======================================={Suitcase Private Route}==============================================

// export const replaceSuitcaseById = async (req, res, next) => {
// 	try {
// 		const { suitcaseId } = req.params;
// 		const { body } = req as Request<{}, {}, any>;
// 		const { userId, userRole } = req.session;

// 		const updatedSuitcase = await replaceSuitcaseResource(suitcaseId, body);

// 		if (sendServiceResponse(next, updatedSuitcase)) return;

// 		if (!updatedSuitcase)
// 			return next(
// 				new ErrorResponse(
// 					'Suitcase not found',
// 					'Failed to replace suitcase by id',
// 					statusCode.notFoundCode
// 				)
// 			);

// 		if (updatedSuitcase.error)
// 			return next(
// 				new ErrorResponse(
// 					updatedSuitcase.error,
// 					'Failed to replace suitcase by id ' +
// 						updatedSuitcase.error.message,
// 					statusCode.badRequestCode
// 				)
// 			);

// 		sendCookies(userId, res);
// 		storeSession(userId, userRole, req);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				'Successfully Replaced Suitcase By Its ID',
// 				updatedSuitcase
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Replacing Suitcase'
// 					: error,
// 				'Failed to replace suitcase by id',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// export const modifySuitcaseById = async (req, res, next) => {
// 	try {
// 		const { suitcaseId } = req.params;
// 		const { body } = req as Request<{}, {}, any>;
// 		const { userId, userRole } = req.session;

// 		console.log(suitcaseId, body, userRole, userId);

// 		const updatedSuitcase = await modifySuitcaseResource(suitcaseId, body);

// 		if (sendServiceResponse(next, updatedSuitcase)) return;

// 		if (!updatedSuitcase)
// 			return next(
// 				new ErrorResponse(
// 					'Suitcase not found',
// 					'Failed to modify suitcase by id',
// 					statusCode.notFoundCode
// 				)
// 			);

// 		if (updatedSuitcase.error)
// 			return next(
// 				new ErrorResponse(
// 					updatedSuitcase.error,
// 					'Failed to modify suitcase by id ' +
// 						updatedSuitcase.error.message,
// 					statusCode.badRequestCode
// 				)
// 			);

// 		sendCookies(userId, res);
// 		storeSession(userId, userRole, req);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				'Successfully Modified Suitcase By Its ID',
// 				updatedSuitcase
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Modifying Suitcase'
// 					: error,
// 				'Failed to modify suitcase by id',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// export const deleteSuitcaseById = async (req, res, next) => {
// 	try {
// 		const { suitcaseId } = req.params;
// 		const { userId, userRole } = req.session;

// 		const removeSuitcase = await removeSuitcaseById(suitcaseId);

// 		if (sendServiceResponse(next, removeSuitcase)) return;

// 		const { deletedSuitcase, meta } = removeSuitcase;

// 		if (!deletedSuitcase)
// 			return next(
// 				new ErrorResponse(
// 					'Suitcase not found',
// 					'Failed to delete suitcase by id',
// 					statusCode.notFoundCode
// 				)
// 			);

// 		if (deletedSuitcase.error)
// 			return next(
// 				new ErrorResponse(
// 					deletedSuitcase.error,
// 					'Failed to delete suitcase by id ' +
// 						deletedSuitcase.error.message,
// 					statusCode.badRequestCode
// 				)
// 			);

// 		sendCookies(userId, res);
// 		storeSession(userId, userRole, req);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				'Successfully Deleted Suitcase By Its ID',
// 				deletedSuitcase,
// 				meta
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Removing Suitcase'
// 					: error,
// 				'Failed to delete suitcase by id',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// export const deleteAllSuitcases = async (req, res, next) => {
// 	try {
// 		const { userId, userRole } = req.session;
// 		const { searchFilter = undefined } = req;

// 		const removedSuitcases = await removeAllSuitcases(searchFilter);

// 		if (sendServiceResponse(next, removedSuitcases)) return;

// 		const { deleteCount, meta } = removedSuitcases;

// 		if (deleteCount.error)
// 			return next(
// 				new ErrorResponse(
// 					deleteCount.error,
// 					'Failed to delete all suitcases ' +
// 						deleteCount.error.message,
// 					statusCode.badRequestCode
// 				)
// 			);

// 		sendCookies(userId, res);
// 		storeSession(userId, userRole, req);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				`Successfully Delete All Suitcases${searchFilter ? ' By Search' : ''}`,
// 				deleteCount,
// 				meta
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Removing Suitcases By Filter'
// 					: error,
// 				'Failed to delete all suitcases',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// //*======================================={Suitcase Private Route}==============================================

// //*======================================={Suitcase Public Route}==============================================

// export const getAllSuitcasesByQuery = async (req, res, next) => {
// 	try {
// 		const {
// 			searchFilter = undefined,
// 			pagination,
// 			orderBy = undefined,
// 		} = req;

// 		const allSuitcases = await findAllSuitcasesByQuery(
// 			searchFilter,
// 			pagination,
// 			orderBy
// 		);

// 		if (sendServiceResponse(next, allSuitcases)) return;

// 		const { suitcases, meta } = allSuitcases;

// 		if (suitcases.error)
// 			return next(
// 				new ErrorResponse(
// 					'Failed to retrieve suitcases ' + suitcases.error,
// 					'Failed to retrieve suitcases ' + suitcases.error.message,
// 					statusCode.internalServerErrorCode
// 				)
// 			);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				`Retrieved All Suitcases Successfully${searchFilter ? ' By Search' : ''}`,
// 				suitcases,
// 				meta
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Getting Suitcases By Filter'
// 					: error,
// 				'Failed to get all suitcases by query',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// export const getSuitcaseById = async (req, res, next) => {
// 	try {
// 		const { suitcaseId } = req.params;

// 		const suitcase = await findSuitcaseById(suitcaseId);

// 		if (sendServiceResponse(next, suitcase)) return;

// 		if (!suitcase)
// 			return next(
// 				new ErrorResponse(
// 					'Suitcase not found',
// 					'Failed to retrieve suitcase by id',
// 					statusCode.notFoundCode
// 				)
// 			);

// 		if (suitcase.error)
// 			return next(
// 				new ErrorResponse(
// 					suitcase.error,
// 					'Failed to retrieve suitcase by id ' +
// 						suitcase.error.message,
// 					statusCode.internalServerErrorCode
// 				)
// 			);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				'Retrieved Suitcase By ID Successfully',
// 				suitcase
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				error,
// 				'Failed to get suitcase by id',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// //*======================================={Suitcase Public Route}==============================================
