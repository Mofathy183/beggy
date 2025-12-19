import { config } from 'dotenv';
import { CookieOptions } from 'express';
import type { SessionOptions } from 'express-session';
import type { Secret, SignOptions } from 'jsonwebtoken';
import type { StrategyOptions as FacebookStrategyOptions } from 'passport-google-oauth20';
import type { StrategyOptions as GoogleStrategyOptions } from 'passport-facebook';

type Unit =
	| 'Years'
	| 'Year'
	| 'Yrs'
	| 'Yr'
	| 'Y'
	| 'Weeks'
	| 'Week'
	| 'W'
	| 'Days'
	| 'Day'
	| 'D'
	| 'Hours'
	| 'Hour'
	| 'Hrs'
	| 'Hr'
	| 'H'
	| 'Minutes'
	| 'Minute'
	| 'Mins'
	| 'Min'
	| 'M'
	| 'Seconds'
	| 'Second'
	| 'Secs'
	| 'Sec'
	| 's'
	| 'Milliseconds'
	| 'Millisecond'
	| 'Msecs'
	| 'Msec'
	| 'Ms';

type UnitAnyCase = Unit | Uppercase<Unit> | Lowercase<Unit>;

type StringValue =
	| `${number}`
	| `${number}${UnitAnyCase}`
	| `${number} ${UnitAnyCase}`;

config({ path: '../../.env' });

// export const serverConfig = {
// 	port: process.env.PORT,
// };

// export const coreConfig = {
// 	origin: 'http://localhost:5173',
// };

// export const bcryptConfig = {
// 	saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
// };

export const resendConfig = {
	apiKey: process.env.RESEND_API_KEY,
	testDomain: 'onboarding@resend.dev',
	//* subjects
	verify: 'Welcome to Beggy! Please Verify Your Email Address',
	reset: 'Forgot Your Password? Reset It Now',
};

export const resetPasswordUrl = '/api/beggy/auth/reset-password';

export const verifyEmailUrl = '/api/beggy/auth/verify-email';

export const googleAuthConfig: GoogleStrategyOptions = {
	clientID: process.env.GOOGLE_CLIENT_ID as string,
	clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
	callbackURL: 'http://localhost:3000/api/beggy/auth/google/callback',
	scope: ['https://www.googleapis.com/auth/userinfo.profile', 'email'],
};

export const facebookAuthConfig: FacebookStrategyOptions = {
	clientID: process.env.FACEBOOK_CLIENT_ID as string,
	clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
	callbackURL: process.env.FACEBOOK_CALLBACK_URL ?? '',
	// profileFields: [
	// 	'id',
	// 	'email',
	// 	'name',
	// 	'photos',
	// 	'gender',
	// 	'birthday',
	// 	'hometown',
	// ],
};

// export const frontendOAuth = {
// 	success: process.env.FRONTEND_OAUTH_SUCCESS_URL,
// 	failed: process.env.FRONTEND_OAUTH_FAILED_URL,
// };

// export const AIConfig = {
// 	headers: { Authorization: `Bearer ${process.env.AI_API_KEY}` },
// 	url: 'https://api.together.xyz/v1/chat/completions',
// 	model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
// };

// export const openweatherApiConfig = {
// 	apiKey: process.env.OPENWEATHER_API_KEY,
// 	baseURL: process.env.OPENWEATHER_API_URL,
// 	units: 'metric',
// };

function required(key: string): string {
	const value = process.env[key];
	if (!value) {
		throw new Error(`Missing env variable: ${key}`);
	}
	return value;
}

export const env = {
	NODE_ENV: process.env.NODE_ENV ?? 'development',
	PORT: Number(process.env.PORT ?? 3000),

	JWT_SECRET: required('JWT_SECRET') as Secret,
	JWT_EXPIRES_IN: required('JWT_EXPIRES_IN') as StringValue,

	JWT_REFRESH_SECRET: required('JWT_REFRESH_SECRET') as Secret,
	JWT_REFRESH_EXPIRES_IN: required('JWT_REFRESH_EXPIRES_IN') as StringValue,

	SESSION_SECRET: required('SESSION_SECRET'),

	CORE_ORIGIN: required('CORE_ORIGIN'),

	BCRYPT_SALT_ROUNDS: required('BCRYPT_SALT_ROUNDS'),

	//* GOOGLE OAUTH
	GOOGLE_CLIENT_ID: required('GOOGLE_CLIENT_ID'),
	GOOGLE_CLIENT_SECRET: required('GOOGLE_CLIENT_SECRET'),
	GOOGLE_CLIENT_CALLBACK_URL: required('GOOGLE_CLIENT_CALLBACK_URL'),

	//* FACEBOOK OAUTH
	FACEBOOK_CLIENT_ID: required('FACEBOOK_CLIENT_ID'),
	FACEBOOK_CLIENT_SECRET: required('FACEBOOK_CLIENT_SECRET'),
	FACEBOOK_CLIENT_CALLBACK_URL: required('FACEBOOK_CLIENT_CALLBACK_URL'),

	//* RESEND API
	RESEND_API_KEY: required('RESEND_API_KEY'),

	//* AI API
	AI_API_KEY: required('AI_API_KEY'),
	AI_API_URL: required('AI_API_URL'),
	AI_API_MODEL: required('AI_API_MODEL'),

	//* OPENWEATHER API
	OPENWEATHER_API_KEY: required('OPENWEATHER_API_KEY'),
	OPENWEATHER_API_URL: required('OPENWEATHER_API_URL'),
	UNITS: 'metric',

	//* FRONTEND OAUTH
	FRONTEND_OAUTH_SUCCESS_URL: required('FRONTEND_OAUTH_SUCCESS_URL'),
	FRONTEND_OAUTH_FAILED_URL: required('FRONTEND_OAUTH_FAILED_URL'),
} as const;

export const accessTokenConfig: SignOptions = {
	expiresIn: env.JWT_EXPIRES_IN,
};

export const refreshTokenConfig: SignOptions = {
	expiresIn: env.JWT_REFRESH_EXPIRES_IN,
};

export const sessionConfig: SessionOptions = {
	secret: env.SESSION_SECRET as string,
	resave: false,
	saveUninitialized: false,
	cookie: {
		maxAge: 3600000,
		secure: false,
		httpOnly: true,
	},
};

export const cookieOptions: CookieOptions = {
	maxAge: 15 * 60 * 1000, // Access token expires in 15 minutes
	httpOnly: true,
	sameSite: 'strict',
	secure: env.NODE_ENV === 'production',
};

export const cookieRefreshOptions: CookieOptions = {
	...cookieOptions,
	maxAge: 7 * 24 * 60 * 60 * 1000, // Refresh token expires in 7 days
};

export interface AIConfig {
	headers: {
		Authorization: string;
	};
	url: string;
	model: string;
}

export const AIConfig: AIConfig = {
	headers: { Authorization: `Bearer ${env.AI_API_KEY}` },
	url: 'https://api.together.xyz/v1/chat/completions',
	model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
};
