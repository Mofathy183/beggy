import { z } from 'zod';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { resolveNames, validateModuleName } from '../utils/name.utils.js';
import { injectModule } from '../utils/inject-module.util.js';
import {
	normalizePath,
	resolveModulePath,
	createModuleDir,
	writeModuleFile,
} from '../utils/fs.utils.js';
import { renderServiceTemplate } from '../templates/service.template.js';
import { renderControllerTemplate } from '../templates/controller.template.js';
import { renderRouteTemplate } from '../templates/route.template.js';
import { renderMapperTemplate } from '../templates/mapper.template.js';
import { renderIndexTemplate } from '../templates/index.template.js';

export const CreateModuleInputSchema = z.object({
	name: z
		.string()
		.min(1)
		.describe(
			'Module folder name — plural lowercase. Examples: "trips", "bags", "bag-items".'
		),
	monorepoRoot: z
		.string()
		.min(1)
		.describe(
			'Absolute path to your Beggy monorepo root. Example: "E:/beggy"'
		),
});

export type CreateModuleInput = z.infer<typeof CreateModuleInputSchema>;

export async function createModule(input: CreateModuleInput): Promise<string> {
	const { name, monorepoRoot } = input;

	validateModuleName(name);

	const { folder, pascal, camel, upper } = resolveNames(name);
	const root = normalizePath(monorepoRoot);

	log(`Scaffolding "${folder}" module`);
	log(`  Classes: ${pascal}Service, ${pascal}Controller, ${pascal}Mapper`);

	const files: Array<{ fileName: string; content: string }> = [
		{
			fileName: `${folder}.service.ts`,
			content: renderServiceTemplate(folder, pascal, camel, upper),
		},
		{
			fileName: `${folder}.controller.ts`,
			content: renderControllerTemplate(folder, pascal, camel, upper),
		},
		{
			fileName: `${folder}.route.ts`,
			content: renderRouteTemplate(folder, pascal, camel, upper),
		},
		{
			fileName: `${folder}.mapper.ts`,
			content: renderMapperTemplate(folder, pascal, camel, upper),
		},
		{ fileName: `index.ts`, content: renderIndexTemplate(folder, pascal) },
	];

	const checks = checkExistingFiles(root, folder, pascal, upper);
	const missing = checks.filter((c) => !c.exists);

	if (missing.length > 0) {
		throw new Error(
			`[beggy-mcp] Cannot scaffold "${folder}".
Missing required shared contracts:\n` +
				missing.map((m) => ` - ${m.label}`).join('\n')
		);
	}

	const modulePath = resolveModulePath(monorepoRoot, folder);
	createModuleDir(modulePath);

	const writtenFiles: string[] = [];
	for (const { fileName, content } of files) {
		writeModuleFile(modulePath, fileName, content);
		writtenFiles.push(fileName); // ← file names for display
		log(`  ✓ ${fileName}`);
	}

	// 🔥 AUTO-INJECT INTO app.route.ts
	injectModule({
		monorepoRoot,
		name: folder,
		pascal,
	});

	return buildSuccessMessage(
		folder,
		pascal,
		upper,
		root,
		modulePath,
		writtenFiles
	);
}

// ─── Smart Checklist ─────────────────────────────────────────────────────────

interface CheckItem {
	label: string;
	detail: string;
	exists: boolean;
}

