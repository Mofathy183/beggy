// import { ErrorResponse, sendServiceResponse } from '../../utils/error.js';
// import { statusCode } from '../../config/status.js';
// import SuccessResponse from '../../utils/successResponse.js';
// import { sendCookies, storeSession } from '../../utils/authHelper.js';
// import {
// 	findBagsUserHas,
// 	findBagUserHasById,
// 	addBagToUser,
// 	replaceBagUserHas,
// 	modifyBagUserHas,
// 	removeBagUserHasById,
// 	removeAllBagsUserHas,
// } from '../../services/bagsService.js';

// //*======================================={BAG ME Route}==============================================

// export const getBagsBelongsToUser = async (req, res, next) => {
// 	try {
// 		const { userId, userRole } = req.session;
// 		const {
// 			searchFilter = undefined,
// 			pagination,
// 			orderBy = undefined,
// 		} = req;

// 		const allUserBags = await findBagsUserHas(
// 			userId,
// 			searchFilter,
// 			pagination,
// 			orderBy
// 		);

// 		if (sendServiceResponse(next, allUserBags)) return;

// 		const { userBags, meta } = allUserBags;

// 		if (!userBags)
// 			return next(
// 				new ErrorResponse(
// 					'No bags found for user',
// 					'No bags were found',
// 					statusCode.notFoundCode
// 				)
// 			);

// 		if (userBags.error)
// 			return next(
// 				new ErrorResponse(
// 					userBags.error,
// 					'Failed to retrieve bags ' + userBags.error.message,
// 					statusCode.internalServerErrorCode
// 				)
// 			);

// 		sendCookies(userId, res);

// 		storeSession(userId, userRole, req);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				'Successfully Retrieved Bags User Has',
// 				userBags,
// 				meta
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Getting Your Bags'
// 					: error,
// 				'Failed to retrieve items ' + error.message,
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// export const getBagBelongsToUser = async (req, res, next) => {
// 	try {
// 		const { bagId } = req.params;
// 		const { userId, userRole } = req.session;

// 		const hisBag = await findBagUserHasById(userId, bagId);

// 		if (sendServiceResponse(next, hisBag)) return;

// 		const { userBag, meta } = hisBag;

// 		if (!userBag)
// 			return next(
// 				new ErrorResponse(
// 					'Bag not found for user' + userBag,
// 					'Bag not found',
// 					statusCode.notFoundCode
// 				)
// 			);

// 		if (userBag.error)
// 			return next(
// 				new ErrorResponse(
// 					userBag.error,
// 					'Failed to retrieve bag',
// 					statusCode.internalServerErrorCode
// 				)
// 			);

// 		sendCookies(userId, res);
// 		storeSession(userId, userRole, req);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				'Successfully Retrieved Bag User Has',
// 				userBag,
// 				meta
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Getting Your Bag By Id'
// 					: error,
// 				'Failed to retrieve bag',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// export const createBagForUser = async (req, res, next) => {
// 	try {
// 		const { userId, userRole } = req.session;
// 		const { body } = req as Request<{}, {}, any>;

// 		const hisNewBag = await addBagToUser(userId, body);

// 		if (sendServiceResponse(next, hisNewBag)) return;

// 		const { newBag, meta } = hisNewBag;

// 		if (!newBag)
// 			return next(
// 				new ErrorResponse(
// 					'Failed to create bag for user',
// 					'Failed to create bag',
// 					statusCode.badRequestCode
// 				)
// 			);

// 		if (newBag.error)
// 			return next(
// 				new ErrorResponse(
// 					newBag.error,
// 					'Failed to create bag for user ' + newBag.error.message,
// 					statusCode.internalServerErrorCode
// 				)
// 			);

// 		sendCookies(userId, res);
// 		storeSession(userId, userRole, req);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.createdCode,
// 				'Successfully Created Bag For User',
// 				newBag,
// 				meta
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Making Your New Bag'
// 					: error,
// 				'Failed to create bag for user',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// export const replaceBagBelongsToUser = async (req, res, next) => {
// 	try {
// 		const { bagId } = req.params;
// 		const { userId, userRole } = req.session;
// 		const { body } = req as Request<{}, {}, any>;

// 		const bagUpdate = await replaceBagUserHas(userId, bagId, body);

// 		if (sendServiceResponse(next, bagUpdate)) return;

// 		if (!bagUpdate)
// 			return next(
// 				new ErrorResponse(
// 					'Bag not found for user',
// 					'Failed to replace bag',
// 					statusCode.notFoundCode
// 				)
// 			);

// 		if (bagUpdate.error)
// 			return next(
// 				new ErrorResponse(
// 					bagUpdate.error,
// 					'Failed to replace bag for user ' + bagUpdate.error.message,
// 					statusCode.badRequestCode
// 				)
// 			);

