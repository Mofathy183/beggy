import express from 'express';
import session from 'express-session';
import flash from 'express-flash';
import morgan from 'morgan';
import helmet from 'helmet';
import expressSanitizer from 'express-sanitizer';
import { sessionConfig } from './src/config/env.js';
import {
	limter,
	croeMiddleware,
	errorMiddlewareHandler,
	routeErrorHandler,
	AppResponse,
} from './src/middlewares/appMiddleware.js';
import rootRoute from './src/api/routes/rootRouter.js';
import passport from './src/config/passport.js';

const app = express();

app.use(express.json({ limit: '10kb' }));

// Body parser for express to read data from body into req.body
app.use(express.urlencoded({ extended: true }));

// Data Santitization against XSS
app.use(expressSanitizer());

// Middleware

// security middle
app.use(helmet());

// Serve static files from the public directory
app.use(express.static('public'));

// Logger middleware (morgan) to log requests to the console.
app.use(morgan('dev'));

// CORS middleware (Cross-Origin Resource Sharing) to allow requests from different origins.
app.use(croeMiddleware);

// Rate limiting middleware (express-rate-limit) to limit the number of requests from the same IP address.
app.use(limter);

// Error handling middleware
app.use(errorMiddlewareHandler);

// Session middleware
app.use(session(sessionConfig));

// Flash middleware
app.use(flash());

// Paaport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/beggy', rootRoute);

// Handler undfined Routes
app.all('*', routeErrorHandler);

// Serve static files from the public directory
app.use('/upload', express.static('public'));

//* Handle Response from classes ErrorResponse and SuccessResponse
app.use(AppResponse);

export default app;

//http://localhost:3000/api/beggy/auth/reset-password/7621c73309c96dcae21f9c61251436b71d29aa5ae18b0f3fd553d5cffdaaba4c
