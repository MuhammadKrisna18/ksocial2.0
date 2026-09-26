import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { serverEnv } from '$lib/infrastructure/config/env';
import * as schema from './schema/index';

const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

const queryClient = postgres(serverEnv.DATABASE_URL, {
	max: isServerless ? 1 : 10,
	idle_timeout: 20,
	connect_timeout: 10,
	prepare: false
});

export const db = drizzle(queryClient, { schema });

