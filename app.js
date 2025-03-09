import express from 'express';
import session from 'express-session';
import flash from 'express-flash';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import expressSanitizer from 'express-sanitizer';
import { sessionConfig } from './src/config/env.js';
import {
	limter,
	corsMiddleware,
	routeErrorHandler,
	csrfProtection,
	AppResponse,
    csrfMiddleware,
} from './src/middlewares/appMiddleware.js';
import rootRoute from './src/api/routes/rootRouter.js';
import passport from './src/config/passport.js';

const app = express();

app.use(express.json({ limit: '10kb' }));

// Body parser for express to read data from body into req.body
app.use(express.urlencoded({ extended: true }));

// Required to parse CSRF token from cookies
app.use(cookieParser());


// Middleware

// Enable CSRF protection with cookies
app.use(csrfProtection);

// CSRF Error middleware
app.use(csrfMiddleware)

// security middle
app.use(helmet());

// Logger middleware (morgan) to log requests to the console.
app.use(morgan('dev'));

// CORS middleware (Cross-Origin Resource Sharing) to allow requests from different origins.
app.use(corsMiddleware);

// Rate limiting middleware (express-rate-limit) to limit the number of requests from the same IP address.
app.use(limter);

// Data Santitization against XSS
app.use(expressSanitizer());

// Session middleware
app.use(session(sessionConfig));

// Flash middleware
app.use(flash());

// Paaport middleware
app.use(passport.initialize());
app.use(passport.session());


// Routes
app.use('/api/beggy', rootRoute);
app.post("/submit", (req, res) => {
    res.status(200).json({
        data: req.body.data,
        message: "Form submitted successfully!"
    })
})

// Handler undfined Routes
app.all('*', routeErrorHandler);


//* Handle Response from classes ErrorResponse and SuccessResponse
app.use(AppResponse);

// Serve static files from the public directory
app.use('/upload', express.static('public'));


export default app;

