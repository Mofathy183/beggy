// src/config/passport.config.ts
import passport from 'passport';
import { googleStrategy, facebookStrategy } from '@modules/auth/strategies';

passport.use(googleStrategy);
passport.use(facebookStrategy);

/**
 * serialize/deserializeUser intentionally omitted.
 *
 * All OAuth callback routes use `session: false` in passport.authenticate().
 * Passport never writes req.user to the session, so these hooks are never called.
 * JWT cookies handle all session state after the OAuth handshake completes.
 */

export default passport;
