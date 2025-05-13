import {
	itemAutoFilling,
	bagAutoFilling,
	suitcaseAutoFilling,
	getLocation,
	getWeather,
} from '../../services/featuresService.js';
import { updateUserData } from '../../services/authService.js';
import { storeSession, sendCookies } from '../../utils/authHelper.js';
import { statusCode } from '../../config/status.js';
import { ErrorResponse, sendServiceResponse } from '../../utils/error.js';
import SuccessResponse from '../../utils/successResponse.js';

export const autoFillItemFields = async (req, res, next) => {
	try {
		const { body } = req;
		const { userId, userRole } = req.session;

		const fields = await itemAutoFilling(body);

		if (sendServiceResponse(next, fields)) return;

		if (!fields)
			return next(
				new ErrorResponse(
					'Failed to auto-fill item',
					'Failed to auto-fill item',
					statusCode.badRequestCode
				)
			);

		if (fields.error)
			return next(
				new ErrorResponse(
					`Failed to auto-fill item ${fields.error}`,
					`Failed to auto-fill item ${fields.error.message}`,
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully Auto-Filled Item',
				fields
			)
		);
	} catch (error) {
		next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Getting Item Volume and Weight from AI'
					: error,
				'Failed to auto-fill items',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const autoFillBagFields = async (req, res, next) => {
	try {
		const { body } = req;

		const { userId, userRole } = req.session;

		const fields = await bagAutoFilling(body);

		if (sendServiceResponse(next, fields)) return;

		if (!fields)
			return next(
				new ErrorResponse(
					'Failed to auto-fill bag',
					'Failed to auto-fill bag',
					statusCode.badRequestCode
				)
			);

		if (fields.error)
			return next(
				new ErrorResponse(
					'Failed to auto-fill bag ' + fields.error,
					'Failed to auto-fill bag ' + fields.error.message,
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully Auto-Filled Bag',
				fields
			)
		);
	} catch (error) {
		next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Getting Bag Weight, Capacity and Max Weight from AI'
					: error,
				'Failed to auto-fill bags',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const autoFillSuitcaseFields = async (req, res, next) => {
	try {
		const { body } = req;

		const { userId, userRole } = req.session;

		const fields = await suitcaseAutoFilling(body);

		if (sendServiceResponse(next, fields)) return;

		if (!fields)
			return next(
				new ErrorResponse(
					'Failed to auto-fill suitcase',
					'Failed to auto-fill suitcase',
					statusCode.badRequestCode
				)
			);

		if (fields.error)
			return next(
				new ErrorResponse(
					'Failed to auto-fill suitcase ' + fields.error,
					'Failed to auto-fill suitcase ' + fields.error.message,
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully Auto-Filled Suitcase',
				fields
			)
		);
	} catch (error) {
		next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Getting Suitcase Weight, Capacity and Max Weight from AI'
					: error,
				'Failed to auto-fill suitcases',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const location = async (req, res, next) => {
	try {
		const { userIp, userId, userRole } = req.session;

		const ip = String(userIp).replace(/^::ffff:/, '');

		const userLocation = await getLocation(ip);

		if (sendServiceResponse(next, userLocation)) return;

		const { country, city } = userLocation;

		if (country.error || city.error)
			return next(
				new ErrorResponse(
					'Failed to retrieve location ' +
						country.error +
						' ' +
						city.error,
					'Failed to retrieve location ' +
						country.error.message +
						' ' +
						country.error.message,
					statusCode.badRequestCode
				)
			);

		if (!country || !city)
			return next(
				new ErrorResponse(
					'Failed to retrieve location',
					'Failed to retrieve location',
					statusCode.badRequestCode
				)
			);

		const updatedUserData = await updateUserData(userId, {
			country: country,
			city: city,
		});

		if (sendServiceResponse(next, updatedUserData)) return;

		if (!updatedUserData || updatedUserData.error)
			return next(
				new ErrorResponse(
					'Failed to update user data' || updatedUserData.error,
					'Failed to update',
					updatedUserData.error
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully updated user City and Country',
				updatedUserData
			)
		);
	} catch (error) {
		next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Getting Your Location'
					: error,
				'Failed to retrieve location',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const weather = async (req, res, next) => {
	try {
		const { userId, userRole } = req.session;

		const weatherData = await getWeather(userId);

		if (sendServiceResponse(next, weatherData)) return;

		if (!weatherData)
			return next(
				new ErrorResponse(
					'Failed to get weather',
					'weather data not found',
					statusCode.badRequestCode
				)
			);

		if (weatherData.error)
			return next(
				new ErrorResponse(
					weatherData.error,
					weatherData.error.message,
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully fetched weather information',
				weatherData
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Getting Weather'
					: error,
				'Failed to retrieve weather ' + error.message,
				statusCode.internalServerErrorCode
			)
		);
	}
};