// 		sendCookies(userId, res);
// 		storeSession(userId, userRole, req);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				"Successfully Replace User's Bag",
// 				bagUpdate
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Replacing Your Bag'
// 					: error,
// 				'Failed to modify bag for user',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// export const modifyBagBelongsToUser = async (req, res, next) => {
// 	try {
// 		const { bagId } = req.params;
// 		const { userId, userRole } = req.session;
// 		const { body } = req as Request<{}, {}, any>;

// 		const bagUpdate = await modifyBagUserHas(userId, bagId, body);

// 		if (sendServiceResponse(next, bagUpdate)) return;

// 		if (!bagUpdate)
// 			return next(
// 				new ErrorResponse(
// 					'Bag not found for user',
// 					'Failed to modify bag',
// 					statusCode.notFoundCode
// 				)
// 			);

// 		if (bagUpdate.error)
// 			return next(
// 				new ErrorResponse(
// 					bagUpdate.error,
// 					'Failed to modify bag for user ' + bagUpdate.error.message,
// 					statusCode.badRequestCode
// 				)
// 			);

// 		sendCookies(userId, res);
// 		storeSession(userId, userRole, req);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				"Successfully Modified User's Bag",
// 				bagUpdate
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Modifying Your Bag'
// 					: error,
// 				'Failed to modify bag for user',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// export const deleteBagBelongsToUserById = async (req, res, next) => {
// 	try {
// 		const { bagId } = req.params;
// 		const { userId, userRole } = req.session;

// 		const removedBag = await removeBagUserHasById(userId, bagId);

// 		if (sendServiceResponse(next, removedBag)) return;

// 		const { deletedBag, meta } = removedBag;

// 		if (!deletedBag)
// 			return next(
// 				new ErrorResponse(
// 					'Bag not found for user',
// 					'Failed to delete bag',
// 					statusCode.notFoundCode
// 				)
// 			);

// 		if (deletedBag.error)
// 			return next(
// 				new ErrorResponse(
// 					deletedBag.error,
// 					'Failed to delete bag for user ' + deletedBag.error.message,
// 					statusCode.badRequestCode
// 				)
// 			);

// 		sendCookies(userId, res);
// 		storeSession(userId, userRole, req);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				"Successfully Deleted User's Bag",
// 				deletedBag,
// 				meta
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Removing Your Bag'
// 					: error,
// 				'Failed to delete bag for user',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// export const deleteAllBagsBelongsToUser = async (req, res, next) => {
// 	try {
// 		const { userId, userRole } = req.session;
// 		const { searchFilter = undefined } = req;

// 		const removedBags = await removeAllBagsUserHas(userId, searchFilter);

// 		if (sendServiceResponse(next, removedBags)) return;

// 		const { deletedBags, meta } = removedBags;

// 		if (!deletedBags)
// 			return next(
// 				new ErrorResponse(
// 					'No bags found for user',
// 					'Failed to delete all bags',
// 					statusCode.notFoundCode
// 				)
// 			);

// 		if (deletedBags.error)
// 			return next(
// 				new ErrorResponse(
// 					deletedBags.error,
// 					'Failed to delete all bags for user ' +
// 						deletedBags.error.message,
// 					statusCode.badRequestCode
// 				)
// 			);

// 		sendCookies(userId, res);
// 		storeSession(userId, userRole, req);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				`Successfully Deleted All User's Bags${searchFilter ? ' By Search Filter' : ''}`,
// 				deletedBags,
// 				meta
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Removing Your Bags By Filter'
// 					: error,
// 				'Failed to delete all bags for user',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// //*======================================={BAG ME Route}==============================================

// //*======================================={Bags Public Route}==============================================

// export const getAllBagsByQuery = async (req, res, next) => {
// 	try {
// 		const {
// 			searchFilter = undefined,
// 			pagination,
// 			orderBy = undefined,
// 		} = req;

// 		const allBags = await findAllBagsByQuery(
// 			searchFilter,
// 			pagination,
// 			orderBy
// 		);

// 		if (sendServiceResponse(next, allBags)) return;

// 		const { bags, meta } = allBags;

// 		if (bags.error)
// 			return next(
// 				new ErrorResponse(
// 					bags.error,
// 					'Failed to retrieve bags ' + bags.error.message,
// 					statusCode.internalServerErrorCode
// 				)
// 			);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				`Successfully Retrieved All Bags${searchFilter ? ' By Search' : ''}`,
// 				bags,
// 				meta
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Getting Bags By Filter'
// 					: error,
// 				'Failed to retrieve bags ' + error.message,
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// export const getBagById = async (req, res, next) => {
// 	try {
// 		const { bagId } = req.params;

// 		const bag = await findBagById(bagId);

