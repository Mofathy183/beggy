import { config } from 'dotenv';
import type { SessionOptions } from 'express-session';

config({
	path: '../../.env',
});

export const serverConfig = {
	port: process.env.PORT,
};

export const JWTConfig = {
	secret: process.env.JWT_SECRET,
	expiresIn: process.env.JWT_EXPIRES_IN,

	refreshSecret: process.env.JWT_REFRESH_SECRET,
	refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
};

export const coreConfig = {
	origin: 'http://localhost:5173',
};

export const sessionConfig: SessionOptions = {
	secret: process.env.SESSION_SECRET as string,
	resave: false,
	saveUninitialized: false,
	cookie: {
		maxAge: 3600000,
		secure: false,
		httpOnly: true,
	},
};

export const cookieOptions = {
	maxAge: 15 * 60 * 1000, // Access token expires in 15 minutes
	httpOnly: true,
	sameSite: 'Strict',
	secure: process.env.NODE_ENV === 'production',
};

export const cookieRefreshOptions = {
	...cookieOptions,
	maxAge: 7 * 24 * 60 * 60 * 1000, // Refresh token expires in 7 days
};

export const bcryptConfig = {
	saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
};

export const resendConfig = {
	apiKey: process.env.RESEND_API_KEY,
	testDomain: 'onboarding@resend.dev',
	//* subjects
	verify: 'Welcome to Beggy! Please Verify Your Email Address',
	reset: 'Forgot Your Password? Reset It Now',
};

export const resetPasswordUrl = '/api/beggy/auth/reset-password';

export const verifyEmailUrl = '/api/beggy/auth/verify-email';

export const googleAuthConfig = {
	clientID: process.env.GOOGLE_CLIENT_ID,
	clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	callbackURL: 'http://localhost:3000/api/beggy/auth/google/callback',
	scope: ['https://www.googleapis.com/auth/userinfo.profile', 'email'],
};

export const facebookAuthConfig = {
	clientID: process.env.FACEBOOK_CLIENT_ID,
	clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
	callbackURL: process.env.FACEBOOK_CALLBACK_URL,
	profileFields: [
		'id',
		'email',
		'name',
		'photos',
		'gender',
		'birthday',
		'hometown',
	],
};

export const frontendOAuth = {
	success: process.env.FRONTEND_OAUTH_SUCCESS_URL,
	failed: process.env.FRONTEND_OAUTH_FAILED_URL,
};

export const AIConfig = {
	headers: { Authorization: `Bearer ${process.env.AI_API_KEY}` },
	url: 'https://api.together.xyz/v1/chat/completions',
	model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
};

export const openweatherApiConfig = {
	apiKey: process.env.OPENWEATHER_API_KEY,
	baseURL: process.env.OPENWEATHER_API_URL,
	units: 'metric',
};
