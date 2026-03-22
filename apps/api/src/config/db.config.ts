import dotenv from 'dotenv';
import path from 'path';

export type Environment = 'development' | 'production' | 'test';

const NODE_ENV = (process.env.NODE_ENV as Environment) ?? 'development';

const envFileMap: Record<Environment, string> = {
	development: '.env.local',
	test: '.env.test',
	production: '.env.production',
};

dotenv.config({
	path: path.resolve(process.cwd(), envFileMap[NODE_ENV] ?? '.env.local'),
	override: false,
});

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

export const DATABASE_URL = buildDatabaseUrl();
