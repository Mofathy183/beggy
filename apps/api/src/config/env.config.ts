import dotenv from 'dotenv';
import { type CookieOptions, type Request } from 'express';
import type { DoubleCsrfConfig, CsrfIgnoredRequestMethods } from 'csrf-csrf';
import type { SessionOptions } from 'express-session';
import type { Secret, SignOptions } from 'jsonwebtoken';
import type { StrategyOptions as FacebookStrategyOptions } from 'passport-facebook';
import type { StrategyOptions as GoogleStrategyOptions } from 'passport-google-oauth20';
import { STATUS_CODE } from '@shared/constants';

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

const NODE_ENV = (process.env.NODE_ENV as Environment) ?? 'development';

const envFileMap: Record<Environment, string> = {
	development: '.env.local',
	test: '.env.test',
	production: '.env.docker',
};

const envFile = envFileMap[NODE_ENV];

if (envFile) {
	dotenv.config({ path: envFile });
} else {
	dotenv.config(); // fallback to .env
}

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
	// Must be unique and NEVER shared with refresh tokens.
	JWT_ACCESS_SECRET: required('JWT_ACCESS_SECRET') as Secret,

	// Logical lifetime of the access token (JWT `exp` claim).
	// This controls how long the token is cryptographically valid.
	JWT_ACCESS_EXPIRES_IN: required('JWT_ACCESS_EXPIRES_IN') as StringValue,

	// Should match or be slightly shorter than JWT_ACCESS_EXPIRES_IN.
	// Access tokens are always short-lived and never persistent.
	JWT_ACCESS_MAX_AGE_MS: optionalNumber(
		'JWT_ACCESS_MAX_AGE_MS',
		15 * 60 * 1000 // 15 minutes
	),

	// Should be obscure and app-specific to avoid collisions.
	JWT_ACCESS_TOKEN_NAME: required('JWT_ACCESS_TOKEN_NAME'),

	// -------------------------------
	// Refresh Token (long-lived)
	// -------------------------------

	// Must be DIFFERENT from JWT_ACCESS_SECRET to reduce blast radius.
	JWT_REFRESH_SECRET: required('JWT_REFRESH_SECRET') as Secret,

	// Logical lifetime of a standard refresh token (JWT `exp` claim).
	// Used when "Remember Me" is NOT checked.
	JWT_REFRESH_EXPIRES_IN: required('JWT_REFRESH_EXPIRES_IN') as StringValue,

	// Logical lifetime of a refresh token when "Remember Me" IS checked.
	JWT_REFRESH_REMEMBER_EXPIRES_IN: required(
		'JWT_REFRESH_REMEMBER_EXPIRES_IN'
	) as StringValue,

	// Cookie lifetime for a standard refresh token (in milliseconds).
	// Used when the user does NOT enable "Remember Me".
	JWT_REFRESH_MAX_AGE_MS: optionalNumber(
		'JWT_REFRESH_MAX_AGE_MS',
		7 * 24 * 60 * 60 * 1000 // 7 days
	),

	// Cookie lifetime for a refresh token when "Remember Me" is enabled.
	JWT_REFRESH_REMEMBER_MAX_AGE_MS: optionalNumber(
		'JWT_REFRESH_REMEMBER_MAX_AGE_MS',
		30 * 24 * 60 * 60 * 1000 // 30 days
	),

	// Cookie name used to store the refresh token.
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
	FACEBOOK_CALLBACK_URL: optional(
		'FACEBOOK_CALLBACK_URL',
		'http://localhost:3000/api/beggy/auth/facebook/callback'
	),

	// Email
	RESEND_API_KEY: required('RESEND_API_KEY'),

	// AI Service
	AI_API_KEY: required('AI_API_KEY'),
	AI_API_URL: optional(
		'AI_API_URL',
		'https://api.together.xyz/v1/chat/completions'
	),
	AI_API_MODEL: optional(
		'AI_API_MODEL',
		'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free'
	),

	// Weather API
	OPENWEATHER_API_KEY: required('OPENWEATHER_API_KEY'),
	OPENWEATHER_API_URL: optional(
		'OPENWEATHER_API_URL',
		'https://api.openweathermap.org/data/2.5'
	),

	// Frontend URLs
	FRONTEND_OAUTH_SUCCESS_URL: optional('FRONTEND_OAUTH_SUCCESS_URL', ''),
	FRONTEND_OAUTH_FAILED_URL: optional('FRONTEND_OAUTH_FAILED_URL', ''),
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

/**
 * Base JWT signing options shared across all token types.
 *
 * @remarks
 * These options define global JWT constraints that must be consistent
 * for both signing and verification:
 *
 * - `algorithm`: Cryptographic algorithm used to sign tokens
 * - `issuer`: Identifies the authority that issued the token
 * - `audience`: Identifies the intended consumer of the token
 *
 * Enforcing `issuer` and `audience` protects against:
 * - Token replay across different services
 * - Tokens issued by another system being accepted accidentally
 */
