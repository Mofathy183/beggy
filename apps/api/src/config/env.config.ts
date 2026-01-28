import { config as dotEnvConfig } from 'dotenv';
import { CookieOptions } from 'express';
import type { DoubleCsrfConfig, CsrfIgnoredRequestMethods } from 'csrf-csrf';
import type { Request } from 'express';
import type { SessionOptions } from 'express-session';
import type { Secret, SignOptions } from 'jsonwebtoken';
import type { StrategyOptions as FacebookStrategyOptions } from 'passport-facebook';
import type { StrategyOptions as GoogleStrategyOptions } from 'passport-google-oauth20';
import { STATUS_CODE } from '@shared/constants';

// Load environment variables
dotEnvConfig({ path: '../../.env' });

// ============================================
// TYPES
// ============================================

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

type Environment = 'development' | 'production' | 'test';

const CSRF_IGNORE_METHODS: CsrfIgnoredRequestMethods = [
	'GET',
	'HEAD',
	'OPTIONS',
];
const CSRF_IGNORE_PATHS = [
	'/api/beggy/auth/google/callback',
	'/api/beggy/auth/facebook/callback',
	'/api/docs', // API documentation
];

// ============================================
// HELPER FUNCTIONS
// ============================================

const required = (key: string): string => {
	const value = process.env[key];
	if (!value) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
	return value;
};

const optional = (key: string, defaultValue: string = ''): string => {
	return process.env[key] || defaultValue;
};

const optionalNumber = (key: string, defaultValue: number): number => {
	const value = process.env[key];
	if (!value) return defaultValue;

	const parsed = Number(value);
	if (isNaN(parsed)) {
		console.warn(
			`Invalid number for ${key}, using default: ${defaultValue}`
		);
		return defaultValue;
	}
	return parsed;
};

// // Regular optionalArray for string arrays (like paths)
// const optionalArray = <T extends string>(key: string, defaultValue: T[], separator: string = ','): T[] => {
//     const value = process.env[key];
//     if (!value) return defaultValue;
//     return value
//         .split(separator)
//         .map(item => item.trim())
//         .filter(item => item.length > 0) as T[];
// }

// ============================================
// ENVIRONMENT VALIDATION
// ============================================

export const env = {
	// App
	NODE_ENV: optional('NODE_ENV', 'development') as Environment,
	PORT: optionalNumber('PORT', 3000),

	// Security
	JWT_SECRET: required('JWT_SECRET') as Secret,
	JWT_EXPIRES_IN: required('JWT_EXPIRES_IN') as StringValue,
	JWT_ACCESS_TOKEN_NAME: required('JWT_ACCESS_TOKEN_NAME'),

	JWT_REFRESH_SECRET: required('JWT_REFRESH_SECRET') as Secret,
	JWT_REFRESH_EXPIRES_IN: required('JWT_REFRESH_EXPIRES_IN') as StringValue,
	JWT_REFRESH_TOKEN_NAME: required('JWT_REFRESH_TOKEN_NAME'),

	SESSION_SECRET: required('SESSION_SECRET'),
	BCRYPT_SALT_ROUNDS: optionalNumber('BCRYPT_SALT_ROUNDS', 10),

	// CSRF Configuration (for csrf-csrf library)
	CSRF_SECRET_KEY: required('CSRF_SECRET_KEY'),
	CSRF_TOKEN_LENGTH: optionalNumber('CSRF_TOKEN_LENGTH', 64),
	CSRF_COOKIE_NAME: optional('CSRF_COOKIE_NAME', 'XSRF-TOKEN'),

	// CORS & URLs
	CORE_ORIGIN: optional('CORE_ORIGIN', 'http://localhost:5173'),
	BASE_URL: optional('BASE_URL', 'http://localhost:3000'),

	// OAuth - Google
	GOOGLE_CLIENT_ID: required('GOOGLE_CLIENT_ID'),
	GOOGLE_CLIENT_SECRET: required('GOOGLE_CLIENT_SECRET'),
	GOOGLE_CALLBACK_URL: optional(
		'GOOGLE_CALLBACK_URL',
		'http://localhost:3000/api/beggy/auth/google/callback'
	),

	// OAuth - Facebook
	FACEBOOK_CLIENT_ID: required('FACEBOOK_CLIENT_ID'),
	FACEBOOK_CLIENT_SECRET: required('FACEBOOK_CLIENT_SECRET'),
	FACEBOOK_CALLBACK_URL: required('FACEBOOK_CALLBACK_URL'),

	// Email
	RESEND_API_KEY: required('RESEND_API_KEY'),

	// AI Service
	AI_API_KEY: required('AI_API_KEY'),
	AI_API_URL: required('AI_API_URL'),
	AI_API_MODEL: optional(
		'AI_API_MODEL',
		'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free'
	),

	// Weather API
	OPENWEATHER_API_KEY: required('OPENWEATHER_API_KEY'),
	OPENWEATHER_API_URL: required('OPENWEATHER_API_URL'),

	// Frontend URLs
	FRONTEND_OAUTH_SUCCESS_URL: required('FRONTEND_OAUTH_SUCCESS_URL'),
	FRONTEND_OAUTH_FAILED_URL: required('FRONTEND_OAUTH_FAILED_URL'),
} as const;

