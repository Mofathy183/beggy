import express from 'express';
import passport from '../../config/passport.js';
import { VReqUserSocialProfile } from '../../middlewares/validateRequest.js';
import {
	loginWithGoogle,
	authenticateWithFacebook,
} from '../controllers/accountController.js';

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

export default accountRoute;