const baseJwtOptions = {
	algorithm: 'HS256',
	issuer: 'beggy-api',
	audience: 'beggy-client',
} satisfies SignOptions;

/**
 * Security Configuration
 *
 * Centralized security-related configuration for the application.
 *
 * @remarks
 * This object is intentionally:
 * - Explicit (no magic defaults)
 * - Environment-driven
 * - Immutable (`as const`)
 *
 * It defines cryptographic behavior for:
 * - Password hashing (bcrypt)
 * - Access tokens
 * - Refresh tokens
 */
export const securityConfig = {
	bcrypt: {
		/**
		 * Number of salt rounds used when hashing passwords.
		 *
		 * @remarks
		 * Higher values increase security but also CPU cost.
		 * This should be tuned based on deployment environment.
		 */
		saltRounds: env.BCRYPT_SALT_ROUNDS,
	},

	jwt: {
		/**
		 * Access token configuration.
		 *
		 * @remarks
		 * Access tokens are:
		 * - Short-lived
		 * - Sent on every authenticated request
		 * - Used for authorization decisions (roles, permissions)
		 */
		access: {
			/**
			 * Secret key used to sign and verify access tokens.
			 *
			 * @security
			 * Must be unique and NEVER shared with refresh tokens.
			 */
			secret: env.JWT_ACCESS_SECRET,

			/**
			 * Signing options for access tokens.
			 *
			 * @remarks
			 * - Includes standard JWT claims (issuer, audience)
			 * - Includes a fixed expiration time
			 */
			signOptions: {
				...baseJwtOptions,
				expiresIn: env.JWT_ACCESS_EXPIRES_IN,
			} as SignOptions,
		},

		/**
		 * Refresh token configuration.
		 *
		 * @remarks
		 * Refresh tokens are:
		 * - Long-lived
		 * - Never used to access protected resources directly
		 * - Used only to issue new access tokens
		 */
		refresh: {
			/**
			 * Secret key used to sign and verify refresh tokens.
			 *
			 * @security
			 * Must be DIFFERENT from the access token secret
			 * to reduce blast radius in case of compromise.
			 */
			secret: env.JWT_REFRESH_SECRET,

			/**
			 * Base signing options for refresh tokens.
			 *
			 * @remarks
			 * The expiration (`expiresIn`) is intentionally NOT
			 * defined here because it is decided at runtime
			 * based on whether "Remember Me" is enabled.
			 */
			signOptions: {
				...baseJwtOptions,
				// refresh TTL is decided dynamically at sign time
			} as SignOptions,
		},

		/**
		 * Exposes shared JWT base options.
		 *
		 * @remarks
		 * Used during verification to enforce issuer and audience
		 * consistency across all token types.
		 */
		base: baseJwtOptions,
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
	skipCsrfProtection: (req: Request): boolean => {
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

/**
 * Base cookie options shared across all authentication cookies.
 *
 * @remarks
 * These options enforce core security guarantees:
 *
 * - `httpOnly` prevents JavaScript access (XSS protection)
 * - `secure` ensures cookies are sent only over HTTPS in production
 * - `sameSite` mitigates CSRF attacks
 * - `path` scopes cookies to the entire application
 *
 * Any auth-related cookie should extend from this object
 * rather than redefining these flags.
 */
const baseCookieOptions: CookieOptions = {
	/**
	 * Prevents access via `document.cookie`.
	 * This is critical for protecting tokens from XSS attacks.
	 */
	httpOnly: true,

	/**
	 * Ensures cookies are only sent over HTTPS in production.
	 *
	 * @remarks
	 * In local development, this is disabled to allow HTTP.
	 */
	secure: serverConfig.isProduction,

	/**
	 * Controls cross-site cookie behavior.
	 *
	 * @remarks
	 * - `strict` in production for maximum CSRF protection
	 * - `lax` in development to allow OAuth redirects and local testing
	 */
	sameSite: serverConfig.isProduction ? 'strict' : 'lax',

	/**
	 * Cookie is available to the entire application.
	 */
	path: '/',
};

/**
 * Cookie options for access token cookies.
 *
 * @remarks
 * Access token cookies are:
 * - Short-lived
 * - Sent with every authenticated request
 * - Automatically expired by the browser
 *
 * The `maxAge` must stay in sync with the access token JWT expiration.
 */
export const cookieOptions: CookieOptions = {
	...baseCookieOptions,

	/**
	 * Maximum lifetime of the access token cookie (in milliseconds).
	 *
	 * @remarks
	 * This value should closely match `JWT_ACCESS_EXPIRES_IN`
	 * to avoid having a valid cookie with an expired JWT.
	 */
	maxAge: env.JWT_ACCESS_MAX_AGE_MS, // 15 minutes
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
		base: baseCookieOptions,
	},
} as const;
