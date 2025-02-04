import express from 'express';
import authRoute from "./authRouter.js";
import userRoute from './userRouter.js';

const rootRoute = express.Router();

rootRoute.use("/users", userRoute);

rootRoute.use("/auth", authRoute);



export default rootRoute;