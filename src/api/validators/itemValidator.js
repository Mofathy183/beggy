import Joi from 'joi';
import { ItemCategory } from '@prisma/client';
import { stringRegExp } from './authValidator.js';

export const productStringRegExp = /^(?=.*[a-zA-Z])(?!^\d+$)[a-zA-Z0-9\s-]+$/;

//*######################################{JOI Check Items Felids}############################################

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

export const itemSchemaForItemId = Joi.object({
	itemId: Joi.string().uuid().required(),
});

export const itemSchemaForItemsIds = Joi.object({
	itemsIds: Joi.array()
		.min(1)
		.max(5)
		.items(
			Joi.object({
				itemId: Joi.string().uuid().required(),
			})
		)
		.required(),
});

export const itemSchemaForItemsIdsForDelete = Joi.object({
	itemsIds: Joi.array()
		.min(1)
		.max(6)
		.items(Joi.string().uuid().required())
		.required(),

	confirmDelete: Joi.boolean().required(),
});

//*######################################{JOI Check Items Felids}############################################
