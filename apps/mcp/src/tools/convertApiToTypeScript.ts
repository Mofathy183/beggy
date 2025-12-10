import { readFile, writeFile, mkdir, stat } from 'fs/promises';
import { join, dirname, extname, resolve } from 'path';
import { existsSync } from 'fs';

interface ConvertOptions {
	filePath: string;
	backup?: boolean;
	overwrite?: boolean;
}

interface ConvertResult {
	success: boolean;
	message: string;
	convertedFiles?: string[];
	errors?: string[];
}

/**
 * Convert Express.js Prisma PostgreSQL API files from JavaScript to TypeScript
 */
export async function convertApiToTypeScript(
	options: ConvertOptions
): Promise<ConvertResult> {
	const { filePath, backup = true, overwrite = false } = options;

	try {
		// Resolve the file path (handle both relative and absolute paths)
		const workspaceRoot = process.cwd();
		const resolvedPath = resolve(workspaceRoot, filePath);

		// Check if path exists
		if (!existsSync(resolvedPath)) {
			return {
				success: false,
				message: `Path does not exist: ${resolvedPath}`,
			};
		}

		const stats = await stat(resolvedPath);
		const convertedFiles: string[] = [];
		const errors: string[] = [];

		if (stats.isDirectory()) {
			// Convert all .js files in directory recursively
			await convertDirectory(resolvedPath, {
				backup,
				overwrite,
				convertedFiles,
				errors,
			});
		} else if (stats.isFile() && extname(resolvedPath) === '.js') {
			// Convert single file
			const result = await convertFile(resolvedPath, {
				backup,
				overwrite,
			});
			if (result.success) {
				convertedFiles.push(result.tsPath as string);
			} else {
				errors.push(result.error || 'Unknown error');
			}
		} else {
			return {
				success: false,
				message: `Path is not a JavaScript file: ${resolvedPath}`,
			};
		}

		return {
			success: errors.length === 0,
			message:
				errors.length === 0
					? `Successfully converted ${convertedFiles.length} file(s)`
					: `Converted ${convertedFiles.length} file(s) with ${errors.length} error(s)`,
			convertedFiles,
			errors: errors.length > 0 ? errors : undefined,
		};
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : String(error);
		return {
			success: false,
			message: `Conversion failed: ${errorMessage}`,
			errors: [errorMessage],
		};
	}
}

interface ConvertFileOptions {
	backup: boolean;
	overwrite: boolean;
}

interface ConvertFileResult {
	success: boolean;
	tsPath?: string;
	error?: string;
}

async function convertFile(
	jsPath: string,
	options: ConvertFileOptions
): Promise<ConvertFileResult> {
	const { backup, overwrite } = options;

	try {
		// Read the JavaScript file
		const jsContent = await readFile(jsPath, 'utf-8');

		// Generate TypeScript path
		const tsPath = jsPath.replace(/\.js$/, '.ts');

		// Check if .ts file already exists
		if (existsSync(tsPath) && !overwrite) {
			return {
				success: false,
				error: `TypeScript file already exists: ${tsPath}. Use overwrite: true to replace it.`,
			};
		}

		// Convert JavaScript to TypeScript
		const tsContent = convertJsToTs(jsContent, jsPath);

		// Create backup if requested
		if (backup) {
			const backupPath = `${jsPath}.backup`;
			await writeFile(backupPath, jsContent, 'utf-8');
		}

		// Ensure directory exists
		await mkdir(dirname(tsPath), { recursive: true });

		// Write TypeScript file
		await writeFile(tsPath, tsContent, 'utf-8');

		return {
			success: true,
			tsPath,
		};
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : String(error);
		return {
			success: false,
			error: `Failed to convert ${jsPath}: ${errorMessage}`,
		};
	}
}

