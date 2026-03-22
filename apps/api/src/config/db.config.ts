import dotenv from 'dotenv';
import path from 'path';

export type Environment = 'development' | 'production' | 'test';

/**
 * Current application environment.
 *
 * @remarks
 * Defaults to `development` if not explicitly set.
 */
const NODE_ENV = (process.env.NODE_ENV as Environment) ?? 'development';

/**
 * Maps environment to corresponding env file.
 */
const envFileMap: Record<Environment, string> = {
	development: '.env.local',
	test: '.env.test',
	production: '',
};

/**
 * Loads environment variables from the appropriate file.
 *
 * @remarks
 * - Uses `process.cwd()` to resolve project root
 * - Does not override already defined environment variables
 */
dotenv.config({
	path: path.resolve(process.cwd(), envFileMap[NODE_ENV] ?? '.env.local'),
	override: false,
});

/**
 * Constructs the database connection URL.
 *
 * @returns Fully qualified PostgreSQL connection string
 *
 * @throws If neither DATABASE_URL nor required POSTGRES_* variables are defined
 *
 * @remarks
 * - Prefers `DATABASE_URL` when provided (e.g. production)
 * - Falls back to individual POSTGRES_* variables for local development
 */
const buildDatabaseUrl = (): string => {
	if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

	const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB } = process.env;

	if (!POSTGRES_USER || !POSTGRES_PASSWORD || !POSTGRES_DB) {
		throw new Error(
			'DATABASE_URL is not set and POSTGRES_* variables are missing'
		);
	}

	const host = process.env.DB_HOST ?? 'localhost';
	const port = process.env.DB_PORT ?? '5432';

	return `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${host}:${port}/${POSTGRES_DB}?schema=public`;
};

/**
 * Resolved database connection URL used across the application.
 */
export const DATABASE_URL = buildDatabaseUrl();
