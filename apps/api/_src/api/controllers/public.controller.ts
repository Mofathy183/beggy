import { ErrorResponse, sendServiceResponse } from '../../utils/error.js';
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

		const allBags = await findAllBagsByQuery(
			searchFilter,
			pagination,
			orderBy
		);

		if (sendServiceResponse(next, allBags)) return;

		const { bags, meta } = allBags;

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
				Object.keys(error).length === 0
					? 'Error Occur while Getting Bags By Filter'
					: error,
				'Failed to retrieve bags ' + error.message,
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const getBagById = async (req, res, next) => {
	try {
		const { bagId } = req.params;

		const bag = await findBagById(bagId);

		if (sendServiceResponse(next, bag)) return;

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
				bag
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Getting Bags By Id'
					: error,
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

		if (sendServiceResponse(next, item)) return;

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
				Object.keys(error).length === 0
					? 'Error Occur while Getting Item By Id'
					: error,
				'Failed to get item by id',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const getItemsByQuery = async (req, res, next) => {
	try {
		const {
			pagination,
			orderBy = undefined,
			searchFilter = undefined,
		} = req;

		const allItems = await findItemsByQuery(
			pagination,
			searchFilter,
			orderBy
		);

		if (sendServiceResponse(next, allItems)) return;

		const { items, meta } = allItems;

		if (items.error)
			return next(
				new ErrorResponse(
					'Failed to find all items ' + items.error,
					'Failed to find all items ' + items.error.message,
					statusCode.internalServerErrorCode
				)
			);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				`Successfully found all items${searchFilter ? ' by Search' : ''}`,
				items,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Getting Items By Filter'
					: error,
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

		const allSuitcases = await findAllSuitcasesByQuery(
			searchFilter,
			pagination,
			orderBy
		);

		if (sendServiceResponse(next, allSuitcases)) return;

		const { suitcases, meta } = allSuitcases;

		if (suitcases.error)
			return next(
				new ErrorResponse(
					'Failed to retrieve suitcases ' + suitcases.error,
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
				Object.keys(error).length === 0
					? 'Error Occur while Getting Suitcases By Filter'
					: error,
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

		if (sendServiceResponse(next, suitcase)) return;

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
