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
    addItemToUserSuitcase,
    addItemsToUserSuitcase
} from '../../services/suitcaseService.js';

export const getAllSuitcasesByQuery = async (req, res, next) => {
	try {
		const { searchFilter, pagination, orderBy } = req;
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
					'Failed to retrieve suitcases',
					statusCode.internalServerErrorCode
				)
			);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Retrieved all suitcases successfully',
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
					'Failed to retrieve suitcase by id',
					statusCode.internalServerErrorCode
				)
			);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Retrieved suitcase successfully',
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
					'Failed to replace suitcase by id',
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully replaced suitcase by id',
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
					'Failed to modify suitcase by id',
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully modified suitcase by id',
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

		const deleteSuitcase = await removeSuitcaseById(suitcaseId);

		if (!deleteSuitcase)
			return next(
				new ErrorResponse(
					'Suitcase not found',
					'Failed to delete suitcase by id',
					statusCode.notFoundCode
				)
			);

		if (deleteSuitcase.error)
			return next(
				new ErrorResponse(
					deleteSuitcase.error,
					'Failed to delete suitcase by id',
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully deleted suitcase by id',
				deleteSuitcase
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
		const deleteCount = await removeAllSuitcases();

		if (!deleteCount || deleteCount.count === 0)
			return next(
				new ErrorResponse(
					'No suitcases found',
					'Failed to delete all suitcases',
					statusCode.notFoundCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully deleted all suitcases',
				deleteCount
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

export const getSuitcasesBelongsToUser = async (req, res, next) => {
	try {
		const { userId, userRole } = req.session;
		const { searchFilter, pagination, orderBy } = req;
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
					'Failed to retrieve suitcases belonging to user',
					statusCode.internalServerErrorCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Retrieved suitcases belonging to user successfully',
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
					'Failed to retrieve suitcase belonging to user by id',
					statusCode.internalServerErrorCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Retrieved suitcase belonging to user successfully',
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

		const newSuitcase = await addSuitcaseToUser(userId, body);

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
					'Failed to create suitcase for user',
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.createdCode,
				'Suitcase created successfully and added to user',
				newSuitcase
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

        const newItem = await addItemToUserSuitcase(userId, suitcaseId, body);

        if (!newItem)
            return next(
                new ErrorResponse(
                    'Failed to create item for suitcase for user',
                    'Failed to create item for suitcase for user',
                    statusCode.badRequestCode
                )
            );

        if (newItem.error)
            return next(
                new ErrorResponse(
                    newItem.error,
                    'Failed to create item for suitcase for user',
                    statusCode.badRequestCode
                )
            );

        sendCookies(userId, res);
        storeSession(userId, userRole, req);

        return next(
            new SuccessResponse(
                statusCode.createdCode,
                'Item created successfully and added to suitcase for user',
                newItem
            )
        );
    }

    catch (error) {
        return next(
            new ErrorResponse(
                error,
                'Failed to create item for suitcase for user',
                statusCode.internalServerErrorCode
            )
        );
    }
}

export const createItemsForUserSuitcase = async (req, res, next) => {
    try {
        const { userId, userRole } = req.session;
        const { suitcaseId } = req.params;
        const { body } = req;

        const newItems = await addItemsToUserSuitcase(userId, suitcaseId, body);

        if (!newItems)
            return next(
                new ErrorResponse(
                    'Failed to create items for suitcase for user',
                    'Failed to create items for suitcase for user',
                    statusCode.badRequestCode
                )
            );

        if (newItems.error)
            return next(
                new ErrorResponse(
                    newItems.error,
                    'Failed to create items for suitcase for user',
                    statusCode.badRequestCode
                )
            );

        sendCookies(userId, res);
        storeSession(userId, userRole, req);

        return next(
            new SuccessResponse(
                statusCode.createdCode,
                'Items created successfully and added to suitcase for user',
                newItems
            )
        );
    }

    catch (error) {
        return next(
            new ErrorResponse(
                error,
                'Failed to create items for suitcase for user',
                statusCode.internalServerErrorCode
            )
        );
    }
}

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
					'Failed to replace suitcase belonging to user by id',
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully replaced suitcase belonging to user by id',
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
					'Failed to modify suitcase belonging to user by id',
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully modified suitcase belonging to user by id',
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

		const deleteCount = await removeSuitcaseUserHasById(userId, suitcaseId);

		if (!deleteCount)
			return next(
				new ErrorResponse(
					'Suitcase not found',
					'Failed to delete suitcase belonging to user by id',
					statusCode.notFoundCode
				)
			);

		if (deleteCount.error)
			return next(
				new ErrorResponse(
					deleteCount.error,
					'Failed to delete suitcase belonging to user by id',
					statusCode.internalServerErrorCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully deleted suitcase belonging to user by id',
				deleteCount
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

		const deleteCount = await removeAllSuitcasesUserHas(userId);

		if (!deleteCount || deleteCount.count === 0)
			return next(
				new ErrorResponse(
					'No suitcases found for user',
					'Failed to delete all suitcases belonging to user',
					statusCode.notFoundCode
				)
			);

		if (deleteCount.error)
			return next(
				new ErrorResponse(
					deleteCount.error,
					'Failed to delete all suitcases belonging to user',
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully deleted all suitcases belonging to user',
				deleteCount
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
