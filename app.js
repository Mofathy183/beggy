import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import { logger, croeMiddleware, errorMiddlewareHandler } from "./src/middlewares/appMiddleware.js";
import rootRoute from './src/api/routes/rootRouter.js';

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(croeMiddleware)
app.use(logger)


// Error handling middleware
app.use(errorMiddlewareHandler)



// Routes
app.use("/api/beggy", rootRoute)


// Serve static files from the public directory
app.use("/upload", express.static('public'));



export default app;