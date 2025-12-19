import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const rename = promisify(fs.rename);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const exists = promisify(fs.exists);

// Type definitions
interface FolderToTypeMap {
	[key: string]: string;
}

interface FilePatternsMap {
	[key: string]: string;
}

interface FileInfo {
	path: string;
	filename: string;
}

interface GeneratedFileInfo {
	oldName: string;
	newName: string;
	oldPath: string;
	newPath: string;
	type: string;
	functionName: string;
}

interface RenamedFileInfo {
	oldName: string;
	newName: string;
	oldPath: string;
	newPath: string;
}

interface ChangeLog {
	old: string;
	new: string;
	status: string;
	path?: string;
}

interface RenameFilesParams {
	directory: string;
	dryRun?: boolean;
	updateImports?: boolean;
}

interface RenameMap {
	[key: string]: string;
}

// Folder to type mapping
const FOLDER_TO_TYPE: FolderToTypeMap = {
	controllers: 'controller',
	routes: 'route',
	middlewares: 'middleware',
	services: 'service',
	repositories: 'repository',
	models: 'model',
	schemas: 'schema',
	validators: 'validator',
	utils: 'utils',
	helpers: 'helper',
	configs: 'config',
	config: 'config',
	constants: 'constant',
	types: 'type',
	interfaces: 'interface',
	dto: 'dto',
	entities: 'entity',
	migrations: 'migration',
	seeds: 'seed',
	factories: 'factory',
	tests: 'test',
	specs: 'spec',
};

// Common file patterns to identify
const FILE_PATTERNS: FilePatternsMap = {
	Controller: 'controller',
	Route: 'route',
	Middleware: 'middleware',
	Service: 'service',
	Repository: 'repository',
	Model: 'model',
	Schema: 'schema',
	Validator: 'validator',
	Utils: 'utils',
	Helper: 'helper',
	Config: 'config',
	Constant: 'constant',
	Type: 'type',
	Interface: 'interface',
	Dto: 'dto',
	Entity: 'entity',
	Migration: 'migration',
	Seed: 'seed',
	Factory: 'factory',
	Test: 'test',
	Spec: 'spec',
};

/**
 * Convert camelCase/PascalCase to kebab-case
 * @param str - Input string
 * @returns kebab-case string
 */
function toKebabCase(str: string): string {
	return str
		.replace(/([a-z])([A-Z])/g, '$1-$2') // Convert camelCase
		.replace(/([A-Z])([A-Z][a-z])/g, '$1-$2') // Handle consecutive capitals
		.replace(/_/g, '-') // Convert underscores to hyphens
		.toLowerCase();
}

/**
 * Extract function name from filename
 * @param filename - Original filename
 * @param type - File type (controller, route, etc.)
 * @returns Function name
 */
function extractFunctionName(filename: string, type: string): string {
	let name = filename;

	// Remove extension
	name = name.replace(/\.(js|ts|jsx|tsx)$/, '');

	// Remove type suffixes (case insensitive)
	const typePattern = new RegExp(`[-._]?${type}$`, 'i');
	name = name.replace(typePattern, '');

	// Remove common patterns
	for (const [pattern, patternType] of Object.entries(FILE_PATTERNS)) {
		const regex = new RegExp(`[-._]?${pattern}$`, 'i');
		if (regex.test(name)) {
			name = name.replace(regex, '');
			break;
		}
	}

	// If name is empty after removing patterns, use the original name
	if (!name || name === filename.replace(/\.(js|ts|jsx|tsx)$/, '')) {
		// Try to extract from camelCase patterns like "userController"
		for (const [pattern, patternType] of Object.entries(FILE_PATTERNS)) {
			if (name.endsWith(pattern)) {
				name = name.slice(0, -pattern.length);
				break;
			}
		}
	}

	// If we still have nothing, check for patterns like "admin-controller" (already in kebab)
	if (!name) {
		// Check if it's already in kebab-case with type
		const kebabType = type.toLowerCase();
		const kebabPattern = new RegExp(`-${kebabType}$`);
		if (kebabPattern.test(name)) {
			name = name.replace(kebabPattern, '');
		}
	}

	return name || 'index';
}

/**
 * Get file type from folder name or filename
 * @param folderName - Current folder name
 * @param filename - Original filename
 * @returns File type
 */
