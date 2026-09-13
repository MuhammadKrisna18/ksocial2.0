import { env } from '$env/dynamic/private';

function requireEnv(key: string): string {
	const value = env[key];
	if (!value) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
	return value;
}

const VALID_JWT_EXPIRES_PATTERN = /^\d+[smhdw]$/;

function parseJwtExpiry(raw: string): string {
	if (!VALID_JWT_EXPIRES_PATTERN.test(raw)) {
		throw new Error(
			`Invalid JWT_EXPIRES_IN value: "${raw}". Expected format: e.g. 7d, 24h, 3600s`
		);
	}
	return raw;
}

export const serverEnv = {
	DATABASE_URL: requireEnv('DATABASE_URL'),
	JWT_SECRET: requireEnv('JWT_SECRET'),
	JWT_EXPIRES_IN: parseJwtExpiry(env['JWT_EXPIRES_IN'] ?? '7d')
} as const;