function checkExistingFiles(
	root: string,
	name: string,
	namePascal: string,
	nameUpper: string
): CheckItem[] {
	const checks: CheckItem[] = [];

	// 1. Prisma model
	const prismaModelPath = join(
		root,
		'apps',
		'api',
		'prisma',
		'models',
		`${name}.prisma`
	);
	checks.push({
		label: `Prisma model — apps/api/prisma/models/${name}.prisma`,
		detail: [
			`      model ${namePascal} {`,
			`        id        String   @id @default(cuid())`,
			`        createdAt DateTime @default(now())`,
			`        updatedAt DateTime @updatedAt`,
			`        // TODO: Add ${namePascal} fields`,
			`      }`,
		].join('\n'),
		exists: existsSync(prismaModelPath),
	});

	// 2. DTO types
	const dtoPath = join(
		root,
		'packages',
		'shared',
		'src',
		'types',
		`${name}.types.ts`
	);
	checks.push({
		label: `DTO types — packages/shared/src/types/${name}.types.ts`,
		detail: [
			`      export type ${namePascal}DTO = { id: string; createdAt: string; updatedAt: string; };`,
			`      export type ${namePascal}CreateDTO = { /* TODO */ };`,
			`      export type ${namePascal}UpdateDTO = Partial<${namePascal}CreateDTO>;`,
			`      export type ${namePascal}ListQueryDTO = { page?: number; limit?: number; orderBy?: string; order?: 'asc' | 'desc'; };`,
		].join('\n'),
		exists: existsSync(dtoPath),
	});

	// 3. Zod schemas
	const schemaPath = join(
		root,
		'packages',
		'shared',
		'src',
		'schemas',
		`${name}.schema.ts`
	);
	checks.push({
		label: `Zod schemas — packages/shared/src/schemas/${name}.schema.ts`,
		detail: `      // ${namePascal}CreateSchema, ${namePascal}UpdateSchema, ${namePascal}ListQuerySchema`,
		exists: existsSync(schemaPath),
	});

	// 4. ErrorCode — read file and check if constant exists
	const errorCodesPath = join(
		root,
		'packages',
		'shared',
		'src',
		'constants',
		'error.codes.ts'
	);
	let errorCodeExists = false;
	if (existsSync(errorCodesPath)) {
		errorCodeExists = readFileSync(errorCodesPath, 'utf-8').includes(
			`${nameUpper}_NOT_FOUND`
		);
	}
	checks.push({
		label: `ErrorCode — packages/shared/src/constants/error.codes.ts`,
		detail: `      ${nameUpper}_NOT_FOUND = '${nameUpper}_NOT_FOUND'`,
		exists: errorCodeExists,
	});

	// 5. Subject enum — read file and check if subject exists
	const permissionsPath = join(
		root,
		'packages',
		'shared',
		'src',
		'constants',
		'permissions.ts'
	);
	let subjectExists = false;
	if (existsSync(permissionsPath)) {
		subjectExists = readFileSync(permissionsPath, 'utf-8').includes(
			nameUpper
		);
	}
	checks.push({
		label: `Subject enum — packages/shared/src/constants/permissions.ts`,
		detail: `      ${nameUpper} = '${nameUpper}'`,
		exists: subjectExists,
	});

	// 6. Route registration — check app.route.ts
	const appRoutePath = join(root, 'apps', 'api', 'app.route.ts');
	let routeRegistered = false;
	if (existsSync(appRoutePath)) {
		routeRegistered = readFileSync(appRoutePath, 'utf-8').includes(
			`@modules/${name}`
		);
	}
	checks.push({
		label: `Route registration — apps/api/src/app.route.ts`,
		detail: [
			`      import { create${namePascal}Router, ${namePascal}Controller, ${namePascal}Service } from '@modules/${name}';`,
			`      app.use('/${name}', create${namePascal}Router(new ${namePascal}Controller(new ${namePascal}Service(prisma))));`,
		].join('\n'),
		exists: routeRegistered,
	});

	return checks;
}

// ─── Success Message ──────────────────────────────────────────────────────────

function buildSuccessMessage(
	name: string,
	namePascal: string,
	nameUpper: string,
	root: string,
	modulePath: string,
	writtenFiles: string[]
): string {
	const checks = checkExistingFiles(root, name, namePascal, nameUpper);
	const pending = checks.filter((c) => !c.exists);
	const done = checks.filter((c) => c.exists);

	const lines: string[] = [
		`✅ Module "${name}" scaffolded successfully!`,
		``,
		`📁 Location: ${modulePath}`,
		``,
		`📄 Generated files (full CRUD):`,
		...writtenFiles.map((f) => `   ${f}`),
		``,
		`   Includes: getAll, getById, create, update, deleteById, deleteMany`,
	];

	if (done.length > 0) {
		lines.push(``, `✅ Already exists — no action needed:`);
		for (const item of done) {
			lines.push(`   ✓ ${item.label}`);
		}
	}

	if (pending.length > 0) {
		lines.push(
			``,
			`📋 Still needed (${pending.length} step${pending.length > 1 ? 's' : ''}):`
		);
		let step = 1;
		for (const item of pending) {
			lines.push(``, `   ${step}. ${item.label}`);
			lines.push(item.detail);
			step++;
		}
		lines.push(
			``,
			`   ${step}. Run Prisma generate after adding the model:`,
			`      pnpm --filter @beggy/api prisma:generate`,
			``,
			`   ${step + 1}. Fill TODO sections in the generated files`
		);
	} else {
		lines.push(
			``,
			`🎉 All setup already done! Just fill the TODO sections.`,
			``,
			`   Then run: pnpm --filter @beggy/api prisma:generate`
		);
	}

	return lines.join('\n');
}

function log(msg: string): void {
	process.stderr.write(`[beggy-mcp] ${msg}\n`);
}
