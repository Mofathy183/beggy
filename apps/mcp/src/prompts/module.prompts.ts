import {
	BEGGY_PROJECT_CONSTRAINTS,
	subjectExists,
} from './beggy.constraints.js';

/**
 * Prompt builders — now accept the agent plan as context.
 * The plan tells DeepSeek what the whole module looks like
 * before it writes each individual file.
 */

export function buildServicePrompt(
	name: string,
	namePascal: string,
	referenceService: string,
	plan: string
): string {
	return `${BEGGY_PROJECT_CONSTRAINTS}

=== MODULE PLAN (follow this exactly) ===
${plan}
=== END PLAN ===

=== REFERENCE FILE: apps/api/src/modules/users/users.service.ts ===
${referenceService}
=== END REFERENCE ===

Generate the service file for the "${namePascal}" domain.

EXACT requirements:
- File: apps/api/src/modules/${name}/${name}.service.ts
- Class: ${namePascal}Service
- Constructor: constructor(private readonly prisma: PrismaClientType)
- Import PrismaClientType from '@prisma'
- Import logger from '@shared/middlewares'
- Import appErrorMap from '@shared/utils'
- Import ErrorCode from '@beggy/shared/constants'
- Logger: logger.child({ domain: '${name}', service: '${namePascal}Service' })
- Generate ONLY getById(id: string): Promise<${namePascal}>
- Use ErrorCode.${name.replace(/-/g, '_').toUpperCase()}_NOT_FOUND
- Import Prisma model: import type { ${namePascal} } from '@prisma/generated/prisma/client'
- Follow JSDoc style from reference

Output ONLY raw TypeScript. No explanation. No markdown. No code fences.`;
}

export function buildControllerPrompt(
	name: string,
	namePascal: string,
	referenceController: string,
	plan: string
): string {
	return `${BEGGY_PROJECT_CONSTRAINTS}

=== MODULE PLAN (follow this exactly) ===
${plan}
=== END PLAN ===

=== REFERENCE FILE: apps/api/src/modules/users/users.controller.ts ===
${referenceController}
=== END REFERENCE ===

Generate the controller file for the "${namePascal}" domain.

EXACT requirements:
- File: apps/api/src/modules/${name}/${name}.controller.ts
- Class: ${namePascal}Controller
- Constructor: constructor(private readonly ${name}Service: ${namePascal}Service)
- Import ${namePascal}Service and ${namePascal}Mapper from '@modules/${name}'
- Import Request, Response from 'express'
- Import apiResponseMap from '@shared/utils'
- Import STATUS_CODE from '@shared/constants'
- Import ${namePascal}DTO from '@beggy/shared/types'
- Methods MUST be arrow functions: name = async (req: Request, res: Response): Promise<void> => {}
- Generate ONLY getById handler
- Use apiResponseMap.ok<${namePascal}DTO>(${namePascal}Mapper.toDTO(${name}), '${name.replace(/-/g, '_').toUpperCase()}_RETRIEVED')
- Use STATUS_CODE.OK
- Follow JSDoc style from reference

Output ONLY raw TypeScript. No explanation. No markdown. No code fences.`;
}

export function buildRoutePrompt(
	name: string,
	namePascal: string,
	referenceRoute: string,
	plan: string
): string {
	const subjectValue = subjectExists(name)
		? `Subject.${name.replace(/-/g, '_').toUpperCase()}`
		: `Subject.USER // TODO: Add Subject.${name.replace(/-/g, '_').toUpperCase()} to @beggy/shared/constants`;

	return `${BEGGY_PROJECT_CONSTRAINTS}

=== MODULE PLAN (follow this exactly) ===
${plan}
=== END PLAN ===

=== REFERENCE FILE: apps/api/src/modules/users/users.route.ts ===
${referenceRoute}
=== END REFERENCE ===

Generate the route file for the "${namePascal}" domain.

EXACT requirements:
- File: apps/api/src/modules/${name}/${name}.route.ts
- Factory function: create${namePascal}Router(${name}Controller: ${namePascal}Controller): Router
- Import Router from 'express'
- Import Action, Subject from '@beggy/shared/constants'
- Import ${namePascal}Controller from '@modules/${name}'
- Import requireAuth, requirePermission, validateUuidParam from '@shared/middlewares'
- Middleware order ALWAYS: requireAuth → requirePermission → validateUuidParam → controller
- Generate ONLY GET /:id route
- Permission: Action.READ, ${subjectValue}
- Follow JSDoc section header style from reference

Output ONLY raw TypeScript. No explanation. No markdown. No code fences.`;
}

export function buildMapperPrompt(
	name: string,
	namePascal: string,
	referenceMapper: string,
	plan: string
): string {
	return `${BEGGY_PROJECT_CONSTRAINTS}

=== MODULE PLAN (follow this exactly) ===
${plan}
=== END PLAN ===

=== REFERENCE FILE: apps/api/src/modules/users/users.mapper.ts ===
${referenceMapper}
=== END REFERENCE ===

Generate the mapper file for the "${namePascal}" domain.

EXACT requirements:
- File: apps/api/src/modules/${name}/${name}.mapper.ts
- Name: ${namePascal}Mapper — MUST be const object, NOT a class
- Import: import type { ${namePascal} } from '@prisma/generated/prisma/client'
- Import: import type { ${namePascal}DTO } from '@beggy/shared/types'
- Import: import { toISO } from '@shared/utils'
- Generate ONLY toDTO(${name}: ${namePascal}): ${namePascal}DTO
- Map: id, createdAt (toISO), updatedAt (toISO)
- Add: // TODO: Map ${namePascal}-specific fields here
- NEVER spread the whole model
- Follow JSDoc style from reference

Output ONLY raw TypeScript. No explanation. No markdown. No code fences.`;
}

export function buildIndexPrompt(name: string, namePascal: string): string {
	return `Generate a barrel index.ts for the Beggy "${name}" module.

Export EXACTLY these — nothing more:
- export { ${namePascal}Service } from './${name}.service'
- export { ${namePascal}Controller } from './${name}.controller'
- export { create${namePascal}Router } from './${name}.route'
- export { ${namePascal}Mapper } from './${name}.mapper'

Add this JSDoc header:
/**
 * ${namePascal} module — public API
 *
 * @remarks
 * - Only export what other modules are allowed to import
 * - Never export internal utilities or Prisma types directly
 */

Output ONLY raw TypeScript. No explanation. No markdown. No code fences.`;
}
