import express, { Express } from 'express';
// import session from 'express-session';
import flash from 'express-flash';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { xss } from 'express-xss-sanitizer';
import swaggerUi from 'swagger-ui-express';

import { rootRouter } from "@route"
// import { sessionConfig } from '@config';
import {
	limiter,
	swaggerSpec,
	pinoHttpLogger,
	corsMiddleware,
	routeNotFoundHandler,
	errorHandler,
	doubleCsrfProtection,
	injectCsrfToken,
} from '@shared/middlewares';

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
// app.use(session(sessionConfig));

// 9. Flash messages (depends on sessions)
app.use(flash());

// 10. Passport authentication initialization
// app.use(passport.initialize());
// app.use(passport.session());

// ============================================
//* LOGGING & MONITORING MIDDLEWARE
// ============================================

// 11. Pino HTTP logger (structured JSON logging for production)
app.use(pinoHttpLogger);

//=====================================================
// * API DOCS (NO CSRF)
//=====================================================

// 12. API Documentation (Swagger UI)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// =====================================================
//* CSRF (AFTER SESSIONS, BEFORE ROUTES)
// =====================================================

// 13. Sets CSRF cookie
app.use(injectCsrfToken);

// 14. CSRF protection (requires sessions to be set up) Validates CSRF token (for unsafe methods only)
app.use(doubleCsrfProtection);

// ============================================
//* APPLICATION ROUTES
// ============================================

// 15. Main API routes
app.use('/api/beggy', rootRouter);

// ============================================
//* ERROR HANDLING MIDDLEWARE (SPECIFIC ORDER!)
// ============================================

// 16. 404 Handler - MUST be AFTER all routes, BEFORE errorHandler
// Catches any undefined routes and converts to proper error
app.all('/{*splat}', routeNotFoundHandler);

// 17. Global Error Handler - MUST BE ABSOLUTELY LAST
// Catches ALL errors from previous middleware and routes
app.use(errorHandler);

export default app;
