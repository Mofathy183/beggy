// /**
//  * @function getLocation
//  * @description Retrieves the user's location (city and country) based on their IP address. If the IP is private or local, it fetches the public IP first.
//  * @param {string} userIp - The user's IP address. If local or private, a public IP is retrieved.
//  * @returns {Promise<Object>} An object containing the city and country, or an error if the operation fails.
//  */
// export const getLocation = async (userIp) => {
// 	try {
// 		// If IP is local or private, get the public IP
// 		if (
// 			userIp.startsWith('192.168.') ||
// 			userIp.startsWith('10.') ||
// 			userIp === '127.0.0.1'
// 		) {
// 			const ipResponse = await axios.get(
// 				'https://api64.ipify.org?format=json'
// 			);
// 			userIp = ipResponse.data.ip;
// 		}

// 		const geoResponse = await axios.get(`http://ip-api.com/json/${userIp}`);

// 		if (geoResponse.status !== 200) {
// 			throw new ErrorHandler(
// 				'ip-api',
// 				'Failed to retrieve location data from IP geolocation API',
// 				'Failed to retrieve location data from IP geolocation API',
// 				geoResponse.status
// 			);
// 		}

// 		if (geoResponse.data.status !== 'success') {
// 			throw new ErrorHandler(
// 				'ip-api',
// 				'Failed to retrieve location data from IP geolocation API',
// 				'Failed to retrieve location data from IP geolocation API',
// 				geoResponse.status
// 			);
// 		}

// 		if (!geoResponse.data.city || !geoResponse.data.country) {
// 			throw new ErrorHandler(
// 				'ip-api',
// 				'Failed to retrieve location data from IP geolocation API',
// 				'Failed to retrieve location data from IP geolocation API',
// 				geoResponse.status
// 			);
// 		}

// 		let { city, country } = geoResponse.data;

// 		// Validate the response
// 		if (!city || !country) {
// 			throw new ErrorHandler(
// 				'ip-api',
// 				'Failed to retrieve location data from IP geolocation API',
// 				'Failed to retrieve location data from IP geolocation API',
// 				statusCode.badRequestCode
// 			);
// 		}

// 		// Format the response (Capitalize first letter)
// 		city = city.charAt(0).toUpperCase() + city.slice(1);
// 		country = country.charAt(0).toUpperCase() + country.slice(1);

// 		return { city, country };
// 	} catch (error) {
// 		throw new ErrorHandler(
// 			'Catch axios',
// 			Object.keys(error).length === 0
// 				? 'Error Occur while Getting Your Location'
// 				: error,
// 			'Failed to fetch location data from IP geolocation API ' +
// 				error.message,
// 			statusCode.internalServerErrorCode
// 		);
// 	}
// };

// /**
//  * @function getWeather
//  * @description Fetches the current weather data for a user based on their stored city and country information.
//  * @param {string} userId - The ID of the user whose weather data is being retrieved.
//  * @returns {Promise<Object>} Weather data from the OpenWeatherMap API, or an error if the operation fails.
//  */
// export const getWeather = async (userId) => {
// 	try {
// 		const user = await prisma.user.findUnique({
// 			where: { id: userId },
// 			select: {
// 				city: true,
// 				country: true,
// 			},
// 		});

// 		if (!user)
// 			return new ErrorHandler(
// 				'User not found',
// 				'User not found',
// 				'There no user with that id',
// 				statusCode.notFoundCode
// 			);

// 		if (!user.city && !user.country)
// 			return new ErrorHandler(
// 				'City and country must be provided',
// 				'Please provide a city and country to get weather',
// 				'Please provide a city and country to get weather',
// 				statusCode.notFoundCode
// 			);

// 		const { baseURL, apiKey, units } = openweatherApiConfig;

// 		const url = `${baseURL}?q=${user.city},${user.country}&appid=${apiKey}&units=${units}`;

// 		const response = await axios.get(url);

// 		if (response.status !== 200)
// 			return new ErrorHandler(
// 				'OpenWeatherMap API',
// 				'Failed to fetch weather data from OpenWeatherMap',
// 				'Failed to fetch weather data from OpenWeatherMap',
// 				response.status
// 			);

// 		if (!response)
// 			return new ErrorHandler(
// 				'OpenWeatherMap API',
// 				'Failed to fetch weather data from OpenWeatherMap',
// 				'Failed to fetch weather data from OpenWeatherMap'
// 			);

// 		if (!response.data)
// 			return new ErrorHandler(
// 				'OpenWeatherMap API',
// 				'Failed to fetch weather data from OpenWeatherMap',
// 				'Failed to fetch weather data from OpenWeatherMap',
// 				response.status
// 			);

// 		return response.data;
// 	} catch (error) {
// 		return new ErrorHandler(
// 			'Catch axios',
// 			Object.keys(error).length === 0
// 				? 'Error Occur while Getting Weather'
// 				: error,
// 			'Failed to fetch weather data from OpenWeatherMap',
// 			statusCode.internalServerErrorCode
// 		);
// 	}
// };
