import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { ACCESS_TOKEN_COOKIE, getAuthCookieOptions } from '$lib/presentation/utils/cookie';
import { dev } from '$app/environment';

export const load: PageServerLoad = async ({ locals }) => {
	return { user: locals.user };
};

export const actions: Actions = {
	logout: async ({ cookies }) => {
		cookies.delete(ACCESS_TOKEN_COOKIE, getAuthCookieOptions(!dev));
		throw redirect(302, '/login');
	}
};
