import path from 'node:path';

export const STORAGE_STATE_PATH = path.join(
	process.cwd(),
	'tests/e2e/.auth/user.json'
);
