import type { Logger } from 'pino';
import type { ErrorCode } from '@beggy/shared/constants';
import { appErrorMap } from '@shared/utils';
import { logger } from '@shared/middlewares';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Options passed to the BaseService constructor.
 *
 * @remarks
 * Separating options into a named object keeps subclass constructors
 * clean and makes the intent of each field explicit.
 */
interface BaseServiceOptions {
	/**
	 * The domain name used to scope log entries.
	 *
	 * @example 'bags' | 'items' | 'users' | 'profiles'
	 */
	domain: string;

	/**
	 * The service class name used to scope log entries.
	 *
	 * @example 'BagService' | 'ItemService' | 'ProfileService'
	 */
	service: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// BASE SERVICE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Abstract base class shared by all domain services.
 *
 * @description
 * Centralizes four concerns that are otherwise copy-pasted
 * across every service in the codebase:
 *
 * 1. **Prisma access** — typed client injected once, available everywhere.
 * 2. **Scoped logging** — `logger.child({ domain, service })` built once.
 * 3. **Patch utilities** — `stripNullish` strips undefined/null before updates.
 * 4. **Error utilities** — `throwNotFound`, `assertFound`, and friends
 *    standardize domain error throwing without repetition.
 *
 * @remarks
 * - Subclasses must call `super(prisma, { domain, service })`.
 * - No business logic lives here — only infrastructure.
 * - The class is abstract to prevent direct instantiation.
 *
 * @example
 * ```typescript
 * export class BagService extends BaseService {
 *   constructor(prisma: PrismaClientType) {
 *     super(prisma, { domain: 'bags', service: 'BagService' });
 *   }
 * }
 * ```
 */
export abstract class BaseService {
	/**
	 * Scoped logger for the specific domain + service.
	 *
	 * @remarks
	 * Pre-configured with `domain` and `service` bindings so every
	 * log entry is automatically tagged without repetition.
	 */
	protected readonly log: Logger;

	constructor(options: BaseServiceOptions) {
		this.log = logger.child({
			domain: options.domain,
			service: options.service,
		});
	}

	// ─────────────────────────────────────────────────────────────────────────
	// PATCH UTILITIES
	// ─────────────────────────────────────────────────────────────────────────

	/**
	 * Strips `undefined` and `null` values from a partial input object.
	 *
	 * @description
	 * Used before every Prisma `update` call to ensure only explicitly
	 * provided fields are written, preventing accidental overwrites
	 * of existing data with empty values.
	 *
	 * @remarks
	 * - Preserves `false` and `0` — only removes `undefined` and `null`.
	 * - Does not mutate the original object.
	 * - Safe to call on empty objects.
	 *
	 * @param input - Partial update payload from validated request body.
	 * @returns A new object with all nullish entries removed.
	 *
	 * @example
	 * ```typescript
	 * const data = this.stripNullish(input);
	 * await this.prisma.item.update({ where: { id }, data });
	 * ```
	 */
	protected stripNullish<T extends Record<string, unknown>>(
		input: T
	): Partial<T> {
		return Object.fromEntries(
			Object.entries(input).filter(
				([, value]) => value !== undefined && value !== null
			)
		) as Partial<T>;
	}

	// ─────────────────────────────────────────────────────────────────────────
	// ERROR UTILITIES
	// ─────────────────────────────────────────────────────────────────────────

	/**
	 * Throws a standardized NOT_FOUND domain error.
	 *
	 * @description
	 * Centralizes the throw pattern used after every failed `findUnique`
	 * across the codebase. Pair with a log call before throwing.
	 *
	 * @param code - The domain-specific ErrorCode (e.g. `ErrorCode.BAG_NOT_FOUND`).
	 *
	 * @example
	 * ```typescript
	 * if (!bag) {
	 *   this.log.info({ userId, bagId: id }, 'Bag not found');
	 *   this.throwNotFound(ErrorCode.BAG_NOT_FOUND);
	 * }
	 * ```
	 */
	protected throwNotFound(code: ErrorCode): never {
		throw appErrorMap.notFound(code);
	}

	/** Throws a standardized UNAUTHORIZED domain error. */
	protected throwUnauthorized(code: ErrorCode): never {
		throw appErrorMap.unauthorized(code);
	}

	/** Throws a standardized FORBIDDEN domain error. */
	protected throwForbidden(code: ErrorCode): never {
		throw appErrorMap.forbidden(code);
	}

	/** Throws a standardized BAD_REQUEST domain error. */
	protected throwBadRequest(code: ErrorCode): never {
		throw appErrorMap.badRequest(code);
	}

	// ─────────────────────────────────────────────────────────────────────────
	// ASSERTION UTILITIES
	// ─────────────────────────────────────────────────────────────────────────

	/**
	 * Asserts that a Prisma result exists, throwing NOT_FOUND if it is null.
	 *
	 * @description
	 * Combines the null-check + log + throw pattern that follows every
	 * `findUnique` call into a single readable line.
	 *
	 * @param entity - The result from a Prisma findUnique / findFirst call.
	 * @param code - The ErrorCode to throw if the entity is null.
	 * @param logContext - Additional context written to the log before throwing.
	 *
	 * @returns The entity, narrowed to non-null.
	 *
	 * @example
	 * ```typescript
	 * // Before:
	 * const bag = await this.prisma.bag.findUnique({ where: { id, userId } });
	 * if (!bag) {
	 *   this.log.info({ userId, bagId: id }, 'Bag not found');
	 *   throw appErrorMap.notFound(ErrorCode.BAG_NOT_FOUND);
	 * }
	 *
	 * // After:
	 * const bag = await this.prisma.bag.findUnique({ where: { id, userId } });
	 * return this.assertFound(bag, ErrorCode.BAG_NOT_FOUND, { userId, bagId: id });
	 * ```
	 */
	protected assertFound<T>(
		entity: T | null | undefined,
		code: ErrorCode,
		logContext?: Record<string, unknown>
	): T {
		if (entity == null) {
			if (logContext) {
				this.log.warn(logContext, `Entity not found [${code}]`);
			}
			this.throwNotFound(code);
		}
		return entity;
	}
}
