import jwt from 'jsonwebtoken';
import { JWTConfig } from '../config/env.js';
import { ErrorHandler } from './error.js';

export const signToken = (id) => {
	const token = jwt.sign({ id: id }, JWTConfig.secret, {
		expiresIn: JWTConfig.expiresIn,
	});

	return token;
};

export const verifyToken = (token) => {
	try {
		const verified = jwt.verify(token, JWTConfig.secret);
		return verified;
	} catch (error) {
		new ErrorHandler(
			'Invalid token Catch',
			error,
			'Failed to Verify token'
		);
		return false;
	}
};

export const signRefreshToken = (id) => {
	const refreshToken = jwt.sign({ id: id }, JWTConfig.refreshSecret, {
		expiresIn: JWTConfig.refreshExpiresIn,
	});

	return refreshToken;
};

export const verifyRefreshToken = (refreshToken) => {
	try {
		const verified = jwt.verify(refreshToken, JWTConfig.refreshSecret);
		return verified;
	} catch (error) {
		new ErrorHandler(
			'Invalid Refresh token Catch',
			error,
			'Failed to Verify refresh token'
		);
		return false;
	}
};

//* to generate Crypto Token for.
//* reset password to store hash token in DB and send the token via email
//* and for verify email to do the same
export const generateCryptoToken = (token) => {
	return crypto.createHash('sha256').update(token).digest('hex');
};

//* generate random reset token for forgot password
export const generateCryptoHashToken = () => {
	//* the reset token will send to the user via email
	const token = crypto.randomBytes(32).toString('hex');

	//* this hash token will add to the database
	const hashToken = crypto.createHash('sha256').update(token).digest('hex');

	return { hashToken: hashToken, token: token };
};
