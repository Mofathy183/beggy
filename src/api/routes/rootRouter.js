import express from 'express';
import authRoute from './authRouter.js';
import userRoute from './userRouter.js';
import accountRoute from './accountRouter.js';
import itemsRoute from './itemsRouter.js';
import featuresRoute from './featuresRouter.js';
import bagsRoute from './bagsRouter.js';
import suitcaseRoute from './suitcaseRouter.js';

const rootRoute = express.Router();

rootRoute.use('/users', userRoute);

rootRoute.use('/auth', authRoute);
rootRoute.use('/auth', accountRoute);

rootRoute.use('/items', itemsRoute);

rootRoute.use('/bags', bagsRoute);

rootRoute.use('/suitcases', suitcaseRoute);

rootRoute.use('/features', featuresRoute);

export default rootRoute;
