import Joi from 'joi';
import validator from 'validator';
import { Gender, ItemCategory } from '@prisma/client';
import { passwordRegExp, stringRegExp } from './authValidator.js';

//*######################################{JOI Check Feildes}############################################

//* Check the Feildes for createing a new User for user model
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

	gender: Joi.string()
		.valid(...Object.values(Gender))
		.uppercase(),

	profilePicture: Joi.string(),
});

export const itemsSchema = Joi.object({
	name: Joi.string().pattern(stringRegExp).required(),
	category: Joi.string()
		.valid(...Object.values(ItemCategory))
		.uppercase()
		.required(),
	quantity: Joi.number().integer().required(),
	weight: Joi.number().precision(2).required(),
	color: Joi.string().pattern(stringRegExp),
	isFragile: Joi.boolean(),
});

//*######################################{JOI Check Feildes}############################################

//*######################################{User Validators}############################################

export const uuidValidator = (uuid) => {
	return validator.isUUID(uuid);
};

//*######################################{User Validators}############################################
