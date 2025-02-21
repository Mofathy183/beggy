import GoogleStrategy from 'passport-google-oauth20';
import FacebookStrategy from 'passport-facebook';
import passport from 'passport';
import { googleAuthConfig, facebookAuthConfig } from './env.js';
import { getUserById } from '../services/userService.js';
import {
	authenticateUserWithGoogle,
	authenticateUserWithFacebook,
} from '../services/accountService.js';

const googleProvider = new GoogleStrategy(
	googleAuthConfig,
	async (accessToken, refreshToken, profile, done) => {
		try {
			const userData = await authenticateUserWithGoogle(profile);

			const user = {
				profile: profile,
				accessToken: accessToken,
				userData: userData,
			};

			return done(null, user);
		} catch (error) {
			console.error('Google authentication error:', error);
			return done(error, null);
		}
	}
);

const facebookProvider = new FacebookStrategy(
	facebookAuthConfig,
	async (accessToken, refreshToken, profile, done) => {
		try {
			const userData = await authenticateUserWithFacebook(profile);

			const user = {
				profile: profile,
				accessToken: accessToken,
				userData: userData,
			};

			return done(null, user);
		} catch (error) {
			console.error('Facebook authentication error:', error);
			return done(error, null);
		}
	}
);

passport.use(googleProvider);
passport.use(facebookProvider);

//* to store user id in session
passport.serializeUser((user, done) => {
	done(null, user.userData.id);
});

passport.deserializeUser(async (id, done) => {
	try {
		const user = await getUserById(id);

		if (!user || user.error) return done(new Error("Couldn't find user"));

		return done(null, user);
	} catch (error) {
		console.error('Error deserializing user:', error);
		return done(error, null);
	}
});

export default passport;
