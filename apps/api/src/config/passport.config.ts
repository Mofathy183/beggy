import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import passport from 'passport';
import { googleAuthConfig, facebookAuthConfig } from './env.config.js';

import type {
	Strategy as GoogleStrategyType,
	Profile as GoogleProfileType,
} from 'passport-google-oauth20';
import type {
	Strategy as FacebookStrategyType,
	Profile as FacebookProfileType,
} from 'passport-facebook';

const googleProvider: GoogleStrategyType = new GoogleStrategy(
	googleAuthConfig,
	(
		_accessToken: string,
		_refreshToken: string,
		profile: GoogleProfileType,
		done: (error: any, user?: any, info?: any) => void
	) => {
		const user = {
			profile,
		};

		return done(null, user);
	}
);

const facebookProvider: FacebookStrategyType = new FacebookStrategy(
	{
		...facebookAuthConfig,
		callbackURL: facebookAuthConfig.callbackURL as string, // Ensure callbackURL is always string, not undefined
	},
	(
		_accessToken: string,
		_refreshToken: string,
		profile: FacebookProfileType,
		done: (error: any, user?: any, info?: any) => void
	) => {
		const user = {
			profile,
		};

		return done(null, user);
	}
);

passport.use(googleProvider);
passport.use(facebookProvider);

//* to store user id in session
passport.serializeUser((user, done) => {
	done(null, user);
});

passport.deserializeUser((user, done) => {
	return done(null, user);
});

export default passport;
