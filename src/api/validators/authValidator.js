import Joi from 'joi';
import { Gender } from '@prisma/client';

export const stringRegExp = /^[a-zA-Z\s]*$/;
export const passwordRegExp =
	/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!?#%*&]{8,20}$/;

//* Check the Feildes Of Sing-up form
export const singUpSchema = Joi.object({
	firstName: Joi.string()
		.pattern(stringRegExp)
		.message(
			"Please Enter your First Name\nAnd Don't add any special characters or numbers"
		)
		.required(),

	lastName: Joi.string()
		.pattern(stringRegExp)
		.message(
			"Please Enter your Last Name\nAnd Don't add any special characters or numbers"
		)
		.required(),

	email: Joi.string()
		.email({ tlds: { allow: false } })
		.message('Invalid email Format')
		.required(),

	password: Joi.string()
		.min(8)
		.pattern(new RegExp(passwordRegExp))
		.message(
			'Password Must Be Between 8 and 20 Characters Long And Include At Least One Uppercase Letter, One Lowercase Letter, One Digit, And One Special Character From Them [@$!%*?&]'
		)
		.required(),

	confirmPassword: Joi.ref('password'),
});

//* Check the Feildes Of login form
export const loginSchema = Joi.object({
	email: Joi.string()
		.email({ tlds: { allow: false } })
		.message('Invalid email Format')
		.required(),

	password: Joi.string()
		.min(8)
		.pattern(new RegExp(passwordRegExp))
		.message(
			'Password Must Be Between 8 and 20 Characters Long And Include At Least One Uppercase Letter, One Lowercase Letter, One Digit, And One Special Character From Them [@$!%*?&]'
		)
		.required(),
});

export const forgotPasswordScheme = Joi.object({
	email: Joi.string()
		.email({ tlds: { allow: false } })
		.message('Invalid email Format')
		.required(),
});

export const resetPasswordScheme = Joi.object({
	password: Joi.string()
		.min(8)
		.pattern(new RegExp(passwordRegExp))
		.message(
			'Password Must Be Between 8 and 20 Characters Long And Include At Least One Uppercase Letter, One Lowercase Letter, One Digit, And One Special Character From Them [@$!%*?&]'
		)
		.required(),

	confirmPassword: Joi.ref('password'),
});

export const updatePasswordScheme = Joi.object({
	currentPassword: Joi.string()
		.min(8)
		.pattern(new RegExp(passwordRegExp))
		.message(
			'Password Must Be Between 8 and 20 Characters Long And Include At Least One Uppercase Letter, One Lowercase Letter, One Digit, And One Special Character From Them [@$!%*?&]'
		)
		.required(),

	newPassword: Joi.string()
		.min(8)
		.pattern(new RegExp(passwordRegExp))
		.message(
			'Password Must Be Between 8 and 20 Characters Long And Include At Least One Uppercase Letter, One Lowercase Letter, One Digit, And One Special Character From Them [@$!%*?&]'
		)
		.required(),

	confirmPassword: Joi.ref('newPassword'),
});

export const updateUserDataSchema = Joi.object({
	firstName: Joi.string()
		.pattern(stringRegExp)
		.message(
			"Please Enter your First Name\nAnd Don't add any special characters or numbers"
		)
		.required(),

	lastName: Joi.string()
		.pattern(stringRegExp)
		.message(
			"Please Enter your Last Name\nAnd Don't add any special characters or numbers"
		)
		.required(),

	email: Joi.string()
		.email({ tlds: { allow: false } })
		.message('Invalid email Format'),

	birth: Joi.date().iso(),

	country: Joi.string()
		.pattern(stringRegExp)
		.message(
			"Please Enter your Country\nAnd Don't add any special characters or numbers"
		),

	gender: Joi.string()
		.valid(...Object.values(Gender))
		.uppercase(),

	profilePicture: Joi.string(),
});

export const confirmDeleteSchema = Joi.object({
	confirmDelete: Joi.boolean().required(),
});
