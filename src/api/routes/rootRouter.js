import express from 'express';
import authRoute from './authRouter.js';
import userRoute from './userRouter.js';
import accountRouter from './accountRouter.js';
import itemsRoute from './itemsRouter.js';
import featuresRoute from './featuresRouter.js';

const rootRoute = express.Router();

rootRoute.use('/users', userRoute);

rootRoute.use('/auth', authRoute);
rootRoute.use('/auth', accountRouter);

rootRoute.use('/items', itemsRoute);

rootRoute.use("/features", featuresRoute);

export default rootRoute;