function getFileType(folderName: string, filename: string): string {
	// First try to get from folder name
	const folderType = FOLDER_TO_TYPE[folderName.toLowerCase()];
	if (folderType) {
		return folderType;
	}

	// If not found in folder mapping, try to extract from filename
	const baseName = filename.toLowerCase();

	// Check for type patterns in filename
	for (const [pattern, type] of Object.entries(FILE_PATTERNS)) {
		if (
			baseName.includes(`.${type.toLowerCase()}.`) ||
			baseName.includes(`-${type.toLowerCase()}.`) ||
			baseName.includes(`_${type.toLowerCase()}.`)
		) {
			return type;
		}
	}

	// Check for type as suffix
	for (const [pattern, type] of Object.entries(FILE_PATTERNS)) {
		const patternLower = pattern.toLowerCase();
		if (
			baseName.endsWith(`.${type.toLowerCase()}`) ||
			baseName.endsWith(`-${type.toLowerCase()}`) ||
			baseName.endsWith(`_${type.toLowerCase()}`) ||
			baseName.includes(`${type.toLowerCase()}.`)
		) {
			return type;
		}
	}

	// Default to 'module' if no type found
	return 'module';
}

/**
 * Generate new filename based on convention
 * @param filename - Original filename
 * @param folderPath - Path of the containing folder
 * @returns New filename and full path
 */
function generateNewFilename(
	filename: string,
	folderPath: string
): GeneratedFileInfo {
	const folderName = path.basename(folderPath);
	const fileType = getFileType(folderName, filename);

	// Extract function name
	const functionName = extractFunctionName(filename, fileType);

	// Convert function name to kebab-case
	const kebabFunctionName = toKebabCase(functionName);

	// Handle special cases
	let finalFunctionName = kebabFunctionName;

	// If function name is empty or index, just use the type
	if (!finalFunctionName || finalFunctionName === 'index') {
		finalFunctionName = fileType;
	}

	// Get file extension
	const ext = path.extname(filename);

	// Construct new filename
	let newFilename: string;

	if (finalFunctionName === fileType) {
		// If function name is same as type, use just the type
		newFilename = `${fileType}${ext}`;
	} else {
		// IMPORTANT FIX: Use dot separator, not hyphen
		newFilename = `${finalFunctionName}.${fileType}${ext}`;
	}

	// Special handling for test files
	if (filename.includes('.test.') || filename.includes('.spec.')) {
		if (finalFunctionName.endsWith('.test')) {
			finalFunctionName = finalFunctionName.replace('.test', '');
		}
		if (finalFunctionName.endsWith('.spec')) {
			finalFunctionName = finalFunctionName.replace('.spec', '');
		}
		newFilename = `${finalFunctionName}.${fileType}.test${ext}`;
	}

	// Handle files that already have dots (like user.controller.ts should stay the same)
	const baseName = filename.replace(ext, '');
	const parts = baseName.split('.');

	// If the file already follows the pattern name.type.ts, keep it as is
	if (parts.length >= 2) {
		const lastPart = parts[parts.length - 1]?.toLowerCase() || ''; // Fix: Add optional chaining and fallback
		const secondLastPart = parts.length >= 2 ? parts[parts.length - 2] : '';

		// Check if the file already has a type suffix
		const allTypes = Object.values(FILE_PATTERNS);
		if (allTypes.includes(lastPart)) {
			// File already follows the convention, don't change it
			return {
				oldName: filename,
				newName: filename, // Keep the same name
				oldPath: path.join(folderPath, filename),
				newPath: path.join(folderPath, filename),
				type: lastPart,
				functionName: parts.slice(0, -1).join('.'),
			};
		}
	}

	return {
		oldName: filename,
		newName: newFilename,
		oldPath: path.join(folderPath, filename),
		newPath: path.join(folderPath, newFilename),
		type: fileType,
		functionName: finalFunctionName,
	};
}

/**
 * Update import statements in a file
 * @param filePath - Path to the file
 * @param renamedFiles - Array of renamed files with old and new names
 * @returns Whether any imports were updated
 */
async function updateImportsInFile(
	filePath: string,
	renamedFiles: RenamedFileInfo[]
): Promise<boolean> {
	const content = await readFile(filePath, 'utf8');
	let updatedContent = content;
	let changed = false;

	// Create a map for quick lookup
	const renameMap: RenameMap = {};
	for (const file of renamedFiles) {
		const oldNameWithoutExt = file.oldName.replace(
			/\.(js|ts|jsx|tsx)$/,
			''
		);
		const newNameWithoutExt = file.newName.replace(
			/\.(js|ts|jsx|tsx)$/,
			''
		);
		renameMap[oldNameWithoutExt] = newNameWithoutExt;

		// Also map with path
		const relativePath = path.relative(
			path.dirname(filePath),
			file.oldPath
		);
		const newRelativePath = path.relative(
			path.dirname(filePath),
			file.newPath
		);

		if (relativePath !== newRelativePath) {
			renameMap[relativePath.replace(/\.(js|ts|jsx|tsx)$/, '')] =
				newRelativePath.replace(/\.(js|ts|jsx|tsx)$/, '');
		}
	}

	// Update require statements
	for (const [oldName, newName] of Object.entries(renameMap)) {
		if (oldName === newName) continue; // Skip if no change

		// Update require statements with .js/.ts extension
		const requirePatterns = [
			new RegExp(
				`require\\(['"](\\./|\\.\\./)*${oldName}(?:\\.(js|ts))?['"]\\)`,
				'g'
			),
			new RegExp(
				`from ['"](\\./|\\.\\./)*${oldName}(?:\\.(js|ts))?['"]`,
				'g'
			),
			new RegExp(
				`import ['"](?:\\./|\\.\\./)*${oldName}(?:\\.(js|ts))?['"]`,
				'g'
			),
		];

		for (const pattern of requirePatterns) {
			const matches = updatedContent.match(pattern);
			if (matches) {
				updatedContent = updatedContent.replace(pattern, (match) => {
					return match.replace(oldName, newName);
				});
				changed = true;
			}
		}
	}

	if (changed) {
		await writeFile(filePath, updatedContent, 'utf8');
	}

	return changed;
}

