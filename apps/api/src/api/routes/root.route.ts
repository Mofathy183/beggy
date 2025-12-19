import express from 'express';
import authRoute from './auth.route.js';
import adminRoute from './admin.route.js';
import accountRoute from './account.route.js';
import itemsRoute from './items.route.js';
import featuresRoute from './features.route.js';
import bagsRoute from './bags.route.js';
import suitcaseRoute from './suitcase.route.js';
import bagItemsRoute from './bag-items.route.js';
import suitcaseItemsRoute from './suitcase-items.route.js';
import publicRoute from './public.route.js';
import privateRoute from './private.route.js';

const rootRoute = express.Router();

rootRoute.use('/admin', adminRoute);

rootRoute.use('/auth', authRoute);

rootRoute.use('/auth', accountRoute);

rootRoute.use('/items', itemsRoute);

rootRoute.use('/bags', bagsRoute);

rootRoute.use('/bag-items', bagItemsRoute);

rootRoute.use('/suitcase-items', suitcaseItemsRoute);

rootRoute.use('/suitcases', suitcaseRoute);

rootRoute.use('/features', featuresRoute);

rootRoute.use('/public', publicRoute);

rootRoute.use('/private', privateRoute);

export default rootRoute;
