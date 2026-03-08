import type { PrismaClientType } from '@prisma';
import { type User, AuthProvider, type Role } from '@prisma-generated/client';
import type {
	SignUpPayload,
	LoginInput,
	Permissions,
} from '@beggy/shared/types';
import { ErrorCode, RolePermissions } from '@beggy/shared/constants';
import { appErrorMap, hashPassword, verifyPassword } from '@shared/utils';
import { logger } from '@shared/middlewares';
import type { OAuthProfile, AuthMe } from '@shared/types';

/**
 * AuthService
 *
 * Handles authentication-related business logic:
 * - User registration (LOCAL accounts)
 * - Credential verification (login)
 * - Authenticated user context resolution
 *
 * This service is framework-agnostic and contains no HTTP concerns.
 */
export class AuthService {
	/**
	 * Scoped logger for authentication domain events
	 */
	private readonly authLogger = logger.child({
		domain: 'auth',
		service: 'AuthService',
	});
	constructor(private readonly prisma: PrismaClientType) {}

	/**
	 * Registers a new user using email & password authentication.
	 *
	 * @remarks
	 * - Creates a LOCAL auth account with a hashed password
	 * - Creates an initial user profile
	 * - Persists multiple related records in a single operation
	 * - Email uniqueness is assumed to be validated at a higher layer
	 *
	 * @param user - Signup payload containing identity and profile data
	 * @returns The newly created User entity
	 */
	async signupUser(user: SignUpPayload): Promise<User> {
		const hashedPassword = await hashPassword(user.password);

		const newUser = await this.prisma.user.create({
			data: {
				email: user.email,
				account: {
					create: {
						authProvider: 'LOCAL',
						hashedPassword,
					},
				},
				profile: {
					create: {
						firstName: user.firstName,
						lastName: user.lastName,
						city: user.city,
						country: user.country,
						avatarUrl: user.avatarUrl,
						gender: user.gender,
						birthDate: user.birthDate,
					},
				},
			},
		});

		this.authLogger.info(
			{ userId: newUser.id },
			'User signed up successfully'
		);

		return newUser;
	}

	/**
	 * Authenticates a user using LOCAL credentials.
	 *
	 * @remarks
	 * - Validates email/password
	 * - Ensures the user is active
	 * - Rejects OAuth-only accounts (no password exists)
	 *
	 * @param input - Login credentials
	 * @throws INVALID_CREDENTIALS if authentication fails
	 * @throws USER_DISABLED if the account is inactive
	 *
	 * @returns Minimal identity required to establish a session
	 */
	async loginUser(input: LoginInput): Promise<{ id: string; role: Role }> {
		const user = await this.prisma.user.findUnique({
			where: { email: input.email },
			include: { account: true },
		});

		if (!user) {
			this.authLogger.warn(
				{ email: input.email },
				'Login failed: user not found'
			);
			throw appErrorMap.badRequest(ErrorCode.INVALID_CREDENTIALS);
		}

		if (!user.isActive) {
			this.authLogger.warn(
				{ userId: user.id },
				'Login blocked: user disabled'
			);
			throw appErrorMap.forbidden(ErrorCode.USER_DISABLED);
		}

		// Only LOCAL accounts are allowed to authenticate with passwords
		const localAccount = user.account.find(
			(a) => a.authProvider === AuthProvider.LOCAL
		);

		if (!localAccount || !localAccount.hashedPassword) {
			this.authLogger.warn(
				{ userId: user.id },
				'Login failed: no LOCAL auth provider'
			);
			throw appErrorMap.badRequest(ErrorCode.INVALID_CREDENTIALS);
		}

		const isValid = await verifyPassword(
			input.password,
			localAccount.hashedPassword
		);

		if (!isValid) {
			this.authLogger.warn(
				{ userId: user.id },
				'Login failed: invalid password'
			);
			throw appErrorMap.badRequest(ErrorCode.PASSWORDS_DO_NOT_MATCH);
		}

		this.authLogger.info(
			{ userId: user.id, role: user.role },
			'User logged in successfully'
		);

		return { id: user.id, role: user.role };
	}

