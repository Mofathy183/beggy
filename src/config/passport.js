import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import passport from 'passport';
import { googleAuthConfig, facebookAuthConfig } from './env.js';

const googleProvider = new GoogleStrategy(
	googleAuthConfig,
	(accessToken, refreshToken, profile, done) => {
		const user = {
			profile,
			accessToken,
		};

		return done(null, user);
	}
);

const facebookProvider = new FacebookStrategy(
	facebookAuthConfig,
	(accessToken, refreshToken, profile, done) => {
		const user = {
			profile,
			accessToken,
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
