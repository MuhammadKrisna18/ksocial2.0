import type { CookieSerializeOptions } from 'cookie';
import { SESSION_MAX_AGE_SECONDS } from '$lib/infrastructure/config/constants';

export const ACCESS_TOKEN_COOKIE = 'access_token';

export function getAuthCookieOptions(isProduction: boolean): CookieSerializeOptions & { path: string } {
	return {
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		secure: isProduction,
		maxAge: SESSION_MAX_AGE_SECONDS
	};
}
