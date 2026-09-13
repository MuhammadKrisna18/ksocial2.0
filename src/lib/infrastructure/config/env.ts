import { env } from '$env/dynamic/private';

function requireEnv(key: string): string {
	const value = env[key];
	if (!value) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
	return value;
}

export const serverEnv = {
	DATABASE_URL: requireEnv('DATABASE_URL')
} as const;
