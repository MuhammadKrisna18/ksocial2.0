import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { container } from '$lib/infrastructure/config/container';
import { ACCESS_TOKEN_COOKIE, getAuthCookieOptions } from '$lib/presentation/utils/cookie';
import { dev } from '$app/environment';
import { loginRateLimiter, getClientIp } from '$lib/infrastructure/security/RateLimiter';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		const roles = locals.user.roles ?? [];
		if (roles.includes('admin')) {
			throw redirect(302, '/admin');
		}
		throw redirect(302, '/user');
	}
};

export const actions: Actions = {
	login: async (event) => {
		const { request, cookies } = event;
		const clientIp = getClientIp(event);

		// Anti brute-force: check if IP is currently locked out
		const initialCheck = loginRateLimiter.check(clientIp);
		if (!initialCheck.allowed) {
			return fail(429, {
				email: undefined,
				incorrect: true,
				message: `Terlalu banyak percobaan login gagal. Silakan coba lagi dalam ${initialCheck.resetInSeconds} detik.`
			});
		}

		const data = await request.formData();
		const email = data.get('email');
		const password = data.get('password');

		if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
			return fail(400, { email, missing: true, message: 'Email and password are required' });
		}

		let redirectUrl = '/user';

		try {
			const result = await container.loginUseCase.execute({ email, password });

			// Reset rate limiter on successful login
			loginRateLimiter.reset(clientIp);

			cookies.set(ACCESS_TOKEN_COOKIE, result.accessToken, getAuthCookieOptions(!dev));

			const roles = result.user.roles ?? [];
			if (roles.includes('admin')) {
				redirectUrl = '/admin';
			}
		} catch (err: unknown) {
			// Record failed attempt against this IP
			const failedResult = loginRateLimiter.consume(clientIp);
			console.error('Login error:', err);
			const message = err instanceof Error ? err.message : 'Login failed';

			if (!failedResult.allowed) {
				return fail(429, {
					email,
					incorrect: true,
					message: `Terlalu banyak percobaan login gagal. Akses sementara dibatasi selama ${failedResult.resetInSeconds} detik.`
				});
			}

			return fail(401, { email, incorrect: true, message });
		}

		throw redirect(302, redirectUrl);
	},
	logout: async ({ cookies }) => {
		cookies.delete(ACCESS_TOKEN_COOKIE, getAuthCookieOptions(!dev));
		throw redirect(302, '/login');
	}
};