// 		if (sendServiceResponse(next, bag)) return;

// 		if (!bag)
// 			return next(
// 				new ErrorResponse(
// 					'Bag not found',
// 					'Failed to retrieve bag',
// 					statusCode.notFoundCode
// 				)
// 			);

// 		if (bag.error)
// 			return next(
// 				new ErrorResponse(
// 					bag.error,
// 					'Failed to retrieve bag ' + bag.error.message,
// 					statusCode.internalServerErrorCode
// 				)
// 			);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				'Successfully Retrieved Bag By ID',
// 				bag
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Getting Bags By Id'
// 					: error,
// 				'Failed to retrieve bag',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// //*======================================={Bags Public Route}==============================================

// //*======================================={Bags Private Route}==============================================

// export const replaceBagById = async (req, res, next) => {
// 	try {
// 		const { bagId } = req.params;
// 		const { body } = req as Request<{}, {}, any>;
// 		const { userId, userRole } = req.session;

// 		const bagUpdate = await replaceBagResource(bagId, body);

// 		if (sendServiceResponse(next, bagUpdate)) return;

// 		if (!bagUpdate)
// 			return next(
// 				new ErrorResponse(
// 					'Bag not found',
// 					'Failed to replace bag',
// 					statusCode.notFoundCode
// 				)
// 			);

// 		if (bagUpdate.error)
// 			return next(
// 				new ErrorResponse(
// 					bagUpdate.error,
// 					'Failed to replace bag ' + bagUpdate.error.message,
// 					statusCode.badRequestCode
// 				)
// 			);

// 		sendCookies(userId, res);
// 		storeSession(userId, userRole, req);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				'Successfully Replaced Bag By ID',
// 				bagUpdate
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Replacing Bag'
// 					: error,
// 				'Failed to replace bag',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// export const modifyBagById = async (req, res, next) => {
// 	try {
// 		const { bagId } = req.params;
// 		const { body } = req as Request<{}, {}, any>;
// 		const { userId, userRole } = req.session;

// 		const bagUpdate = await modifyBagResource(bagId, body);

// 		if (sendServiceResponse(next, bagUpdate)) return;

// 		if (!bagUpdate)
// 			return next(
// 				new ErrorResponse(
// 					'Bag not found',
// 					'Failed to Modify bag',
// 					statusCode.notFoundCode
// 				)
// 			);

// 		if (bagUpdate.error)
// 			return next(
// 				new ErrorResponse(
// 					bagUpdate.error,
// 					'Failed to Modify bag ' + bagUpdate.error.message,
// 					statusCode.badRequestCode
// 				)
// 			);

// 		sendCookies(userId, res);
// 		storeSession(userId, userRole, req);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				'Successfully Modifying Bag By ID',
// 				bagUpdate
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Modifying Bag'
// 					: error,
// 				'Failed to modify bag',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// export const deleteBagById = async (req, res, next) => {
// 	try {
// 		const { bagId } = req.params;
// 		const { userId, userRole } = req.session;

// 		const removeBag = await removeBagById(bagId);

// 		if (sendServiceResponse(next, removeBag)) return;

// 		const { bagDelete, meta } = removeBag;

// 		if (!bagDelete)
// 			return next(
// 				new ErrorResponse(
// 					'Bag not found',
// 					'Failed to delete bag',
// 					statusCode.notFoundCode
// 				)
// 			);

// 		if (bagDelete.error)
// 			return next(
// 				new ErrorResponse(
// 					bagDelete.error,
// 					'Failed to delete bag ' + bagDelete.error.message,
// 					statusCode.badRequestCode
// 				)
// 			);

// 		sendCookies(userId, res);
// 		storeSession(userId, userRole, req);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				'Successfully Deleted Bag By ID',
// 				bagDelete,
// 				meta
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Removing Bag'
// 					: error,
// 				'Failed to delete bag',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// export const deleteAllBags = async (req, res, next) => {
// 	try {
// 		const { searchFilter = undefined } = req;
// 		const { userId, userRole } = req.session;

// 		const removeBags = await removeAllBags(searchFilter);

// 		if (sendServiceResponse(next, removeBags)) return;

// 		const { deleteCount, meta } = removeBags;

// 		if (deleteCount.error)
// 			return next(
// 				new ErrorResponse(
// 					deleteCount.error,
// 					'Failed to delete all bags ' + deleteCount.error.message,
// 					statusCode.badRequestCode
// 				)
// 			);

// 		sendCookies(userId, res);
// 		storeSession(userId, userRole, req);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				`Successfully Delete All Bags${searchFilter ? ' By Search' : ''}`,
// 				deleteCount,
// 				meta
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Removing Bags By Filter'
// 					: error,
// 				'Failed to delete all bags',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// //*======================================={Bags Private Route}==============================================
