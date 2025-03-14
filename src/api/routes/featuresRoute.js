import express from 'express';
import {
	autoFillItemFields,
	autoFillBagFields,
	autoFillSuitcaseFields,
	location,
	weather,
} from '../controllers/featuresController.js';
import {
	VReqToHeaderToken,
	headersMiddleware,
} from '../../middlewares/authMiddleware.js';
import {
	VReqToItemAutoFilling,
	VReqToBagAutoFilling,
	VReqToSuitcaseAutoFilling,
	VReqTolocationPermission,
} from '../../middlewares/validateRequest.js';
import {
	locationPermissionMiddleware,
	userIpMiddleware,
} from '../../middlewares/middlewares.js';

const featureRoute = express.Router();

//* route for AI Auto-fill Item => POST (name, quantity, category)
featureRoute.post(
	'/ai/auto-fill/item',
	VReqToHeaderToken,
	headersMiddleware,
	VReqToItemAutoFilling,
	autoFillItemFields
);

//* route for AI Auto-Fill Bag => POST (name, type, size) optional (material, feature)
featureRoute.post(
	'/ai/auto-fill/bag',
	VReqToHeaderToken,
	headersMiddleware,
	VReqToBagAutoFilling,
	autoFillBagFields
);

//* route for AI Auto-Fill Suitcase => POST (name, type, size) optional (material, feature, brand, wheels)
featureRoute.post(
	'/ai/auto-fill/suitcase',
	VReqToHeaderToken,
	headersMiddleware,
	VReqToSuitcaseAutoFilling,
	autoFillSuitcaseFields
);

//* route for get user location by his ip address => GET (send permission in body)
featureRoute.post(
	'/location',
	VReqToHeaderToken,
	headersMiddleware,
	VReqTolocationPermission,
	locationPermissionMiddleware,
	userIpMiddleware,
	location
);

//* route for get weather data by use user city and country => GET
featureRoute.get('/weather', VReqToHeaderToken, headersMiddleware, weather);

export default featureRoute;
