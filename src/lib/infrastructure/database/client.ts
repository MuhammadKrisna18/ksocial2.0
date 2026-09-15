import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { serverEnv } from '$lib/infrastructure/config/env';
import * as schema from './schema/index';

const queryClient = postgres(serverEnv.DATABASE_URL);

export const db = drizzle(queryClient, { schema });

