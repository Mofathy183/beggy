import Joi from 'joi';
import type { PrismaClient } from '../generated/client/index.js';
import { passwordRegExp } from './auth.validator.js';
import { Gender, Role } from '@prisma/client';
import { stringRegExp } from './auth.validator.js';

export const userSchema = Joi.object({
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

	birth: Joi.date().iso(),

	country: Joi.string()
		.pattern(stringRegExp)
		.message(
			"Please Enter your Country\nAnd Don't add any special characters or numbers"
		),

	city: Joi.string()
		.pattern(stringRegExp)
		.message(
			"Please Enter your City\nAnd Don't add any special characters or numbers"
		),

	gender: Joi.string()
		.valid(...Object.values(Gender))
		.uppercase(),

	profilePicture: Joi.string(),
});

export const modifyUserSchema = Joi.object({
	firstName: Joi.string()
		.pattern(stringRegExp)
		.message(
			"Please Enter your First Name\nAnd Don't add any special characters or numbers"
		),

	lastName: Joi.string()
		.pattern(stringRegExp)
		.message(
			"Please Enter your Last Name\nAnd Don't add any special characters or numbers"
		),

	email: Joi.string()
		.email({ tlds: { allow: false } })
		.message('Invalid email Format'),

	password: Joi.string()
		.min(8)
		.pattern(new RegExp(passwordRegExp))
		.message(
			'Password Must Be Between 8 and 20 Characters Long And Include At Least One Uppercase Letter, One Lowercase Letter, One Digit, And One Special Character From Them [@$!%*?&]'
		),

	confirmPassword: Joi.ref('password'),

	birth: Joi.date().iso(),

	country: Joi.string()
		.pattern(stringRegExp)
		.message(
			"Please Enter your Country\nAnd Don't add any special characters or numbers"
		),

	city: Joi.string()
		.pattern(stringRegExp)
		.message(
			"Please Enter your City\nAnd Don't add any special characters or numbers"
		),

	gender: Joi.string()
		.valid(...Object.values(Gender))
		.uppercase(),

	profilePicture: Joi.string(),
});

export const roleSchema = Joi.object({
	role: Joi.string()
		.valid(...Object.values(Role))
		.uppercase(),
});

//*######################################{UUID Validators}############################################

export const uuidValidator = (uuid) => {
	const schema = Joi.string().uuid({ version: 'uuidv4' }).required();
	return schema.validate(uuid);
};

//*######################################{UUID Validators}############################################
