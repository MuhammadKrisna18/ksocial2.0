import { redirect, type Cookies } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ACCESS_TOKEN_COOKIE } from '$lib/presentation/utils/cookie';
import { container } from '$lib/infrastructure/config/container';
import { dev } from '$app/environment';

function performLogout(cookies: Cookies) {
	const token = cookies.get(ACCESS_TOKEN_COOKIE);
	if (token) {
		container.tokenRevocationService.revoke(token);
	}
	cookies.delete(ACCESS_TOKEN_COOKIE, { path: '/' });
	cookies.set(ACCESS_TOKEN_COOKIE, '', {
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		secure: !dev,
		maxAge: 0,
		expires: new Date(0)
	});
}

export const GET: RequestHandler = async ({ cookies }) => {
	performLogout(cookies);
	throw redirect(302, '/login');
};

export const POST: RequestHandler = async ({ cookies }) => {
	performLogout(cookies);
	throw redirect(302, '/login');
};