// ============================================
// CONFIGURATION OBJECTS
// ============================================

// Server Configuration
export const serverConfig = {
	port: env.PORT,
	environment: env.NODE_ENV,
	isProduction: env.NODE_ENV === 'production',
	isDevelopment: env.NODE_ENV === 'development',
} as const;

// Core App Configuration
export const coreConfig = {
	origin: env.CORE_ORIGIN,
	baseUrl: env.BASE_URL,
} as const;

// Security Configuration
export const securityConfig = {
	bcrypt: {
		saltRounds: env.BCRYPT_SALT_ROUNDS,
	},
	jwt: {
		access: {
			secret: env.JWT_SECRET,
			config: {
				expiresIn: env.JWT_EXPIRES_IN,
				algorithm: 'HS256' as const, // Add algorithm
			} as SignOptions,
		},
		refresh: {
			secret: env.JWT_REFRESH_SECRET,
			config: {
				expiresIn: env.JWT_REFRESH_EXPIRES_IN,
				algorithm: 'HS256' as const, // Add algorithm
			} as SignOptions,
		},
	},
} as const;

// CSRF Configuration (for csrf-csrf package)
export const doubleCsrfConfig: DoubleCsrfConfig = {
	// Required: Function that returns the secret
	getSecret: () => env.CSRF_SECRET_KEY,

	// Required: Function that returns a unique session identifier
	// Helper function for session identifier
	getSessionIdentifier: (req: Request): string => {
		// // Try to get session ID first, then fall back to IP
		// return (
		// 	req.session?.id || req.sessionID || req.ip || 'anonymous-session'
		// );
        // Tie CSRF to refresh token presence (best stateless anchor)
        return (
            req.cookies?.[env.JWT_REFRESH_TOKEN_NAME] ??
            req.cookies?.[env.JWT_ACCESS_TOKEN_NAME] ??
            'unauthenticated'
        );
	},

	// Required: Cookie name for the CSRF token
	cookieName: env.CSRF_COOKIE_NAME,

	// Required: Cookie options
	cookieOptions: {
		maxAge: 24 * 60 * 60 * 1000, // 24 hours
		httpOnly: false, // Must be accessible via JavaScript for Double Submit Cookie pattern
		secure: serverConfig.isProduction,
		sameSite: serverConfig.isProduction ? 'strict' : 'lax',
		path: '/',
	} as CookieOptions,

	// Token size in bytes (uses CSRF_TOKEN_LENGTH from env)
	size: env.CSRF_TOKEN_LENGTH,

	// Methods to ignore CSRF protection for
	ignoredMethods: CSRF_IGNORE_METHODS,

	// Function to extract token from request
	getCsrfTokenFromRequest: (req: any): string | null | undefined => {
		// Check multiple sources for the token in this order:
		// 1. Body (for form submissions)
		// 2. Headers (for AJAX requests)
		// 3. Query string (fallback, not recommended for security)

		// From headers (most common for API calls)
		const tokenFromHeaders =
			req.headers['x-csrf-token'] ||
			req.headers['xsrf-token'] ||
			req.headers['csrf-token'] ||
			req.headers['x-xsrf-token'] ||
			req.headers['x-csrf-token']?.toString();
		if (tokenFromHeaders) return tokenFromHeaders;

		return null;
	},

	// Optional: Function to skip CSRF protection for specific paths
	skipCsrfProtection: (req: any): boolean => {
		// Check if path is in the ignore list
		return CSRF_IGNORE_PATHS.some((ignoredPath) => {
			// Exact match or path starts with ignored path
			return (
				req.path === ignoredPath ||
				req.path.startsWith(ignoredPath + '/') ||
				req.path.startsWith(ignoredPath)
			);
		});
	},

	// Optional: Custom error configuration
	errorConfig: {
		statusCode: STATUS_CODE.FORBIDDEN,
		message: 'CSRF token validation failed',
		code: 'INVALID_CSRF_TOKEN',
	},

	// Optional: Message delimiter for token generation
	messageDelimiter: '-',

	// Optional: HMAC algorithm (default is 'sha256')
	hmacAlgorithm: 'sha256',

	// Optional: Token delimiter (default is '-')
	csrfTokenDelimiter: '-',
} as const;