async function convertDirectory(
	dirPath: string,
	options: ConvertFileOptions & {
		convertedFiles: string[];
		errors: string[];
	}
): Promise<void> {
	const { convertedFiles, errors, ...fileOptions } = options;

	try {
		const { readdir } = await import('fs/promises');
		const entries = await readdir(dirPath, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = join(dirPath, entry.name);

			if (entry.isDirectory()) {
				// Recursively process subdirectories
				await convertDirectory(fullPath, options);
			} else if (entry.isFile() && extname(entry.name) === '.js') {
				// Convert .js files
				const result = await convertFile(fullPath, fileOptions);
				if (result.success && result.tsPath) {
					convertedFiles.push(result.tsPath);
				} else if (result.error) {
					errors.push(result.error);
				}
			}
		}
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : String(error);
		errors.push(`Failed to process directory ${dirPath}: ${errorMessage}`);
	}
}

/**
 * Convert JavaScript code to TypeScript with proper type annotations
 */
function convertJsToTs(jsContent: string, filePath: string): string {
	let tsContent = jsContent;

	// Determine file type based on path
	const isController = filePath.includes('/controllers/');
	const isRoute = filePath.includes('/routes/');
	const isService = filePath.includes('/services/');
	const isMiddleware = filePath.includes('/middlewares/');
	const isValidator = filePath.includes('/validators/');
	const isConfig = filePath.includes('/config/');
	const isUtils = filePath.includes('/utils/');

	// Add imports for Express types
	if (isController || isRoute || isMiddleware) {
		if (
			!tsContent.includes(
				'import type { Request, Response, NextFunction }'
			)
		) {
			// Add Express types import at the top
			const importMatch = tsContent.match(/^import\s+.*$/m);
			if (importMatch) {
				const insertIndex =
					tsContent.indexOf('\n', importMatch.index) + 1;
				tsContent =
					tsContent.slice(0, insertIndex) +
					"import type { Request, Response, NextFunction } from 'express';\n" +
					tsContent.slice(insertIndex);
			} else {
				tsContent =
					"import type { Request, Response, NextFunction } from 'express';\n" +
					tsContent;
			}
		}
	}

	// Add Prisma Client type import if Prisma is used
	if (tsContent.includes('PrismaClient') || tsContent.includes('prisma')) {
		if (!tsContent.includes('import type { PrismaClient }')) {
			const importMatch = tsContent.match(/^import\s+.*PrismaClient.*$/m);
			if (!importMatch) {
				const insertIndex = tsContent.indexOf('\n') + 1;
				tsContent =
					tsContent.slice(0, insertIndex) +
					"import type { PrismaClient } from '../generated/client/index.js';\n" +
					tsContent.slice(insertIndex);
			}
		}
	}

	// Convert controller functions
	if (isController) {
		// Pattern: export const functionName = async (req, res, next) => {
		tsContent = tsContent.replace(
			/export\s+const\s+(\w+)\s*=\s*async\s*\(\s*req\s*,\s*res\s*,\s*next\s*\)\s*=>/g,
			'export const $1 = async (req: Request, res: Response, next: NextFunction): Promise<void> =>'
		);

		// Pattern: export const functionName = (req, res, next) => {
		tsContent = tsContent.replace(
			/export\s+const\s+(\w+)\s*=\s*\(\s*req\s*,\s*res\s*,\s*next\s*\)\s*=>/g,
			'export const $1 = (req: Request, res: Response, next: NextFunction): void =>'
		);

		// Pattern: export const functionName = async (req, res) => {
		tsContent = tsContent.replace(
			/export\s+const\s+(\w+)\s*=\s*async\s*\(\s*req\s*,\s*res\s*\)\s*=>/g,
			'export const $1 = async (req: Request, res: Response): Promise<void> =>'
		);
	}

	// Convert route handlers
	if (isRoute) {
		// Pattern: router.get('/path', handler)
		// These are usually already typed through the handler functions
		// But we can add type annotations for route definitions
	}

	// Convert service functions
	if (isService) {
		// Pattern: export const functionName = async (params) => {
		// Try to infer return types from Prisma operations
		tsContent = tsContent.replace(
			/export\s+const\s+(\w+)\s*=\s*async\s*\(([^)]+)\)\s*=>/g,
			(_match: string, funcName: string, params: string) => {
				// Add basic typing - can be enhanced with better inference
				const typedParams = addParamTypes(params);
				return `export const ${funcName} = async (${typedParams}): Promise<any> =>`;
			}
		);
	}

	// Convert middleware functions
	if (isMiddleware) {
		// Pattern: export const middlewareName = (req, res, next) => {
		tsContent = tsContent.replace(
			/export\s+const\s+(\w+)\s*=\s*\(\s*req\s*,\s*res\s*,\s*next\s*\)\s*=>/g,
			'export const $1 = (req: Request, res: Response, next: NextFunction): void =>'
		);

		tsContent = tsContent.replace(
			/export\s+const\s+(\w+)\s*=\s*async\s*\(\s*req\s*,\s*res\s*,\s*next\s*\)\s*=>/g,
			'export const $1 = async (req: Request, res: Response, next: NextFunction): Promise<void> =>'
		);
	}

	// Convert validator functions
	if (isValidator) {
		// Validators often use validation libraries - add basic typing
		tsContent = tsContent.replace(
			/export\s+const\s+(\w+)\s*=\s*\(([^)]+)\)\s*=>/g,
			(_match: string, funcName: string, params: string) => {
				const typedParams = addParamTypes(params);
				return `export const ${funcName} = (${typedParams}): any =>`;
			}
		);
	}

	// Convert config exports
	if (isConfig) {
		// Add type annotations for config objects
		tsContent = tsContent.replace(
			/export\s+const\s+(\w+)\s*=\s*\{/g,
			'export const $1: { [key: string]: any } = {'
		);
	}

	// Convert utility functions
	if (isUtils) {
		// Add basic typing for utility functions
		tsContent = tsContent.replace(
			/export\s+(const|function)\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>/g,
			(
				_match: string,
				decl: string,
				funcName: string,
				params: string
			) => {
				const typedParams = addParamTypes(params);
				return `export ${decl} ${funcName} = (${typedParams}): any =>`;
			}
		);

		tsContent = tsContent.replace(
			/export\s+function\s+(\w+)\s*\(([^)]*)\)/g,
			(_match: string, funcName: string, params: string) => {
				const typedParams = addParamTypes(params);
				return `export function ${funcName}(${typedParams}): any`;
			}
		);
	}

	// Convert common patterns
	// Add type for req.body, req.params, req.query
	tsContent = tsContent.replace(
		/const\s*\{\s*body\s*\}\s*=\s*req;/g,
		'const { body } = req as Request<{}, {}, any>;'
	);

	tsContent = tsContent.replace(
		/const\s*\{\s*params\s*\}\s*=\s*req;/g,
		'const { params } = req as Request<any>;'
	);

	tsContent = tsContent.replace(
		/const\s*\{\s*query\s*\}\s*=\s*req;/g,
		'const { query } = req as Request<{}, {}, {}, any>;'
	);

	// Convert Prisma client usage
	tsContent = tsContent.replace(
		/const\s+prisma\s*=\s*new\s+PrismaClient\(\)/g,
		'const prisma: PrismaClient = new PrismaClient()'
	);

	// Remove .js extensions from imports (TypeScript doesn't need them, but we'll keep for ESM compatibility)
	// Actually, keep .js extensions for ESM compatibility in TypeScript

	return tsContent;
}

/**
 * Add type annotations to function parameters
 */
function addParamTypes(params: string): string {
	if (!params.trim()) return '';

	return params
		.split(',')
		.map((param) => {
			const trimmed = param.trim();
			if (!trimmed) return '';

			// If already has type annotation, return as is
			if (trimmed.includes(':')) return trimmed;

			// Add basic type annotation
			const paramName = trimmed.split('=')[0]?.trim();
			const defaultValue = trimmed.includes('=')
				? trimmed.split('=').slice(1).join('=')
				: '';

			// Infer type from common patterns
			if (paramName === 'req') return `req: Request`;
			if (paramName === 'res') return `res: Response`;
			if (paramName === 'next') return `next: NextFunction`;
			if (paramName?.includes('data') || paramName?.includes('body'))
				return `${paramName}: any`;
			if (paramName?.includes('id') || paramName?.includes('Id'))
				return `${paramName}: string`;
			if (paramName?.includes('user'))
				return `${paramName as string}: any`;

			return `${paramName}: any${defaultValue ? ` = ${defaultValue}` : ''}`;
		})
		.join(', ');
}
