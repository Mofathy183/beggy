import * as path from 'path';

/**
 * Seeded IDs that packing tests depend on.
 * Populated during setup and written to a JSON sidecar so the spec file
 * can import them without re-running setup logic.
 *
 * Path: tests/e2e/.auth/packing-seed.json
 */
export const PACKING_SEED_PATH = path.join(
	process.cwd(),
	'tests/e2e/.auth/packing-seed.json'
);

export interface PackingSeed {
	containerId: string;
	secondContainerId: string;
	itemId: string;
	nonOwnedContainerId: string;
}
