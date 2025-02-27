import Joi from 'joi';
import { ItemCategory } from '@prisma/client';
import { stringRegExp } from './authValidator.js';

export const productStringRegExp = /^[a-zA-Z\s-]*$/;

export const itemShcemaMiddleware = Joi.object({
	category: Joi.string()
		.valid(...Object.values(ItemCategory))
		.uppercase(),

	isFragile: Joi.boolean(),

	name: Joi.string()
		.pattern(productStringRegExp)
		.message(
			'must be a letter or - but not any special characters or numbers'
		),

	color: Joi.string()
		.pattern(productStringRegExp)
		.message('must be a letter but not any special characters or numbers'),

	createdAt: Joi.date().iso(),
});

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

export const itemsArraySchema = Joi.array()
	.items(itemsSchema)
	.min(1)
	.max(5)
	.required();

//*######################################{JOI Check Items Feildes}############################################
