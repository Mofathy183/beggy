import type { AuthProvider } from '@prisma-generated/enums';

/**
 * OAuthProfile
 *
 * Normalized OAuth profile shape passed from Passport strategies
 * to the AuthService. Provider-agnostic — the service handles DB logic.
 */
export type OAuthProfile = {
	providerId: string;
	provider: AuthProvider;
	email: string | null;
	firstName: string | null;
	lastName: string | null;
	avatarUrl: string | null;
};
