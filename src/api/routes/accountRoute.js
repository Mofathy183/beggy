import express from 'express';
import passport from '../../config/passport.js';
import { VReqUser } from '../../middlewares/validateRequest.js';
import {
	authenticateWithGoogle,
	authenticateWithFacebook,
} from '../controllers/accountController.js';

const accountRoute = express.Router();

//*: route for start OAuth Google authenticate => GET
accountRoute.get(
	'/google',
	passport.authenticate('google', {
		scope: ['profile', 'email'],
		session: true, // save user's session in the cookie
	})
);

//*: route for callback OAuth Google authenticate => GET
accountRoute.get(
	'/google/callback',
	passport.authenticate('google', {
		scope: ['public_profile', 'emails'], // ask for user's profile and email
		session: true, // if fail to authenticate, redirect to login page  // save user's session in the cookie
		failureRedirect: '/api/beggy/auth/login',
	}),
	VReqUser, // to check if the user data is stored in session
	authenticateWithGoogle
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
		session: true, // save user's session in the cookie
	})
);

//*: route for callback OAuth Facebook authenticate => GET
accountRoute.get(
	'/facebook/callback',
	passport.authenticate('facebook', {
		session: true, // if fail to authenticate, redirect to login page  // save user's session in the cookie
		failureRedirect: '/api/beggy/auth/login',
	}),
	VReqUser, // to check if the user data is stored in session
	authenticateWithFacebook
);

export default accountRoute;
