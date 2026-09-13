import type { RequestHandler } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { jsonResponse } from '$lib/presentation/utils/response';
import { ACCESS_TOKEN_COOKIE, getAuthCookieOptions } from '$lib/presentation/utils/cookie';

export const POST: RequestHandler = async ({ cookies }) => {
	cookies.delete(ACCESS_TOKEN_COOKIE, getAuthCookieOptions(!dev));
	return jsonResponse({ message: 'Logged out successfully' }, 200);
};
