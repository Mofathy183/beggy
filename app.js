import express from 'express';
import session from 'express-session';
import flash from 'express-flash';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import { sessionConfig } from './src/config/env.js';
import { logger, croeMiddleware, errorMiddlewareHandler } from "./src/middlewares/appMiddleware.js";
import rootRoute from './src/api/routes/rootRouter.js';
import passport from 'passport';

const app = express();


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(croeMiddleware)
app.use(logger)


// Error handling middleware
app.use(errorMiddlewareHandler)

// Session middleware
app.use(session(sessionConfig))

// Flash middleware
app.use(flash())

// Paaport middleware
app.use(passport.initialize());
app.use(passport.session());


// Routes
app.use("/api/beggy", rootRoute)


// Serve static files from the public directory
app.use("/upload", express.static('public'));



export default app;