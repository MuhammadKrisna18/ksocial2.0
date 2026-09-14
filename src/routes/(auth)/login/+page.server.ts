import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { container } from '$lib/infrastructure/config/container';
import { ACCESS_TOKEN_COOKIE, getAuthCookieOptions } from '$lib/presentation/utils/cookie';
import { dev } from '$app/environment';

export const load: PageServerLoad = async ({ locals }) => {
	// If already logged in, redirect away from login
	if (locals.user) {
		const roles = locals.user.roles ?? [];
		if (roles.includes('admin')) {
			throw redirect(302, '/admin');
		}
		throw redirect(302, '/');
	}
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = data.get('email');
		const password = data.get('password');

		if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
			return fail(400, { email, missing: true, message: 'Email and password are required' });
		}

		let redirectUrl = '/';

		try {
			const result = await container.loginUseCase.execute({ email, password });
			
			cookies.set(ACCESS_TOKEN_COOKIE, result.accessToken, getAuthCookieOptions(!dev));
			
			const roles = result.user.roles ?? [];
			if (roles.includes('admin')) {
				redirectUrl = '/admin';
			}
			
		} catch (err: any) {
			console.error('Login error:', err);
			const message = err?.message || String(err) || 'Login failed';
			return fail(401, { email, incorrect: true, message });
		}

		throw redirect(302, redirectUrl);
	}
};
