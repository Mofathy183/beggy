/**
 * Output validation before writing to disk.
 *
 * Strategy: fail loudly, write nothing.
 * Each validator checks for Beggy-specific patterns, not just generic TypeScript.
 */

export interface ValidationResult {
	valid: boolean;
	error?: string;
}

/**
 * Strips markdown code fences if DeepSeek wraps output despite instructions.
 */
export function stripCodeFences(raw: string): string {
	return raw
		.replace(/^```[\w]*\n?/m, '')
		.replace(/\n?```$/m, '')
		.trim();
}

export function validateService(
	content: string,
	namePascal: string
): ValidationResult {
	if (!content.includes(`class ${namePascal}Service`)) {
		return {
			valid: false,
			error: `Missing "class ${namePascal}Service" declaration.`,
		};
	}
	if (!content.includes('PrismaClientType')) {
		return {
			valid: false,
			error: `Missing PrismaClientType — DI constructor not following Beggy pattern.`,
		};
	}
	if (!content.includes(`private readonly prisma`)) {
		return {
			valid: false,
			error: `Missing "private readonly prisma" in constructor.`,
		};
	}
	if (!content.includes(`@prisma`)) {
		return {
			valid: false,
			error: `Missing import from '@prisma' — DeepSeek hallucinated the import path.`,
		};
	}
	if (!content.includes('logger.child')) {
		return {
			valid: false,
			error: `Missing logger.child() — Beggy logging pattern not followed.`,
		};
	}
	return { valid: true };
}

export function validateController(
	content: string,
	namePascal: string
): ValidationResult {
	if (!content.includes(`class ${namePascal}Controller`)) {
		return {
			valid: false,
			error: `Missing "class ${namePascal}Controller" declaration.`,
		};
	}
	if (!content.includes('Request') || !content.includes('Response')) {
		return {
			valid: false,
			error: `Missing Express Request/Response imports.`,
		};
	}
	if (!content.includes('Promise<void>')) {
		return {
			valid: false,
			error: `Handler methods must return Promise<void> — Beggy controller pattern not followed.`,
		};
	}
	if (!content.includes('apiResponseMap')) {
		return {
			valid: false,
			error: `Missing apiResponseMap — responses must use apiResponseMap, not res.json() directly.`,
		};
	}
	if (!content.includes('STATUS_CODE')) {
		return {
			valid: false,
			error: `Missing STATUS_CODE import — never hardcode HTTP status numbers.`,
		};
	}
	if (!content.includes('=>')) {
		return {
			valid: false,
			error: `Controller methods must be arrow functions (methodName = async (...) => {}).`,
		};
	}
	return { valid: true };
}

export function validateRoute(
	content: string,
	namePascal: string
): ValidationResult {
	if (!content.includes(`create${namePascal}Router`)) {
		return {
			valid: false,
			error: `Missing "create${namePascal}Router" factory function.`,
		};
	}
	if (!content.includes('Router()')) {
		return {
			valid: false,
			error: `Missing Express Router() instantiation.`,
		};
	}
	if (!content.includes('requireAuth')) {
		return {
			valid: false,
			error: `Missing requireAuth — every route MUST have authentication.`,
		};
	}
	if (!content.includes('requirePermission')) {
		return {
			valid: false,
			error: `Missing requirePermission — every route MUST have authorization.`,
		};
	}
	if (!content.includes('Action.') || !content.includes('Subject.')) {
		return {
			valid: false,
			error: `Missing Action or Subject enum usage in requirePermission call.`,
		};
	}
	return { valid: true };
}

export function validateMapper(
	content: string,
	namePascal: string
): ValidationResult {
	if (!content.includes(`${namePascal}Mapper`)) {
		return {
			valid: false,
			error: `Missing "${namePascal}Mapper" — mapper not found in output.`,
		};
	}
	if (content.includes(`class ${namePascal}Mapper`)) {
		return {
			valid: false,
			error: `Mapper must be a const object, NOT a class. Beggy pattern violation.`,
		};
	}
	if (!content.includes('toDTO')) {
		return { valid: false, error: `Missing toDTO method in mapper.` };
	}
	if (!content.includes('toISO')) {
		return {
			valid: false,
			error: `Missing toISO() for date fields — Beggy mapper pattern not followed.`,
		};
	}
	if (!content.includes('@prisma/generated/prisma/client')) {
		return {
			valid: false,
			error: `Missing Prisma model import from '@prisma/generated/prisma/client'.`,
		};
	}
	return { valid: true };
}

export function validateIndex(
	content: string,
	namePascal: string
): ValidationResult {
	const required = [
		`${namePascal}Service`,
		`${namePascal}Controller`,
		`create${namePascal}Router`,
		`${namePascal}Mapper`,
	];

	for (const name of required) {
		if (!content.includes(name)) {
			return {
				valid: false,
				error: `Missing export for "${name}" in barrel index.`,
			};
		}
	}

	return { valid: true };
}
