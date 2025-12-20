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
