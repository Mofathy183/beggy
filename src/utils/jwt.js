import jwt from 'jsonwebtoken';
import { JWTConfig } from '../config/env.js';
import ErrorHandler from './error.js';

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

// function create() {
//     const token = verifyToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQ0ZDc2OGZkLTQ0NTctNDcwOC1hYzIzLWIzMTA5OTg3YTRmMiIsImlhdCI6MTczODg1MDU0OSwiZXhwIjoxNzQ2NjI2NTQ5fQ.Uwgdx8cBlecNi9WHpYmc5nviJywocrFDr8FR_gV5hTQ");
//     console.log(token);
// }

// create();
