import dotenv from 'dotenv/config';

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
	origin: process.env.CORE_ORIGIN,
};

export const sessionConfig = {
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	cookie: {
		maxAge: 3600000,
		secure: false,
		httpOnly: true,
	},
};

export const cookieOptions = {
	expires: new Date(Date.now() + +process.env.COOKIE_EXPIRES_AT * 60 * 1000), // Access token expires in 15 minutes
	httpOnly: true,
	sameSite: 'Strict',
	secure: process.env.NODE_ENV === 'production',
};

export const cookieRefreshOptions = {
	expires: new Date(
		Date.now() +
			+process.env.COOKIE_REFRESH_EXPIRES_AT * 24 * 60 * 60 * 1000
	), // Refresh token expires in 7 days
	httpOnly: true,
	sameSite: 'Strict',
	secure: process.env.NODE_ENV === 'production',
};

export const bcryptConfig = {
	saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10),
};

export const nodemailerTransport = {
	host: process.env.NODEMAILER_HOST,
	port: process.env.NODEMAILER_PORT,
	auth: {
		user: process.env.NODEMAILER_USERNAME,
		pass: process.env.NODEMAILER_PASSWORD,
	},
};

export const ApiUrls = {
	users: process.env.API_URL_USERS,
	auth: process.env.API_URL_AUTH,
	resetPasswordUrl: process.env.API_URL_AUTH_RESET_PASSWORD,
	// suitcases: process.env.API_URL_SUITCASES,
	// bags: process.env.API_URL_BAGS,
	// items: process.env.API_URL_ITEMS,
	// transactions: process.env.API_URL_TRANSACTIONS,
};

export const googleAuthConfig = {
	clientID: process.env.GOOGLE_CLIENT_ID,
	clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	callbackURL: process.env.GOOGLE_CALLBACK_URL,
	passReqToCallback: true,
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
