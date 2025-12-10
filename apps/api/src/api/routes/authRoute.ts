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

//* route for changing password (only for logged-in users) => PATCH
//   Requires: currentPassword, newPassword, confirmPassword
authRoute.patch(
	'/change-password',
	VReqToHeaderToken,
	headersMiddleware,
	checkPermissionMiddleware('update:own', 'user'),
	VReqToUpdatePassword,
	updatePassword
);

//* route for editing profile info (excluding password) => PATCH
authRoute.patch(
	'/edit-profile',
	VReqToHeaderToken,
	headersMiddleware,
	VReqToUpdateUserData,
	checkPermissionMiddleware('update:own', 'user'),
	updateData
);

//* route for change user email => PATCH (email) user must by login to change his email
authRoute.patch(
	'/change-email',
	VReqToHeaderToken,
	headersMiddleware,
	VReqToEmail,
	changeEmail
);

//* route for deactivate user account => DELETE  (User must be login already to be deactivated)
authRoute.delete(
	'/deactivate',
	VReqToHeaderToken,
	headersMiddleware,
	checkPermissionMiddleware('delete:own', 'user'),
	deActivate
);

//* route for logout => POST
authRoute.post(
	'/logout',
	VReqToHeaderToken,
	headersMiddleware,
	checkPermissionMiddleware('delete:own', 'user'),
	logout
);

//* route for frontend to check if user is authentic
authRoute.get('/me', VReqToHeaderToken, headersMiddleware, authMe);

//* route for send verification email
//* POST {email}
authRoute.post(
	'/send-verification-email',
	VReqToHeaderToken,
	headersMiddleware,
	VReqToEmail,
	sendVerificationEmail
);

//* route for verify email
//* query {token} and {type => "email_verification" or "change_email"}
//* will be use for verify email and when the user change his email
authRoute.get('/verify-email', verifyEmailQueryMiddleware, verifyEmail);

//* for get user permissions => GET
//* user must be login already to get his permissions
authRoute.get(
	'/permissions',
	VReqToHeaderToken,
	headersMiddleware,
	permissions
);

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
