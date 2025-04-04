import express from 'express';
import {
	signUp,
	login,
	forgotPassword,
	resetPassword,
	updatePassword,
	updateData,
	deActivate,
	logout,
	csrfResponse,
	getAccessToken,
} from '../controllers/authController.js';
import {
	VReqToSignUp,
	VReqToLogin,
	VReqToUpdateUserData,
	VReqToForgotPassword,
	VReqToResetPassword,
	VReqToResetToken,
	VReqToUpdatePassword,
	VReqToHeaderToken,
	VReqToHeaderRefreshToken,
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
authRoute.patch('/forgot-password', VReqToForgotPassword, forgotPassword);

//* route for reset Password => PATCH param(token) (new password and confirm password)
authRoute.patch('/reset-password/:token', VReqToResetPassword, resetPassword);

//* route for update password for only login users => PATCH (Old Password and new password and confirm password)
authRoute.patch(
	'/update-password',
	VReqToHeaderToken,
	headersMiddleware,
	checkPermissionMiddleware('update:own', 'user'),
	VReqToUpdatePassword,
	updatePassword
);

//* route for update user data for only logged in users => PATCH (Not for Update user Password)
authRoute.patch(
	'/update-user-data',
	VReqToHeaderToken,
	headersMiddleware,
	VReqToUpdateUserData,
	checkPermissionMiddleware('update:own', 'user'),
	updateData
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

//* to get csrf token to send with the request body
authRoute.get('/csrf-token', csrfResponse);

//* to get new access token => POST refresh token in the request body
authRoute.post(
	'/refresh-token',
	VReqToHeaderRefreshToken,
	headersMiddleware,
	getAccessToken
);

export default authRoute;
