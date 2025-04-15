import express from 'express';
import session from 'express-session';
import flash from 'express-flash';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import expressSanitizer from 'express-sanitizer';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './src/middlewares/appMiddleware.js';
import { sessionConfig } from './src/config/env.js';
import {
	limiter,
	corsMiddleware,
	routeErrorHandler,
	AppResponse,
	csrfMiddleware,
} from './src/middlewares/appMiddleware.js';
import rootRoute from './src/api/routes/rootRoute.js';
import passport from './src/config/passport.js';

const app = express();

app.use(express.json({ limit: '10kb' }));

// Body parser for express to read data from body into req.body
app.use(express.urlencoded({ extended: true }));

// Required to parse CSRF token from cookies
app.use(cookieParser());

// Middleware

// security middle
app.use(helmet());

// Logger middleware (morgan) to log requests to the console.
app.use(morgan('dev'));

// CORS middleware (Cross-Origin Resource Sharing) to allow requests from different origins.
app.use(corsMiddleware);

// Rate limiting middleware (express-rate-limit) to limit the number of requests from the same IP address.
app.use(limiter);

// Data Sanitization against XSS
app.use(expressSanitizer());

// Session middleware
app.use(session(sessionConfig));

// Flash middleware
app.use(flash());

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// CSRF Error middleware
app.use(csrfMiddleware);

// Routes
app.use('/api/beggy', rootRoute);

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Handler undefined Routes
app.all('/{*splat}', routeErrorHandler);

//* Handle Response from classes ErrorResponse and SuccessResponse
app.use(AppResponse);

export default app;
