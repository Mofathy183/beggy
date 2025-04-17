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
 * @returns {Promise<void|ErrorHandler>} A promise that resolves to void if the
 * operation is successful, or an ErrorHandler if an error occurs.
 */
const deleteResetTokenAndExpiration = async (email) => {
	try {
		await prisma.user.update({
			where: { email },
			data: {
				passwordResetToken: null,
				passwordResetExpiredAt: null,
                emailVerifyToken: null,
                emailTokenExpiresAt: null
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
 *
 * @returns {Promise<Object>} An object containing the email ID and any error that occurred during sending.
 * @throws {ErrorHandler} If an error occurs during email sending.
 */
export const sendEmail = async (
	url,
	userName,
	userEmail,
	templateName,
    subjectKey
) => {
	/**
	 * Try to send the email. If an error occurs, return an ErrorHandler.
	 */
	try {
		//* Read the email template from file
		const templatePath = join(
			__dirname,
			'..',
			'..',
			'templates',
			`${templateName}.mjml`
		);
		const templateContent = await readFile(templatePath, 'utf-8');

		//* Compile the email template
		const compileTemplate = Handlebars.compile(templateContent);

		//* Replace placeholders in the email template with real values
		const mjmlData = compileTemplate({
			url,
			userName,
		});

        //* get subject from config
        const subject = resendConfig[subjectKey];

		//* Convert the MJML to HTML
		const { html } = mjml2html(mjmlData);

		//* Send the email using the Resend API
		const resend = new Resend(resendConfig.apiKey);
		const sended = await resend.emails.send({
			from: resendConfig.testDomain,
			to: userEmail,
            subject: subject,
			html: html,
		});

        if (sended.error) 
            deleteResetTokenAndExpiration(userEmail);

        return sended
	} catch (error) {
		//* If an error occurs, return an ErrorHandler
		return new ErrorHandler(
			'catch error',
			error,
			'Failed to send email to user'
		);
	}
};
