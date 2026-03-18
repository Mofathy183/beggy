import { defineConfig } from 'prisma/config';
import { env } from './src/config/env.config';

export default defineConfig({
	schema: 'prisma',
	migrations: {
		path: 'prisma/migrations',
	},
	datasource: {
		url: env.DATABASE_URL,
	},
});
