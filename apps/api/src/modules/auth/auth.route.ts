import express from 'express';
import {
	signUp,
	login,
	authMe,
	forgotPassword,
	resetPassword,
	updatePassword,
	updateData,
	changeEmail,
	sendVerificationEmail,
	verifyEmail,
	permissions,
	deActivate,
	logout,
	csrfProtection,
	getAccessToken,
} from '../controllers/authController.js';
import { verifyEmailQueryMiddleware } from '../../middlewares/middlewares.js';
import {
	VReqToSignUp,
	VReqToLogin,
	VReqToUpdateUserData,
	VReqToEmail,
	VReqToResetPassword,
	VReqToResetToken,
	VReqToUpdatePassword,
	VReqToHeaderToken,
	VReqToCookieRefreshToken,
	headersMiddleware,
	checkPermissionMiddleware,
} from '../../middlewares/authMiddleware.js';

//*==============================================={{ AUTH ROUTES }}=====================================================

const authRoute = express.Router();

authRoute.param('token', (req, res, next, token) =>
	VReqToResetToken(req, res, next, token, 'token')
);

//* route for signup => POST
authRoute.post('/signup', VReqToSignUp, signUp);

//* route for login => POST
authRoute.post('/login', VReqToLogin, login);

//* route for forgot Password => POST (email)
authRoute.patch('/forgot-password', VReqToEmail, forgotPassword);

//* route for reset Password => PATCH param(token) (new password and confirm password)
authRoute.patch('/reset-password/:token', VReqToResetPassword, resetPassword);

//* route for logout => POST
authRoute.post(
	'/logout',
	VReqToHeaderToken,
	headersMiddleware,
	checkPermissionMiddleware('delete:own', 'user'),
	logout
);

//* route for verify email
//* query {token} and {type => "email_verification" or "change_email"}
//* will be use for verify email and when the user change his email
authRoute.get('/verify-email', verifyEmailQueryMiddleware, verifyEmail);

//* to get csrf token to send with the request body
authRoute.get('/csrf-token', csrfProtection);

//* to get new access token => POST refresh token in the request body
authRoute.post(
	'/refresh-token',
	VReqToCookieRefreshToken,
	headersMiddleware,
	getAccessToken
);

export default authRoute;
//*==============================================={{ AUTH ROUTES }}=====================================================

//*==============================================={{ OAUTH ROUTES }}=====================================================
const accountRoute = express.Router();

//*: route for start OAuth Google authenticate => GET
accountRoute.get(
	'/google',
	passport.authenticate('google', {
		scope: ['profile', 'email'],
	})
);

//*: route for callback OAuth Google authenticate => GET
accountRoute.get(
	'/google/callback',
	passport.authenticate('google', {
		failureRedirect: '/api/beggy/auth/login',
		session: true, // If you use sessions
	}),
	VReqUserSocialProfile,
	loginWithGoogle
);

//*: route for start OAuth Facebook authenticate => GET
accountRoute.get(
	'/facebook',
	passport.authenticate('facebook', {
		scope: [
			'email',
			'public_profile',
			'user_gender',
			'user_hometown',
			'user_birthday',
			'user_photos',
		],
	})
);

//*: route for callback OAuth Facebook authenticate => GET
accountRoute.get(
	'/facebook/callback',
	passport.authenticate('facebook', {
		session: true, // save user's session in the cookie
		failureRedirect: '/api/beggy/auth/login', // if fail to authenticate, redirect to login page
	}),
	VReqUserSocialProfile, // to check if the user data is stored in session
	authenticateWithFacebook
);

//*==============================================={{ OAUTH ROUTES }}=====================================================