	/**
	 * Resolves the authenticated user's identity and authorization context.
	 *
	 * @remarks
	 * - Used by `/auth/me`
	 * - Excludes sensitive authentication data (e.g. passwords)
	 * - Permissions are derived from role, not stored directly
	 * - Assumes the caller has already been authenticated
	 *
	 * @param userId - Authenticated user ID (from access token)
	 * @throws UNAUTHORIZED if the user does not exist
	 *
	 * @returns Authenticated user snapshot and effective permissions
	 */
	async authUser(
		userId: string
	): Promise<{ user: AuthMe; permissions: Permissions }> {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			include: {
				profile: true,
				account: { omit: { hashedPassword: true } },
			},
		});

		if (!user) {
			this.authLogger.warn(
				{ userId },
				'Auth context requested for non-existent user'
			);
			throw appErrorMap.unauthorized(ErrorCode.UNAUTHORIZED);
		}

		return {
			user,
			permissions: RolePermissions[user.role],
		};
	}

	/**
	 * Logs in or registers a user from an OAuth provider.
	 *
	 * @remarks
	 * Strategy (find-or-create):
	 * 1. Look up an existing Account by providerId + provider
	 * 2. If found → return the linked user (login)
	 * 3. If not found by account → check if email already exists
	 *    a. Email exists → link the new OAuth account to the existing user
	 *    b. Email not found → create a brand-new user + account + profile
	 *
	 * This approach handles:
	 * - First-time OAuth sign-in (new user)
	 * - Returning OAuth user (login)
	 * - Merging accounts when a LOCAL user signs in via OAuth with same email
	 *
	 * @param oauthProfile - Normalized profile from a Passport strategy
	 * @throws OAUTH_NO_EMAIL if the provider did not return an email
	 * @returns Minimal session identity { id, role }
	 */
	async oauthUser(
		oauthProfile: OAuthProfile
	): Promise<{ id: string; role: Role }> {
		const { providerId, provider, email, firstName, lastName, avatarUrl } =
			oauthProfile;

		// --- 1. Find existing OAuth account ---
		const existingAccount = await this.prisma.account.findFirst({
			where: { providerId, authProvider: provider },
			include: { user: true },
		});

		if (existingAccount) {
			this.authLogger.info(
				{ userId: existingAccount.user.id, provider },
				'OAuth login: returning user'
			);
			return {
				id: existingAccount.user.id,
				role: existingAccount.user.role,
			};
		}

		// --- 2. Guard: email is required to find or create a user ---
		if (!email) {
			this.authLogger.warn(
				{ provider, providerId },
				'OAuth login failed: no email returned from provider'
			);
			throw appErrorMap.badRequest(ErrorCode.OAUTH_EMAIL_CONFLICT);
		}

		// --- 3. Check if a user already exists with this email ---
		const existingUser = await this.prisma.user.findUnique({
			where: { email },
		});

		if (existingUser) {
			// Link the new OAuth provider to the existing user account
			await this.prisma.account.create({
				data: {
					userId: existingUser.id,
					authProvider: provider,
					providerId,
				},
			});

			this.authLogger.info(
				{ userId: existingUser.id, provider },
				'OAuth login: linked new provider to existing user'
			);

			return { id: existingUser.id, role: existingUser.role };
		}

		// --- 4. Create a brand-new user with OAuth account + profile ---
		const newUser = await this.prisma.user.create({
			data: {
				email,
				account: {
					create: {
						authProvider: provider,
						providerId,
					},
				},
				profile: {
					create: {
						firstName: firstName ?? '',
						lastName: lastName ?? '',
						avatarUrl,
					},
				},
			},
		});

		this.authLogger.info(
			{ userId: newUser.id, provider },
			'OAuth login: new user created'
		);

		return { id: newUser.id, role: newUser.role };
	}
}
