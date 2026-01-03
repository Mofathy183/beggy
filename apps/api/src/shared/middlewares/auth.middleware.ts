/**
 * Middleware to authenticate a user from the verified JWT payload in `req.auth`.
 *
 * - Assumes `req.auth` is already populated by a previous middleware (access or refresh token verification).
 * - Validates the existence of the user in the database.
 * - Checks if the user has changed their password after the token was issued.
 * - Stores the user's ID and role in the request session.
 *
 * @async
 * @function headersMiddleware
 * @param {Request} req - Express request object with `req.auth` populated.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<void>}
 *
 * @throws {ErrorResponse} - If the user is not found or password has changed after token issue time.
 */
export const headersMiddleware = async (req, res, next) => {
	try {
		const { id, iat } = req.auth;

		// Fetch the user by ID
		const user = await prisma.user.findUnique({ where: { id } });

		// If user does not exist
		if (!user) {
			return next(
				new ErrorResponse(
					'User not found',
					'User not found in the database. Please login again.',
					statusCode.unauthorizedCode
				)
			);
		}

		// If Prisma returns error somehow (defensive, in case of future API changes)
		if (user?.error) {
			return next(
				new ErrorResponse(
					user.error,
					`Failed to retrieve user: ${user.error.message}`,
					statusCode.internalServerErrorCode
				)
			);
		}

		// Check if user changed password after token was issued
		const passwordChanged = passwordChangeAfter(user.passwordChangeAt, iat);

		if (passwordChanged) {
			return next(
				new ErrorResponse(
					'Password recently changed',
					'Please log in again, your credentials have been reset.',
					statusCode.unauthorizedCode
				)
			);
		}

		// Store user info in session
		storeSession(user.id, user.role, req);

		// Continue to next middleware
		next();
	} catch (error) {
		next(
			new ErrorResponse(
				'Internal Server Error',
				error.message || 'Unexpected error in headersMiddleware',
				statusCode.internalServerErrorCode
			)
		);
	}
};

/**
 * Checks if the `confirmDelete` flag is set to `true` in the request body.
 *
 * If the flag is not set, returns an error response with a 400 status code.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export const confirmDeleteMiddleware = (req, res, next) => {
	const { confirmDelete } = req.body;

	// Check if the `confirmDelete` flag is set to true
	if (!confirmDelete) {
		// Return an error response with a 400 status code
		return next(
			new ErrorResponse(
				'Confirm delete flag is required',
				'Confirm delete flag is required to delete',
				statusCode.badRequestCode
			)
		);
	}

	// Call the next middleware in the stack
	next();
};

/**
 * Middleware to validate and store the user's location permission.
 * Ensures that the "locationPermission" is provided and is set to "granted".
 * Stores the location permission in the session.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @throws {ErrorResponse} If location permission is not provided or is denied.
 */
export const locationPermissionMiddleware = (req, res, next) => {
	const locationPermission = req.body.permission;

	if (!locationPermission)
		return next(
			new ErrorResponse(
				'Location permission not provided',
				'Unauthorized',
				statusCode.badRequestCode
			)
		);

	//* locationPermission must be "granted" that means you can you ip to get location
	//* Or "denied" that means can not use ip to get location
	if (locationPermission !== 'granted')
		return next(
			new ErrorResponse(
				'Location permission denied',
				'Unauthorized',
				statusCode.unauthorizedCode
			)
		);

	req.session.locationPermission = locationPermission;

	next();
};

/**
 * Middleware to retrieve and store the user's IP address.
 * Retrieves the IP from the "x-forwarded-for" header or socket address.
 * Stores the user's IP in the session.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @throws {ErrorResponse} If unable to retrieve the user's IP.
 */
export const userIpMiddleware = (req, res, next) => {
	const userIp = req.headers['x-forwarded-for']
		? req.headers['x-forwarded-for'].split(',')[0].trim() // Get first IP from proxy chain
		: req.socket.remoteAddress; // Fallback to direct IP

	if (!userIp)
		return next(
			new ErrorResponse(
				'Unable to get user Ip',
				'Internal Server Error',
				statusCode.serverErrorCode
			)
		);

	req.session.userIp = userIp;

	next();
};

/**
 * Middleware to validate and process email verification query parameters.
 * Ensures both 'token' and 'type' are provided and valid strings.
 * Converts the 'type' to uppercase and attaches it to the request object.
 *
 * @param {Request} req - The request object containing the query parameters.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @throws {ErrorResponse} If token or type is missing, invalid, or incorrect.
 */
export const verifyEmailQueryMiddleware = (req, res, next) => {
	const { token, type } = req.query;

	// Check if both token and type are present
	if (!token || !type)
		return next(
			new ErrorResponse(
				'Missing token or type',
				'Failed to verify user email',
				statusCode.badRequestCode
			)
		);

	// Validate that token and type are strings
	if (typeof token !== 'string' || typeof type !== 'string')
		return next(
			new ErrorResponse(
				'Invalid token or type',
				'Failed to verify user email',
				statusCode.badRequestCode
			)
		);

	// Ensure type is either 'change_email' or 'email_verification'
	if (type !== 'change_email' && type !== 'email_verification')
		return next(
			new ErrorResponse(
				'Invalid type',
				'type must be change_email or email_verification',
				statusCode.badRequestCode
			)
		);

	// Convert type to uppercase for further processing
	const upperCaseType = type.toUpperCase();

	// Attach verified token and type to the request object
	req.verified = {
		token,
		type: upperCaseType,
	};

	next();
};
