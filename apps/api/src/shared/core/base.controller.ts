import type { Request, Response } from 'express';
import type { SuccessMessages } from '@beggy/shared/constants';
import { ErrorCode } from '@beggy/shared/constants';
import { appErrorMap, apiResponseMap } from '@shared/utils';
import { STATUS_CODE } from '@shared/constants';
import type {
	AuthUser,
	OAuthProfile,
	PaginationPayload,
	OrderBy,
} from '@shared/types';
import type { PaginationMeta } from '@beggy/shared/types';
import type { Logger } from 'pino';
import { logger } from '@shared/middlewares';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * An Express Request narrowed to a verified authenticated user.
 *
 * @remarks
 * Only available after {@link BaseController.assertAuthenticated} has run.
 */
export type AuthenticatedRequest = Request & { user: AuthUser };

/**
 * Options passed to the BaseService constructor.
 *
 * @remarks
 * Separating options into a named object keeps subclass constructors
 * clean and makes the intent of each field explicit.
 */
interface BaseControllerOptions {
	/**
	 * The domain name used to scope log entries.
	 *
	 * @example 'bags' | 'items' | 'users' | 'profiles' | "dashboard"
	 */
	domain: string;

	/**
	 * The controller class name used to scope log entries.
	 *
	 * @example 'BagController' | 'ItemController' | 'ProfileController'
	 */
	controller: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// BASE CONTROLLER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Abstract base class shared by all HTTP controllers.
 *
 * @description
 * Centralizes five concerns that are otherwise copy-pasted
 * across every controller in the codebase:
 *
 * 1. **Scoped logging** — structured child logger injected once.
 * 2. **Auth guards** — `assertAuthenticated` and `assertOAuthProfile`.
 * 3. **Request extraction** — typed helpers for user, params, body, and list queries.
 * 4. **Response helpers** — thin wrappers around `apiResponseMap` for the most
 *    common response patterns (ok, created, noContent).
 * 5. **Runtime type guards** — private guards kept off the public surface.
 *
 * @remarks
 * - Subclasses must call `super(logger)` from their constructor.
 * - No business logic lives here — only transport infrastructure.
 * - The class is abstract to prevent direct instantiation.
 *
 * @example
 * ```typescript
 * export class BagController extends BaseController {
 *   constructor(private readonly bagService: BagService) {
 *     super(logger.child({ domain: 'bags', controller: 'BagController' }));
 *   }
 * }
 * ```
 */
export abstract class BaseController {
	/**
	 * Scoped logger for the specific domain + controller.
	 *
	 * @remarks
	 * Pre-configured with `domain` and `controller` bindings so every
	 * log entry is automatically tagged without repetition.
	 */
	protected readonly log: Logger;

	protected constructor(options: BaseControllerOptions) {
		this.log = logger.child({
			domain: options.domain,
			controller: options.controller,
		});
	}

	// ─────────────────────────────────────────────────────────────────────────
	// RUNTIME GUARDS (private — implementation detail)
	// ─────────────────────────────────────────────────────────────────────────

	private isAuthUser(user: unknown): user is AuthUser {
		return !!user && typeof user === 'object' && 'id' in user;
	}

	private isOAuthProfile(user: unknown): user is OAuthProfile {
		return !!user && typeof user === 'object' && 'providerId' in user;
	}

	// ─────────────────────────────────────────────────────────────────────────
	// AUTH GUARDS
	// ─────────────────────────────────────────────────────────────────────────

	/**
	 * Asserts that the request carries a valid authenticated user.
	 *
	 * @description
	 * Acts as both a runtime check and a TypeScript assertion.
	 * After this call, `req.user` is narrowed to `AuthUser` — no optional
	 * chaining or casting needed downstream.
	 *
	 * @param req - Incoming Express request.
	 *
	 * @throws {AppError} UNAUTHORIZED
	 * If `req.user` is absent or does not conform to `AuthUser`.
	 *
	 * @example
	 * ```typescript
	 * this.assertAuthenticated(req);
	 * const userId = req.user.id; // safe — no optional chaining needed
	 * ```
	 */
	protected assertAuthenticated(
		req: Request
	): asserts req is AuthenticatedRequest {
		if (!this.isAuthUser(req.user)) {
			this.log.error(
				{ path: req.path },
				'Missing authenticated user context'
			);
			throw appErrorMap.unauthorized(ErrorCode.UNAUTHORIZED);
		}
	}

	/**
	 * Asserts that the request carries a valid OAuth profile.
	 *
	 * @description
	 * Used exclusively in OAuth callback routes where Passport populates
	 * `req.user` with a normalized provider profile rather than a JWT identity.
	 *
	 * @param req - Incoming Express request.
	 *
	 * @throws {AppError} UNAUTHORIZED
	 * If `req.user` is absent or does not conform to `OAuthProfile`.
	 */
	protected assertOAuthProfile(
		req: Request
	): asserts req is Request & { user: OAuthProfile } {
		if (!this.isOAuthProfile(req.user)) {
			this.log.error(
				{ path: req.path },
				'OAuth profile missing from request'
			);
			throw appErrorMap.unauthorized(ErrorCode.UNAUTHORIZED);
		}
	}

	// ─────────────────────────────────────────────────────────────────────────
	// REQUEST EXTRACTION HELPERS
	// ─────────────────────────────────────────────────────────────────────────

