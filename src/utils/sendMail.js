import mjml2html from 'mjml';
import Handlebars from 'handlebars';
import { Resend } from 'resend';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { readFile } from 'fs/promises';
import prisma from '../../prisma/prisma.js';
import { resendConfig } from '../config/env.js';
import { ErrorHandler } from './error.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//*====================================={Email with NodeMailer}=====================================
// export const sendEmail = async (options) => {
// 	try {
// 		//* create a transport
// 		const transporter = nodemailer.createTransport(nodemailerTransport);

// 		//* defend the email options
// 		const mailOptions = {
// 			from: 'Mohamed Fathy <beggy@travel.io>',
// 			to: options.to,
// 			subject: options.subject,
// 			text: options.message,
// 		};

// 		//* send the email
// 		return await transporter.sendMail(mailOptions);
// 	} catch (error) {
// 		//* if failed to send email to user to reset password
// 		//* delete the resetToken and resetExpired from the database
// 		//* and send a response to the user with an error message
// 		deletePasswordTokenAndExpire(options.to);

// 		return new ErrorHandler(
// 			'catch error',
// 			'sendMail failed',
// 			'Failed to send email to user'
// 		);
// 	}
// };

//*====================================={Email with MailerSend}=====================================

export const sendEmail = async (
	url,
	userName,
	userEmail,
	templateName,
	subjectKey
) => {
	try {
		const templatePath = join(
			__dirname,
			'..',
			'..',
			'templates',
			`${templateName}.mjml`
		);
		const templateContent = await readFile(templatePath, 'utf-8');
		const subject = resendConfig[subjectKey];

		const compileTemplate = Handlebars.compile(templateContent);

		const mjmlData = compileTemplate({
			url,
			userName,
			subject,
		});

		const { html } = mjml2html(mjmlData);

		const resend = new Resend(resendConfig.apiKey);

		return resend.emails.send({
			from: resendConfig.testDomain,
			to: userEmail,
			subject: subject,
			html: html,
		});
	} catch (error) {
		return new ErrorHandler(
			'catch error',
			error,
			'Failed to send email to user'
		);
	}
};
// console.log(await sendEmail("https://google.com", "Mohamed Fathy", "mofathy1833@gmail.com", "reset-password", "reset"));

//*=============================={Reset Password}============================

//* delete the resetToken and resetExpired from the database
//* using the email to find the user and delete the reset token and resetExpired
const deletePasswordTokenAndExpire = async (email) => {
	try {
		await prisma.user.update({
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
