import express from 'express';
import authRoute from './authRoute.js';
import userRoute from './userRoute.js';
import accountRoute from './accountRoute.js';
import itemsRoute from './itemsRoute.js';
import featuresRoute from './featuresRoute.js';
import bagsRoute from './bagsRoute.js';
import suitcaseRoute from './suitcaseRoute.js';
import bagItemsRoute from './bagItemsRoute.js';
import suitcaseItemsRoute from './suitcaseItemsRoute.js';
import publicRoute from './publicRoute.js';
import privateRoute from './privateRoute.js';

const rootRoute = express.Router();

rootRoute.use('/users', userRoute);

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
