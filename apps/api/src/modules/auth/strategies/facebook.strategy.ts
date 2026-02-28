import { Strategy as FacebookStrategy } from 'passport-facebook';
import type {
	Profile as FacebookProfile,
	StrategyOptions as FacebookStrategyOptions,
} from 'passport-facebook';
import { oauthConfig } from '@config';
import type { OAuthProfile } from '@shared/types';
import { AuthProvider } from '@prisma-generated/enums';

/**
 * FacebookOAuthStrategy
 *
 * Extracts a normalized OAuthProfile from the raw Facebook profile.
 * No DB calls here — the service layer handles upsert logic.
 *
 * Data available from Facebook (requires profileFields config):
 * - profile.id              → unique Facebook provider ID
 * - profile.provider        → "facebook"
 * - profile.name.givenName  → first name
 * - profile.name.familyName → last name
 * - profile.emails[0].value → email (requires 'email' in profileFields)
 * - profile._json.gender    → gender (requires 'gender' in profileFields)
 * - profile.photos[0].value → avatar URL (requires 'photos' in profileFields)
 *
 * Note: Facebook does NOT provide email verification status or birthdate
 * via the basic Graph API without additional permissions.
 */
export const facebookStrategy = new FacebookStrategy(
	{
		...oauthConfig.facebook,
		callbackURL: oauthConfig.facebook.callbackURL,
	} as FacebookStrategyOptions,
	(
		_accessToken: string,
		_refreshToken: string,
		profile: FacebookProfile,
		done: (error: unknown, user?: OAuthProfile) => void
	) => {
		const normalized: OAuthProfile = {
			providerId: profile.id,
			provider: AuthProvider.FACEBOOK,
			email: profile.emails?.[0]?.value ?? null,
			firstName: profile.name?.givenName ?? null,
			lastName: profile.name?.familyName ?? null,
			avatarUrl: profile.photos?.[0]?.value ?? null,
		};

		return done(null, normalized);
	}
);
