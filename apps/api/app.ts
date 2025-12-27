import express, { Express } from 'express';
import session from 'express-session';
import flash from 'express-flash';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import { xss } from 'express-xss-sanitizer';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './src/middlewares/appMiddleware.js';
import { sessionConfig } from './src/config/env.js';
import {
	limiter,
	loggerMiddleware,
	pinoHttpLogger,
	corsMiddleware,
	routeErrorHandler,
	AppResponse,
	csrfMiddleware,
} from './src/middlewares/appMiddleware.js';
import rootRoute from './src/api/routes/rootRoute.js';
import passport from './src/config/passport.js';

const app: Express = express();

// ============================================
//* SECURITY MIDDLEWARE (FIRST - PROTECT IMMEDIATELY)
// ============================================

// 1. Helmet - Set security HTTP headers FIRST
app.use(helmet());

// 2. XSS Protection - Clean user input from XSS attacks
app.use(xss());

// 3. Rate limiting - Protect against brute force/DDoS (apply early)
app.use(limiter);

// 4. CORS - Control which origins can access your API
app.use(corsMiddleware);

// ============================================
//* REQUEST PARSING MIDDLEWARE
// ============================================

// 5. JSON body parser with size limit (10kb)
app.use(express.json({ limit: '10kb' }));

// 6. URL-encoded body parser for form data
app.use(express.urlencoded({ extended: true }));

// 7. Cookie parser - Required for sessions, CSRF, auth tokens
app.use(cookieParser());

// ============================================
//* AUTHENTICATION & SESSION MIDDLEWARE
// ============================================

// 8. Session configuration (must come before Passport)
app.use(session(sessionConfig));

// 9. Flash messages (depends on sessions)
app.use(flash());

// 10. Passport authentication initialization
app.use(passport.initialize());
app.use(passport.session());

// 11. CSRF protection (requires sessions to be set up)
app.use(csrfMiddleware);

// ============================================
//* LOGGING & MONITORING MIDDLEWARE
// ============================================

// 12. Morgan HTTP request logger (development friendly)
app.use(morgan('dev'));

// 13. Pino HTTP logger (structured JSON logging for production)
app.use(pinoHttpLogger);

// 14. Custom request logger middleware
app.use(loggerMiddleware);

// ============================================
//* APPLICATION ROUTES
// ============================================

// 15. Main API routes
app.use('/api/beggy', rootRoute);

// 16. API Documentation (Swagger UI)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ============================================
//* ERROR HANDLING MIDDLEWARE (SPECIFIC ORDER!)
// ============================================

// 17. 404 Handler - MUST be AFTER all routes, BEFORE errorHandler
// Catches any undefined routes and converts to proper error
app.all('/{*splat}', RouteNotFoundHandler);

// 18. Global Error Handler - MUST BE ABSOLUTELY LAST
// Catches ALL errors from previous middleware and routes
app.use(errorHandler);

export default app;
