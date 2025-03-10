import Joi from 'joi';
import { BagFeature, BagType, Size, Material } from '@prisma/client';
import { productStringRegExp } from './itemValidator.js';

export const bagSchema = Joi.object({
	name: Joi.string()
		.pattern(productStringRegExp)
		.message(
			'must be a letter or - but not any special characters or numbers'
		)
		.required(),

	type: Joi.string()
		.valid(...Object.values(BagType))
		.uppercase()
		.required(),

	color: Joi.string()
		.pattern(productStringRegExp)
		.message('must be a letter but not any special characters or numbers'),

	size: Joi.string() //* for Bags and Suitcases Only
		.valid(...Object.values(Size))
		.uppercase()
		.required(),

	capacity: Joi.number().precision(2).required(),

	maxWeight: Joi.number().precision(2).required(),

	weight: Joi.number().precision(2).required(),

	material: Joi.string() //* for Bags and Suitcases Only
		.valid(...Object.values(Material))
		.uppercase(),

	features: Joi.array().items(
		Joi.string()
			.valid(...Object.values(BagFeature))
			.uppercase()
	),
});

export const bagModifySchema = Joi.object({
	name: Joi.string()
		.pattern(productStringRegExp)
		.message(
			'must be a letter or - but not any special characters or numbers'
		),

	type: Joi.string()
		.valid(...Object.values(BagType))
		.uppercase(),

	color: Joi.string()
		.pattern(productStringRegExp)
		.message('must be a letter but not any special characters or numbers'),

	size: Joi.string() //* for Bags and Suitcases Only
		.valid(...Object.values(Size))
		.uppercase(),

	capacity: Joi.number().precision(2),

	maxWeight: Joi.number().precision(2),

	weight: Joi.number().precision(2),

	material: Joi.string() //* for Bags and Suitcases Only
		.valid(...Object.values(Material))
		.uppercase(),

	features: Joi.array().items(
		Joi.string()
			.valid(...Object.values(BagFeature))
			.uppercase()
	),

	removeFeatures: Joi.array().items(
		Joi.string()
			.valid(...Object.values(BagFeature))
			.uppercase()
	),
});
