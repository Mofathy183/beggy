import {
	itemAutoFilling,
	bagAutoFilling,
	suitcaseAutoFilling,
} from '../../services/featuresService.js';
import { statusCode } from '../../config/status.js';
import { ErrorResponse } from '../../utils/error.js';
import SuccessResponse from '../../utils/successResponse.js';

export const autoFillItemFields = async (req, res, next) => {
	try {
		const { body } = req;

		const fields = await itemAutoFilling(body);

		if (!fields)
			return next(
				new ErrorResponse(
					'Failed to auto-fill items',
					'Failed to auto-fill items',
					statusCode.badRequestCode
				)
			);

		if (fields.error)
			return next(
				new ErrorResponse(
					'Failed to auto-fill items',
					'Failed to auto-fill items',
					statusCode.badRequestCode
				)
			);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully auto-filled items',
				fields
			)
		);
	} catch (error) {
		next(
			new ErrorResponse(
				'Failed to auto-fill items',
				'Failed to auto-fill items',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const autoFillBagFields = async (req, res, next) => {
	try {
		const { body } = req;

		const fields = await bagAutoFilling(body);

		if (!fields)
			return next(
				new ErrorResponse(
					'Failed to auto-fill bags',
					'Failed to auto-fill bags',
					statusCode.badRequestCode
				)
			);

		if (fields.error)
			return next(
				new ErrorResponse(
					'Failed to auto-fill bags',
					'Failed to auto-fill bags',
					statusCode.badRequestCode
				)
			);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully auto-filled bags',
				fields
			)
		);
	} catch (error) {
		next(
			new ErrorResponse(
				'Failed to auto-fill bags',
				'Failed to auto-fill bags',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const autoFillSuitcaseFields = async (req, res, next) => {
	try {
		const { body } = req;

		const fields = await suitcaseAutoFilling(body);

		if (!fields)
			return next(
				new ErrorResponse(
					'Failed to auto-fill suitcases',
					'Failed to auto-fill suitcases',
					statusCode.badRequestCode
				)
			);

		if (fields.error)
			return next(
				new ErrorResponse(
					'Failed to auto-fill suitcases',
					'Failed to auto-fill suitcases',
					statusCode.badRequestCode
				)
			);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully auto-filled suitcases',
				fields
			)
		);
	} catch (error) {
		next(
			new ErrorResponse(
				'Failed to auto-fill suitcases',
				'Failed to auto-fill suitcases',
				statusCode.internalServerErrorCode
			)
		);
	}
};
