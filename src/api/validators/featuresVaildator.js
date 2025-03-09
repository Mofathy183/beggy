import Joi from "joi";
import { 
    ItemCategory,
    BagType,
    BagFeature,
    SuitcaseFeature,
    SuitcaseType,
    WheelType,
    Size,
    Material
} from "@prisma/client";
import { productStringRegExp } from "./itemValidator.js";

export const itemAutoFillingSchame = Joi.object({
    name: Joi.string().pattern(productStringRegExp).required(),

    category: Joi.string()
    .valid(...Object.values(ItemCategory))
    .uppercase()
    .required(),

    quantity: Joi.number().integer().required(),
});

export const bagAutoFillingSchame = Joi.object({
    name: Joi.string().pattern(productStringRegExp).required(), 

    type: Joi.string()
    .valid(...Object.values(BagType))
    .uppercase()
    .required(),

    size: Joi.string()
    .valid(...Object.values(Size))
    .uppercase()
    .required(),

    material: Joi.string()
    .valid(...Object.values(Material))
    .uppercase(),

    feature: Joi.string()
    .valid(...Object.values(BagFeature))
    .uppercase(),
});


export const suitcaseAutoFillingSchame = Joi.object({
    name: Joi.string().pattern(productStringRegExp).required(), 

    brand: Joi.string().pattern(productStringRegExp), 

    type: Joi.string()
    .valid(...Object.values(SuitcaseType))
    .uppercase()
    .required(),

    size: Joi.string()
    .valid(...Object.values(Size))
    .uppercase()
    .required(),

    material: Joi.string()
    .valid(...Object.values(Material))
    .uppercase(),

    feature: Joi.string()
    .valid(...Object.values(SuitcaseFeature))
    .uppercase(),

    wheels: Joi.string()
    .valid(...Object.values(WheelType))
    .uppercase(),
});

export const locationPermissionScheme = Joi.object({
    permission: Joi.string().valid("granted", "denied").required()
})