/**
 * Recursively scan directory for files
 * @param directory - Directory to scan
 * @param fileList - Accumulated file list
 * @returns List of files
 */
async function scanDirectory(
	directory: string,
	fileList: FileInfo[] = []
): Promise<FileInfo[]> {
	const files = await readdir(directory);

	for (const file of files) {
		const filePath = path.join(directory, file);
		const fileStat = await stat(filePath);

		if (fileStat.isDirectory()) {
			await scanDirectory(filePath, fileList);
		} else {
			// Only process JS/TS files
			if (/\.(js|ts|jsx|tsx)$/.test(file)) {
				fileList.push({
					path: directory,
					filename: file,
				});
			}
		}
	}

	return fileList;
}

/**
 * Main rename files function
 * @param params - Function parameters
 * @returns Result message
 */
export async function renameFiles({
	directory,
	dryRun = true,
	updateImports = true,
}: RenameFilesParams): Promise<string> {
	try {
		// Validate directory exists
		if (!(await exists(directory))) {
			throw new Error(`Directory not found: ${directory}`);
		}

		// Scan for files
		const files = await scanDirectory(directory);

		if (files.length === 0) {
			return 'No JS/TS files found to rename.';
		}

		const changes: ChangeLog[] = [];
		const renamedFiles: RenamedFileInfo[] = [];

		// Process each file
		for (const file of files) {
			const newFileInfo = generateNewFilename(file.filename, file.path);

			// Skip if filename already follows convention
			if (file.filename === newFileInfo.newName) {
				continue;
			}

			// Check if new filename already exists
			if (await exists(newFileInfo.newPath)) {
				changes.push({
					old: file.filename,
					new: newFileInfo.newName,
					status: 'SKIPPED (file already exists)',
					path: file.path,
				});
				continue;
			}

			if (!dryRun) {
				try {
					// Rename the file
					await rename(newFileInfo.oldPath, newFileInfo.newPath);

					// Track for import updates
					renamedFiles.push({
						oldName: file.filename,
						newName: newFileInfo.newName,
						oldPath: newFileInfo.oldPath,
						newPath: newFileInfo.newPath,
					});

					changes.push({
						old: file.filename,
						new: newFileInfo.newName,
						status: 'RENAMED',
						path: file.path,
					});
				} catch (error: any) {
					changes.push({
						old: file.filename,
						new: newFileInfo.newName,
						status: `ERROR: ${error.message}`,
						path: file.path,
					});
				}
			} else {
				changes.push({
					old: file.filename,
					new: newFileInfo.newName,
					status: 'WOULD RENAME',
					path: file.path,
				});
			}
		}

		// Update import statements if requested
		if (updateImports && renamedFiles.length > 0 && !dryRun) {
			const allFiles = await scanDirectory(directory);
			let importUpdates = 0;

			for (const file of allFiles) {
				const filePath = path.join(file.path, file.filename);
				const updated = await updateImportsInFile(
					filePath,
					renamedFiles
				);
				if (updated) {
					importUpdates++;
				}
			}

			if (importUpdates > 0) {
				changes.push({
					old: '',
					new: '',
					status: `Updated import statements in ${importUpdates} files`,
					path: '',
				});
			}
		}

		// Generate result message
		let result = `Found ${files.length} JS/TS file(s).\n`;

		if (changes.length === 0) {
			result += 'All files already follow the naming convention.\n';
		} else {
			result += `\nChanges (${dryRun ? 'DRY RUN - no files were changed' : 'ACTUAL CHANGES'}):\n`;
			result += '='.repeat(80) + '\n';

			for (const change of changes) {
				if (change.old) {
					result += `• ${change.old} → ${change.new} [${change.status}]\n`;
					if (change.path) {
						result += `  Path: ${change.path}\n`;
					}
				} else {
					result += `• ${change.status}\n`;
				}
			}

			if (dryRun) {
				result +=
					'\nNote: This was a dry run. To actually rename files, set dryRun: false\n';
			}
		}

		return result;
	} catch (error: any) {
		throw new Error(`Failed to rename files: ${error.message}`);
	}
}
