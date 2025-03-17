import { ErrorResponse } from '../../utils/error.js';
import { statusCode } from '../../config/status.js';
import SuccessResponse from '../../utils/successResponse.js';
import {
	findAllBagsByQuery,
	findBagById,
	findItemsByQuery,
	findItemById,
	findAllSuitcasesByQuery,
	findSuitcaseById,
	findAllUsers,
	findUserPublicProfile,
} from '../../services/publicService.js';

//*======================================={Bags Public Route}==============================================

export const getAllBagsByQuery = async (req, res, next) => {
	try {
		const {
			searchFilter = undefined,
			pagination,
			orderBy = undefined,
		} = req;
		const { bags, meta } = await findAllBagsByQuery(
			searchFilter,
			pagination,
			orderBy
		);

		if (bags.error)
			return next(
				new ErrorResponse(
					bags.error,
					'Failed to retrieve bags ' + bags.error.message,
					statusCode.internalServerErrorCode
				)
			);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				`Successfully Retrieved All Bags${searchFilter ? ' By Search' : ''}`,
				bags,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to retrieve bags ' + error.message,
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const getBagById = async (req, res, next) => {
	try {
		const { bagId } = req.params;
		const { bag, meta } = await findBagById(bagId);

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
					'Failed to retrieve bag ' + bag.error.message,
					statusCode.internalServerErrorCode
				)
			);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully Retrieved Bag By ID',
				bag,
				meta
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

//*======================================={Bags Public Route}==============================================

//*======================================={Items Public Route}==============================================

export const getItemsById = async (req, res, next) => {
	try {
		const { itemId } = req.params;

		const item = await findItemById(itemId);

		if (!item)
			return next(
				new ErrorResponse(
					'Item not found',
					'Failed to find item by id',
					statusCode.notFoundCode
				)
			);

		if (item.error)
			return next(
				new ErrorResponse(
					'Failed to find item by id ' + item.error,
					'Failed to find item by id ' + item.error.message,
					statusCode.internalServerErrorCode
				)
			);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully found item by id',
				item
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to get item by id',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const getItemsByQuery = async (req, res, next) => {
	try {
		const { pagination, orderBy, searchFilter } = req;

		const { items, meta } = await findItemsByQuery(
			pagination,
			searchFilter,
			orderBy
		);

		if (items.error)
			return next(
				new ErrorResponse(
					items.error || 'Failed to find all items',
					'Failed to find all items',
					statusCode.internalServerErrorCode
				)
			);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully found all items by Search',
				items,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to get all items',
				statusCode.internalServerErrorCode
			)
		);
	}
};

//*======================================={Items Public Route}=============================================

//*======================================={Suitcase Public Route}==============================================

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

//*======================================={Suitcase Public Route}==============================================

//*======================================={Users Public Route}==============================================

export const getAllUsers = async (req, res, next) => {
	try {
		const {
			searchFilter = undefined,
			pagination,
			orderBy = undefined,
		} = req;

		const { users, meta } = await findAllUsers(
			pagination,
			searchFilter,
			orderBy
		);

		if (!users)
			return next(
				new ErrorResponse(
					'No users found',
					"Couldn't find any users",
					statusCode.notFoundCode
				)
			);

		if (users.error)
			return next(
				new ErrorResponse(
					users.error,
					"Couldn't find all users " + users.error.message,
					statusCode.internalServerErrorCode
				)
			);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				`Users Found Successfully${searchFilter ? ' By Search' : ''}`,
				users,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to find all users',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const getUserPublicProfile = async (req, res, next) => {
	try {
		const { id } = req.params;

		const user = await findUserPublicProfile(id);

		if (!user)
			return next(
				new ErrorResponse(
					'User not found',
					"Couldn't find user by this id",
					statusCode.notFoundCode
				)
			);

		if (user.error)
			return next(
				new ErrorResponse(
					user.error,
					"Couldn't find user by this id " + user.error.message,
					statusCode.internalServerErrorCode
				)
			);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'User Retrieved By Its ID Successfully',
				user
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to retrieve public user profile',
				statusCode.internalServerErrorCode
			)
		);
	}
};

//*======================================={Users Public Route}==============================================