	/**
	 * Extracts the authenticated user ID from the request.
	 *
	 * @description
	 * Combines `assertAuthenticated` + `req.user.id` into a single call.
	 * Eliminates the two-line boilerplate that opens every authenticated
	 * handler method.
	 *
	 * @param req - Incoming Express request.
	 * @returns The authenticated user's ID string.
	 *
	 * @throws {AppError} UNAUTHORIZED — see {@link assertAuthenticated}.
	 *
	 * @example
	 * ```typescript
	 * // Before:
	 * this.assertAuthenticated(req);
	 * const userId = req.user.id;
	 *
	 * // After:
	 * const userId = this.getUserId(req);
	 * ```
	 */
	protected getUserId(req: Request): string {
		this.assertAuthenticated(req);
		return req.user.id;
	}

	/**
	 * Extracts a route parameter by name, stripped of its `as string` cast.
	 *
	 * @description
	 * `req.params` values are always strings at runtime, but Express types
	 * them as `string` already — this helper just makes the extraction
	 * explicit and self-documenting.
	 *
	 * @param req - Incoming Express request.
	//  * @param name - Name of the route parameter (e.g. `'id'`).
	 * @returns The parameter value as a string.
	 *
	 * @example
	 * ```typescript
	 * // Before:
	 * const { id } = req.params;
	 * await this.bagService.getBagById(userId, id as string);
	 *
	 * // After:
	 * const id = this.getParam(req, 'id');
	 * await this.bagService.getBagById(userId, id);
	 * ```
	 */
	protected getParam(req: Request): string {
		return req.params.id as string;
	}

	/**
	 * Returns the validated, normalized pagination payload from the request.
	 *
	 * @description
	 * Removes the `pagination as PaginationPayload` cast that appears in
	 * every list handler. Falls back gracefully for routes where pagination
	 * middleware was not applied.
	 *
	 * @param req - Incoming Express request.
	 * @returns The pagination payload, or `undefined` if not present.
	 *
	 * @example
	 * ```typescript
	 * // Before:
	 * const { bags, meta } = await this.bagService.listBags(
	 *   userId,
	 *   pagination as PaginationPayload,
	 *   ...
	 * );
	 *
	 * // After:
	 * const { bags, meta } = await this.bagService.listBags(
	 *   userId,
	 *   this.getPagination(req),
	 *   ...
	 * );
	 * ```
	 */
	protected getPagination(req: Request): PaginationPayload {
		return req.pagination as PaginationPayload;
	}

	/**
	 * Returns the validated order-by instruction from the request.
	 *
	 * @description
	 * Removes the `orderBy as XOrderByInput` cast that appears in every
	 * list handler. The cast is safe because the list-query middleware
	 * validates against the entity-specific schema before attaching it.
	 *
	 * @param req - Incoming Express request.
	 * @returns The order-by object, cast to the caller's expected type.
	 *
	 * @example
	 * ```typescript
	 * // Before:
	 * const { bags, meta } = await this.bagService.listBags(
	 *   userId, pagination, filter, orderBy as BagOrderByInput
	 * );
	 *
	 * // After:
	 * const { bags, meta } = await this.bagService.listBags(
	 *   userId, this.getPagination(req), filter, this.getOrderBy<BagOrderByInput>(req)
	 * );
	 * ```
	 */
	protected getOrderBy<T = OrderBy>(req: Request): T {
		return req.orderBy as T;
	}

	// ─────────────────────────────────────────────────────────────────────────
	// RESPONSE HELPERS
	// ─────────────────────────────────────────────────────────────────────────

	/**
	 * Sends a `200 OK` JSON response.
	 *
	 * @description
	 * Wraps `apiResponseMap.ok` + `res.status(200).json(...)` into a single
	 * call. Keeps handler methods focused on data retrieval, not response wiring.
	 *
	 * @param res - Express response object.
	 * @param data - Payload to include in the response body.
	 * @param msgKey - Key from `SuccessMessages` (e.g. `'BAGS_FETCHED'`).
	 * @param meta - Optional pagination metadata.
	 *
	 * @example
	 * ```typescript
	 * // Before:
	 * res.status(STATUS_CODE.OK).json(
	 *   apiResponseMap.ok<BagDTO[]>(data, 'BAGS_FETCHED', meta)
	 * );
	 *
	 * // After:
	 * this.ok(res, data, 'BAGS_FETCHED', meta);
	 * ```
	 */
	protected ok<T>(
		res: Response,
		data: T,
		msgKey: keyof typeof SuccessMessages,
		meta?: PaginationMeta
	): void {
		res.status(STATUS_CODE.OK).json(
			apiResponseMap.ok<T>(data, msgKey, meta)
		);
	}

	/**
	 * Sends a `201 Created` JSON response.
	 *
	 * @param res - Express response object.
	 * @param data - Newly created resource payload.
	 * @param msgKey - Key from `SuccessMessages` (e.g. `'BAG_CREATED'`).
	 *
	 * @example
	 * ```typescript
	 * // Before:
	 * res.status(STATUS_CODE.CREATED).json(
	 *   apiResponseMap.created<BagDTO>(BagMapper.toDTO(bag), 'BAG_CREATED')
	 * );
	 *
	 * // After:
	 * this.created(res, BagMapper.toDTO(bag), 'BAG_CREATED');
	 * ```
	 */
	protected created<T>(
		res: Response,
		data: T,
		msgKey: keyof typeof SuccessMessages
	): void {
		res.status(STATUS_CODE.CREATED).json(
			apiResponseMap.created<T>(data, msgKey)
		);
	}

	/**
	 * Sends a `204 No Content` response.
	 *
	 * @description
	 * Used for successful DELETE operations that return no payload.
	 *
	 * @param res - Express response object.
	 *
	 * @example
	 * ```typescript
	 * // Before:
	 * res.sendStatus(STATUS_CODE.NO_CONTENT);
	 *
	 * // After:
	 * this.noContent(res);
	 * ```
	 */
	protected noContent(res: Response): void {
		res.sendStatus(STATUS_CODE.NO_CONTENT);
	}
}
