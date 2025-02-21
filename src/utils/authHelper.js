//*=============================={Reset Password}============================
import crypto from 'crypto';

//* generate random fake password
export const generateFakePassword = () => {
	const fakePassword = crypto.randomBytes(32).toString('hex');

	const hashPassword = crypto
		.createHash('sha256')
		.update(fakePassword)
		.digest('hex');

	return hashPassword;
};

export const generateCryptoToken = (token) => {
	return crypto.createHash('sha256').update(token).digest('hex');
};

//* generate random reset token for forgot password
export const generateResetToken = () => {
	//* the reset token will send to the user via email
	const resetToken = crypto.randomBytes(32).toString('hex');

	//* this hash token will add to the database
	const hashResetToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');

	return { hashResetToken: hashResetToken, resetToken: resetToken };
};

//* delete the resetToken and resetExpired from the database
//* using the email to find the user and delete the reset token and resetExpired
import { UserModel } from '../../prisma/prisma.js';
const deletePasswordTokenAndExpire = async (email) => {
	try {
		await UserModel.update({
			where: { email: email },
			data: {
				passwordResetExpiredAt: null,
				passwordResetToken: null,
			},
		});
		return;
	} catch (error) {
		//* if failed to delete the resetToken and resetExpired from the database
		//* send a response to the user with an error message
		return new ErrorHandler(
			'catch error',
			error,
			'Failed to delete resetToken and resetExpired'
		);
	}
};

//*====================================={Email with NodeMailer}=====================================
import nodemailer from 'nodemailer';
import { nodemailerTransport } from '../config/env.js';
import { ErrorHandler } from './error.js';

export const sendEmail = async (options) => {
	try {
		//* create a transport
		const transporter = nodemailer.createTransport(nodemailerTransport);

		//* defind the email options
		const mailOptions = {
			from: 'Mohamed Fathy <beggy@travel.io>',
			to: options.to,
			subject: options.subject,
			text: options.message,
		};

		//* send the email
		return await transporter.sendMail(mailOptions);
	} catch (error) {
		//* if failed to send email to user to reset password
		//* delete the resetToken and resetExpired from the database
		//* and send a response to the user with an error message
		deletePasswordTokenAndExpire(options.to);

		return new ErrorHandler(
			'catch error',
			'sendMail failed',
			'Failed to send email to user'
		);
	}
};

//*=============================={SEND COOKIE}==============================
import { cookieOptions, cookieRefreshOptions } from '../config/env.js';
import { signToken, signRefreshToken } from './jwt.js';

export const sendCookies = (userId, res) => {
	const token = signToken(userId);

	const refreshToken = signRefreshToken(userId);

	res.cookie('jwt-token', token, cookieOptions);
	res.cookie('jwt-refresh-token', refreshToken, cookieRefreshOptions);

	return;
};

export const sendProvidCookies = (accessToken, userId, provider, res) => {
	res.cookie(`${provider}-access-token`, accessToken, cookieOptions);

	const refreshToken = signRefreshToken(userId);

	res.cookie(`${provider}-refresh-token`, refreshToken, cookieRefreshOptions);
	return;
};

//*=============================={STORE SESSION}==============================
export const storeSession = (userId, userRole, req) => {
	req.session.userId = userId;
	req.session.userRole = userRole;

	return;
};
