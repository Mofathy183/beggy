import { defineConfig } from 'prisma/config';
import { DATABASE_URL } from './src/config/db-url';

export default defineConfig({
	schema: 'prisma',
	migrations: {
		path: 'prisma/migrations',
	},
	datasource: {
		url: DATABASE_URL,
	},
});
