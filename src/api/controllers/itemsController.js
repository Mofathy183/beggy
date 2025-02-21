import { findItemsUserHas } from '../../services/itemsService.js';
import { statusCode } from '../../config/status.js';
import { sendCookies, storeSession } from '../../utils/authHelper.js';
import ErrorResponse from '../../utils/error.js';
import SuccessResponse from '../../utils/successResponse.js';

export const getItemsBelongsToUser = async (req, res, next) => {
	try {
		const { limit, offset, page } = req.pagination;
		const { id } = req.params;

		const { userItems, meta, userRole } = await findItemsUserHas(
			id,
			page,
			limit,
			offset
		);

		if (userItems.error)
			next(
				new ErrorResponse(
					'Error finding items' || userItems.error,
					"Couldn't find items user has" || userItems.error.message,
					statusCode.badRequestCode
				)
			);

		sendCookies(id, res), storeSession(id, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully found items user has',
				userItems,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to get items Belongs to user',
				statusCode.internalServerErrorCode
			)
		);
	}
};
