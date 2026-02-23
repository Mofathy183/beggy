import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

export function normalizePath(p: string): string {
	return resolve(p.replace(/\\/g, '/'));
}

export function resolveModulePath(
	monorepoRoot: string,
	folderName: string
): string {
	return join(
		normalizePath(monorepoRoot),
		'apps',
		'api',
		'src',
		'modules',
		folderName
	);
}

export function createModuleDir(modulePath: string): void {
	if (existsSync(modulePath)) {
		throw new Error(
			`Module already exists: ${modulePath}\n` +
				`Delete the folder first if you want to regenerate.`
		);
	}
	mkdirSync(modulePath, { recursive: true });
}

export function writeModuleFile(
	modulePath: string,
	fileName: string,
	content: string
): string {
	const filePath = join(modulePath, fileName);
	writeFileSync(filePath, content, 'utf-8');
	return filePath;
}