// Email Configuration
export const emailConfig = {
	resend: {
		apiKey: env.RESEND_API_KEY,
		testDomain: 'onboarding@resend.dev',
	},
	subjects: {
		verify: 'Welcome to Beggy! Please Verify Your Email Address',
		reset: 'Forgot Your Password? Reset It Now',
	},
	urls: {
		resetPassword: '/api/beggy/auth/reset-password',
		verifyEmail: '/api/beggy/auth/verify-email',
	},
} as const;

// OAuth Configuration
export const oauthConfig = {
	google: {
		clientID: env.GOOGLE_CLIENT_ID,
		clientSecret: env.GOOGLE_CLIENT_SECRET,
		callbackURL: env.GOOGLE_CALLBACK_URL,
		scope: ['https://www.googleapis.com/auth/userinfo.profile', 'email'],
	} as GoogleStrategyOptions,

	facebook: {
		clientID: env.FACEBOOK_CLIENT_ID,
		clientSecret: env.FACEBOOK_CLIENT_SECRET,
		callbackURL: env.FACEBOOK_CALLBACK_URL,
		profileFields: ['id', 'email', 'name', 'photos', 'gender'],
	} as FacebookStrategyOptions,

	frontend: {
		success: env.FRONTEND_OAUTH_SUCCESS_URL,
		failed: env.FRONTEND_OAUTH_FAILED_URL,
	},
} as const;

// AI Service Configuration
export const aiConfig = {
	headers: {
		Authorization: `Bearer ${env.AI_API_KEY}`,
		'Content-Type': 'application/json',
	},
	url: env.AI_API_URL,
	model: env.AI_API_MODEL,
} as const;

// Weather API Configuration
export const weatherConfig = {
	apiKey: env.OPENWEATHER_API_KEY,
	baseURL: env.OPENWEATHER_API_URL,
	units: 'metric' as const,
} as const;

// ============================================
//* EXPRESS CONFIGURATIONS
// ============================================
// Session Configuration
export const sessionConfig: SessionOptions = {
	secret: env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	cookie: {
		maxAge: 24 * 60 * 60 * 1000, // 24 hours
		secure: serverConfig.isProduction,
		httpOnly: true,
		sameSite: serverConfig.isProduction ? 'strict' : 'lax',
	},
};

// Cookie Options
const baseCookieOptions: CookieOptions = {
	httpOnly: true,
	secure: serverConfig.isProduction,
	sameSite: serverConfig.isProduction ? 'strict' : 'lax',
    path: '/',
};

export const cookieOptions: CookieOptions = {
	...baseCookieOptions,
	maxAge: 15 * 60 * 1000, // 15 minutes for access token
};

export const cookieRefreshOptions: CookieOptions = {
	...baseCookieOptions,
	maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days for refresh token
};

// ============================================
//* EXPORT ALL CONFIGURATIONS
// ============================================

export const envConfig = {
	server: serverConfig,
	core: coreConfig,
	security: securityConfig,
	csrf: doubleCsrfConfig,
	email: emailConfig,
	oauth: oauthConfig,
	ai: aiConfig,
	weather: weatherConfig,
	// session: sessionConfig,
	cookies: {
		access: cookieOptions,
		refresh: cookieRefreshOptions,
        base: baseCookieOptions
	},
} as const;
