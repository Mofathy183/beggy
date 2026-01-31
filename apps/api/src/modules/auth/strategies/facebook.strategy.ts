// /**
//  * Logs in or creates a user using Facebook OAuth profile data.
//  *
//  * @description This function takes a Facebook profile, extracts necessary information (such as name, email, gender, and profile photo), and either logs in or creates a new user in the database. It handles account creation using the Facebook provider and sets the password to a generated hash. If the user doesn't exist, they are created with the provided Facebook data.
//  *
//  * @param {Object} profile - The profile object returned by the Facebook OAuth authentication.
//  * @param {string} profile.id - The unique Facebook ID of the user.
//  * @param {string} profile.provider - The provider used for authentication (in this case, Facebook).
//  * @param {Array} profile.emails - An array of email objects for the user.
//  * @param {string} profile.emails[0].value - The user's email address.
//  * @param {Object} profile._json - Additional Facebook profile data.
//  * @param {string} profile._json.birthday - The user's birthday.
//  * @param {string} profile._json.gender - The user's gender.
//  * @param {Object} profile.name - The name object containing the user's first and last name.
//  * @param {string} profile.name.givenName - The user's first name.
//  * @param {string} profile.name.familyName - The user's last name.
//  * @param {Array} profile.photos - An array of photo objects for the user.
//  * @param {string} profile.photos[0].value - The user's profile photo URL.
//  *
//  * @returns {Object|ErrorHandler} - Returns an object with the user's role and safe user data if successful, or an ErrorHandler if an error occurs.
//  */
// export const loginUserWithFacebook = async (profile) => {
// 	try {
// 		const { id, provider, emails, name, photos, _json } = profile;
// 		const { birthday, gender } = _json;
// 		const { givenName: firstName, familyName: lastName } = name;
// 		const { value: photo } = photos[0];
// 		const { value: email = undefined } = emails[0];

// 		if (!email)
// 			return new ErrorHandler(
// 				'email',
// 				'We couldn’t access your email from Facebook. ',
// 				'Please make sure your Facebook account has an email and you granted permission to share it.',
// 				statusCode.badRequestCode
// 			);

// 		const user = await prisma.user.upsert({
// 			where: { email },
// 			update: {},
// 			create: {
// 				firstName,
// 				lastName,
// 				email,
// 				isEmailVerified: true,
// 				password: generateOAuthPassword(),
// 				birth: birthOfDate(birthday),
// 				gender,
// 				profilePicture: haveProfilePicture(photo),
// 				account: {
// 					create: {
// 						provider,
// 						providerId: id,
// 					},
// 				},
// 			},
// 			omit: {
// 				password: true,
// 				passwordChangeAt: true,
// 			},
// 		});

// 		if (!user)
// 			return new ErrorHandler(
// 				'user',
// 				'There is no user with that email',
// 				'User not found',
// 				statusCode.notFoundCode
// 			);

// 		if (user.error)
// 			return new ErrorHandler(
// 				'prisma',
// 				user.error,
// 				'Could not create user ' + user.error.message,
// 				statusCode.internalServerErrorCode
// 			);

// 		const { role, id: userId } = user;

// 		return { role, userId };
// 	} catch (error) {
// 		return new ErrorHandler(
// 			'catch',
// 			Object.keys(error).length === 0
// 				? 'Error Occur while Login with Facebook'
// 				: error,
// 			'An error occurred while trying to Login with Facebook',
// 			statusCode.internalServerErrorCode
// 		);
// 	}
// };

// export const authenticateWithFacebook = async (req, res, next) => {
// 	try {
// 		const { profile } = req.user;

// 		const user = await loginUserWithFacebook(profile);

// 		if (sendServiceResponse(next, user)) return;

// 		if (!user)
// 			return next(
// 				new ErrorResponse(
// 					'User Not Found',
// 					'User must exist to authenticate',
// 					statusCode.notFoundCode
// 				)
// 			);

// 		if (user.error)
// 			return next(
// 				new ErrorResponse(
// 					user.error,
// 					"Error Couldn't login with Facebook " + user.error.message,
// 					statusCode.badRequestCode
// 				)
// 			);

// 		const { role, userId } = user;

// 		sendCookies(userId, res);

// 		storeSession(userId, role, req);

// 		//* that will navigate to home page in frontend
// 		return res.redirect(`${frontendOAuth.success}?state=success`);
// 	} catch (error) {
// 		//* that will navigate to login page in frontend
// 		return res.redirect(`${frontendOAuth.failed}?state=success`);
// 	}
// };
