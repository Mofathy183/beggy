import fs from 'fs';
import { join } from 'path';

export function injectModule({
	monorepoRoot,
	name,
	pascal,
}: {
	monorepoRoot: string;
	name: string;
	pascal: string;
}) {
	const appRoutePath = join(
		monorepoRoot,
		'apps',
		'api',
		'app.route.ts' // ← IMPORTANT: your real path
	);

	if (!fs.existsSync(appRoutePath)) {
		throw new Error(`app.route.ts not found at: ${appRoutePath}`);
	}

	let content = fs.readFileSync(appRoutePath, 'utf8');

	// Prevent duplicate registration
	if (content.includes(`create${pascal}Router`)) {
		return;
	}

	// ─── Inject Import ─────────────────────────────

	const importBlock = `
import {
	create${pascal}Router,
	${pascal}Controller,
	${pascal}Service,
} from './src/modules/${name}';
`;

	const lastModuleImportIndex = content.lastIndexOf("from './src/modules/");

	const insertImportIndex = content.indexOf(';', lastModuleImportIndex) + 1;

	content =
		content.slice(0, insertImportIndex) +
		importBlock +
		content.slice(insertImportIndex);

	// ─── Inject Registration ───────────────────────

	const registrationBlock = `

const ${name}Controller = new ${pascal}Controller(
	new ${pascal}Service(prisma)
);

rootRouter.use('/${name}', create${pascal}Router(${name}Controller));
`;

	const lastUseIndex = content.lastIndexOf('rootRouter.use');

	const insertRegistrationIndex = content.indexOf(');', lastUseIndex) + 2;

	content =
		content.slice(0, insertRegistrationIndex) +
		registrationBlock +
		content.slice(insertRegistrationIndex);

	fs.writeFileSync(appRoutePath, content);
}
