/**
 * Hard constraints injected into every DeepSeek prompt.
 *
 * These are facts about the Beggy project that DeepSeek MUST follow.
 * Injecting them prevents import path hallucination.
 *
 * Keep this file updated when the project structure changes.
 */

export const BEGGY_PROJECT_CONSTRAINTS = `
=== BEGGY PROJECT CONSTRAINTS — FOLLOW EXACTLY ===

PATH ALIASES (never invent these — use them as-is):
  @beggy/shared/types     → shared TypeScript types (DTOs, payloads, etc.)
  @beggy/shared/constants → ErrorCode, Action, Subject, Role enums
  @beggy/shared/schemas   → Zod schemas (AdminSchema, QuerySchema, etc.)
  @shared/middlewares     → requireAuth, requirePermission, validateBody, validateUuidParam, validateQuery, prepareListQuery, logger
  @shared/utils           → apiResponseMap, appErrorMap, buildUserQuery, hashPassword, toISO
  @shared/constants       → STATUS_CODE
  @shared/types           → PaginationPayload and other API-internal types
  @modules/{name}s        → import from sibling modules (e.g. @modules/users)
  @prisma                 → PrismaClientType (the extended Prisma client type)
  @prisma/generated/prisma/client → Prisma model types (User, Bag, Item, etc.)

SUBJECT ENUM (already defined — use EXACTLY these values, nothing else):
  Subject.BAG, Subject.ITEM, Subject.SUITCASE, Subject.USER, Subject.ROLE, Subject.PERMISSION
  If the new module's subject does not exist here, use Subject.USER as placeholder
  and add a TODO comment: // TODO: Add Subject.{NAME} to @beggy/shared/constants

ACTION ENUM (already defined):
  Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE, Action.MANAGE

ERRORCODE PATTERN:
  Always use ErrorCode.{NAME}_NOT_FOUND (e.g. ErrorCode.BAG_NOT_FOUND)
  If the error code doesn't exist yet, use it anyway and add:
  // TODO: Add ErrorCode.{NAME}_NOT_FOUND to @beggy/shared/constants

API RESPONSE PATTERN:
  apiResponseMap.ok<DTO>(data, 'MESSAGE_KEY')
  apiResponseMap.created<DTO>(data, 'MESSAGE_KEY')
  Never use res.json() directly — always use apiResponseMap

STATUS CODE PATTERN:
  import { STATUS_CODE } from '@shared/constants'
  Use STATUS_CODE.OK, STATUS_CODE.CREATED, STATUS_CODE.NO_CONTENT

LOGGER PATTERN:
  import { logger } from '@shared/middlewares'
  private readonly {name}Logger = logger.child({ domain: '{name}s', service: '{Name}Service' })

PRISMA CLIENT PATTERN:
  import type { PrismaClientType } from '@prisma'
  constructor(private readonly prisma: PrismaClientType)
  The prisma client has extensions — always type it as PrismaClientType, never as PrismaClient

MAPPER PATTERN:
  Always a const object, NEVER a class
  Always use toISO() from @shared/utils for date fields
  Import model type from @prisma/generated/prisma/client
  Import DTO type from @beggy/shared/types
  Never spread the entire Prisma model — map fields explicitly

CONTROLLER PATTERN:
  Always arrow function methods: methodName = async (req: Request, res: Response): Promise<void> => {}
  Never regular methods
  Always import Request, Response from 'express'

ROUTE PATTERN:
  Always a factory function: export const create{Name}Router = (controller: {Name}Controller): Router => {}
  Middleware order ALWAYS: requireAuth → requirePermission → (prepareListQuery?) → (validateQuery?) → validateBody/validateUuidParam → controller
  Never skip requireAuth or requirePermission

=== END OF BEGGY PROJECT CONSTRAINTS ===
`;

/**
 * The existing Subject enum values — so we don't generate invalid ones.
 */
export const EXISTING_SUBJECTS = [
	'BAG',
	'ITEM',
	'SUITCASE',
	'USER',
	'ROLE',
	'PERMISSION',
] as const;

/**
 * Checks if a subject exists in the enum.
 * Used to generate correct TODO comments.
 */
export function subjectExists(name: string): boolean {
	return EXISTING_SUBJECTS.includes(
		name.toUpperCase() as (typeof EXISTING_SUBJECTS)[number]
	);
}
