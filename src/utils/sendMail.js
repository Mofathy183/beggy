import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises'; // or 'fs-extra'
import Handlebars from 'handlebars';
import mjml2html from 'mjml';
import { Resend } from 'resend';
import { resendConfig } from '../config/env.js'; // assuming this is where it's stored
import { ErrorHandler } from '../utils/error.js';
import prisma from '../../prisma/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//*=============================={Reset Password}============================

/**
 * @description Removes the password reset token and expiration date from the database
 * for a specified user, identified by their email. This is done after the user
 * successfully resets their password.
 * @param {string} email - The email of the user
 * @param {string} type - the type of the token "email_verification", "password_reset" or "change_email"
 * @returns {Promise<void|ErrorHandler>} A promise that resolves to void if the
 * operation is successful, or an ErrorHandler if an error occurs.
 */
const deleteResetTokenAndExpiration = async (email, type) => {
	try {
		const userId = await prisma.user.findUnique({
			where: { email },
			select: { id: true },
		});

		prisma.userToken.deleteMany({
			where: {
				userId: userId.id,
				type: type.toUpperCase(),
			},
		});
	} catch (error) {
		return new ErrorHandler(
			'Delete Token Error',
			error,
			'Failed to delete reset token and expiration date'
		);
	}
};

//*====================================={Email with Resend}=====================================
/**
 * Sends an email to a user using the Resend API.
 * @async
 * @param {string} url - The URL to include in the email template.
 * @param {string} userName - The user's name to include in the email template.
 * @param {string} userEmail - The email address to send the email to.
 * @param {string} templateName - The name of the email template to use (without the .mjml extension).
 * @param {string} subjectKey - The key to use to retrieve the email subject from the resendConfig.
 * @param {string} type - if the send email Failed, it will delete the reset token and expiration date by its type
 * type must be "email_verification", "password_reset" or "change_email"
 *
 * @returns {Promise<Object>} An object containing the email ID and any error that occurred during sending.
 * @throws {ErrorHandler} If an error occurs during email sending.
 */
export const sendEmail = async (
	url,
	userName,
	userEmail,
	templateName,
	subjectKey,
	type
) => {
	try {
		// Read and compile the email template
		const templatePath = join(
			__dirname,
			'..',
			'..',
			'templates',
			`${templateName}.mjml`
		);
		const templateContent = await readFile(templatePath, 'utf-8');
		const compileTemplate = Handlebars.compile(templateContent);

		const mjmlData = compileTemplate({
			url,
			userName,
			currentYear: new Date().getFullYear(),
		});

		const subject = resendConfig[subjectKey];
		if (!subject) {
			throw new Error('Subject key not found in the config');
		}

		const { html } = mjml2html(mjmlData);
		const resend = new Resend(resendConfig.apiKey);

		const sended = await resend.emails.send({
			from: resendConfig.testDomain,
			to: userEmail,
			subject,
			html,
		});

		if (sended.error) {
			// Delete token if Resend API returns an error
			await deleteResetTokenAndExpiration(userEmail, type);
			throw new Error('Failed to send email, reset token deleted.');
		}

		return sended;
	} catch (error) {
		// Delete token if any error occurs
		try {
			await deleteResetTokenAndExpiration(userEmail, type);
		} catch (deleteErr) {
			console.error('Failed to delete token in catch:', deleteErr);
		}

		// Return wrapped error
		return new ErrorHandler(
			'catch error',
			error,
			'Failed to send email to user'
		);
	}
};
