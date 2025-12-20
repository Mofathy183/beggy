import Joi from 'joi';
import type { PrismaClient } from '../generated/client/index.js';
import {
	SuitcaseFeature,
	SuitcaseType,
	Size,
	Material,
	WheelType,
} from '@prisma/client';
import { productStringRegExp } from './item.validator.js';
import { stringRegExp } from '../auth/auth.validator.js';

export const suitcaseSchema = Joi.object({
	name: Joi.string()
		.pattern(productStringRegExp)
		.message(
			'must be a letter or - but not any special characters or numbers'
		)
		.required(),

	type: Joi.string()
		.valid(...Object.values(SuitcaseType))
		.uppercase()
		.required(),

	brand: Joi.string()
		.pattern(productStringRegExp)
		.message(
			'must be a letter or - but not any special characters or numbers'
		),

	color: Joi.string()
		.pattern(stringRegExp)
		.message(
			'must be a letter or - but not any special characters or numbers'
		),

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
			.valid(...Object.values(SuitcaseFeature))
			.uppercase()
	),

	wheels: Joi.string() //* for Suitcases Only
		.valid(...Object.values(WheelType))
		.uppercase(),
});

export const suitcaseModifySchema = Joi.object({
	name: Joi.string()
		.pattern(productStringRegExp)
		.message(
			'must be a letter or - but not any special characters or numbers'
		),

	type: Joi.string()
		.valid(...Object.values(SuitcaseType))
		.uppercase(),

	brand: Joi.string()
		.pattern(productStringRegExp)
		.message(
			'must be a letter or - but not any special characters or numbers'
		),

	color: Joi.string()
		.pattern(stringRegExp)
		.message(
			'must be a letter or - but not any special characters or numbers'
		),

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
			.valid(...Object.values(SuitcaseFeature))
			.uppercase()
	),

	removeFeatures: Joi.array().items(
		Joi.string()
			.valid(...Object.values(SuitcaseFeature))
			.uppercase()
	),

	wheels: Joi.string() //* for Suitcases Only
		.valid(...Object.values(WheelType))
		.uppercase(),
});
