import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import type { Request } from 'express';
import type {
	StrategyOptionsWithRequest as GoogleStrategyOptions,
	Profile as GoogleProfile,
	Strategy as GoogleStrategyType,
	GoogleCallbackParameters,
	VerifyCallback,
} from 'passport-google-oauth20';
import { oauthConfig } from '@config';
import type { OAuthProfile } from '@shared/types';
import { AuthProvider } from '@prisma-generated/enums';

/**
 * GoogleOAuthStrategy
 *
 * Extracts a normalized OAuthProfile from the raw Google profile.
 * No DB calls here — the service layer handles upsert logic.
 *
 * Data available from Google:
 * - profile.id              → unique Google provider ID
 * - profile.provider        → "google"
 * - profile.name.givenName  → first name
 * - profile.name.familyName → last name
 * - profile.emails[0].value → email address
 * - profile.emails[0].verified → email verification status
 * - profile.photos[0].value → avatar URL
 */
export const googleStrategy: GoogleStrategyType = new GoogleStrategy(
	oauthConfig.google as GoogleStrategyOptions,
	(
		_req: Request,
		_accessToken: string,
		_refreshToken: string,
		_params: GoogleCallbackParameters,
		profile: GoogleProfile,
		done: VerifyCallback
	) => {
		const normalized: OAuthProfile = {
			providerId: profile.id,
			provider: AuthProvider.GOOGLE,
			email: profile.emails?.[0]?.value ?? null,
			firstName: profile.name?.givenName ?? null,
			lastName: profile.name?.familyName ?? null,
			avatarUrl: profile.photos?.[0]?.value ?? null,
		};

		return done(
			null,
			normalized as unknown as Parameters<VerifyCallback>[1]
		);
	}
);
