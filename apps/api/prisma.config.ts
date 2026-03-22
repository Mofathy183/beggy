import { defineConfig } from 'prisma/config';
import { DATABASE_URL } from './src/config/db.config';

export default defineConfig({
	schema: 'prisma',
	migrations: {
		path: 'prisma/migrations',
	},
	datasource: {
		url: DATABASE_URL,
	},
});
