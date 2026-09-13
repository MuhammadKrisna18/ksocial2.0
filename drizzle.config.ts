import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
	throw new Error('Missing required environment variable: DATABASE_URL');
}

export default defineConfig({
	dialect: 'postgresql',
	schema: './src/lib/infrastructure/database/schema/index.ts',
	out: './src/lib/infrastructure/database/migrations',
	dbCredentials: {
		url: DATABASE_URL
	},
	verbose: true,
	strict: true
});
