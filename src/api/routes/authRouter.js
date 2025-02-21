import express from 'express';
import {
	signUp,
	login,
	forgotPassword,
	resetPassword,
	updatePassword,
	updateData,
	deActivate,
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
	headersMiddleware,
} from '../../middlewares/authMiddleware.js';

const authRoute = express.Router();

authRoute.param('token', VReqToResetToken);

//todo: route for signup => POST
authRoute.post('/signup', VReqToSignUp, signUp);

//todo: route for forgot Password => POST (email)
authRoute.patch('/forgot-password', VReqToForgotPassword, forgotPassword);

//todo: route for reset Password => PATCH param(token) (new password and confirm password)
authRoute.patch('/reset-password/:token', VReqToResetPassword, resetPassword);

//todo: route for update password for only login users => PATCH (Old Password and new password and confirm password)
authRoute.patch(
	'/update-password',
	VReqToHeaderToken, // to validate the token in the header
	headersMiddleware,
	VReqToUpdatePassword, // to validate the body of the update password request
	updatePassword
);

//todo: route for deactivate user acount => DELETE  (User must be login already to be deactivated)
authRoute.delete(
	'/deactivate',
	VReqToHeaderToken, // to validate the token in the header
	headersMiddleware,
	deActivate // to deactivate the user account
);

//todo: route for update user data for only logged in users => PATCH (Not for Update user Password)
authRoute.patch(
	'/update-user-data',
	VReqToHeaderToken, // to validate the token in the header
	headersMiddleware,
	VReqToUpdateUserData, // to validate the body of the update user request
	updateData
);

//todo: route for login => POST
authRoute.post('/login', VReqToLogin, login);

//todo: route for logout => POST
authRoute.post('/logout');

export default authRoute;
