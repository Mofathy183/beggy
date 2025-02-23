import Joi, { version } from 'joi';
import { Gender, ItemCategory } from '@prisma/client';
import { passwordRegExp, stringRegExp } from './authValidator.js';

export const productStringRegExp = /^[a-zA-Z\s-]*$/

//*######################################{JOI Check User Feildes}############################################

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

//*######################################{JOI Check User Feildes}############################################

//*######################################{JOI Check Items Feildes}############################################

export const itemsSchema = Joi.object({
	name: Joi.string().pattern(productStringRegExp).required(),
	category: Joi.string()
		.valid(...Object.values(ItemCategory))
		.uppercase()
		.required(),
	quantity: Joi.number().integer().required(),
	weight: Joi.number().precision(2).required(),
    volume: Joi.number().precision(2).required(),
	color: Joi.string().pattern(stringRegExp),
	isFragile: Joi.boolean(),
});


export const itemsModifySchema = Joi.object({
	name: Joi.string().pattern(productStringRegExp),
	category: Joi.string()
		.valid(...Object.values(ItemCategory))
		.uppercase(),
	quantity: Joi.number().integer(),
	weight: Joi.number().precision(2),
    volume: Joi.number().precision(2),
	color: Joi.string().pattern(stringRegExp),
	isFragile: Joi.boolean(),
});

export const itemsArraySchema = Joi.array().items(itemsSchema).min(1).max(5).required();

//*######################################{JOI Check Items Feildes}############################################


//*######################################{User Validators}############################################

export const uuidValidator = (uuid) => {
    const schema = Joi.string().uuid({ version: 'uuidv4' }).required();
    return schema.validate(uuid);
};

//*######################################{User Validators}############################################
