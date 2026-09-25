import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { container } from '$lib/infrastructure/config/container';
import { ACCESS_TOKEN_COOKIE, getAuthCookieOptions } from '$lib/presentation/utils/cookie';
import { dev } from '$app/environment';
import { registerRateLimiter, getClientIp } from '$lib/infrastructure/security/RateLimiter';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		const roles = locals.user.roles ?? [];
		if (roles.includes('admin')) {
			throw redirect(302, '/admin');
		}
		throw redirect(302, '/user');
	}
	return {};
};

export const actions: Actions = {
	default: async (event) => {
		const { request, cookies } = event;
		const clientIp = getClientIp(event);

		// Anti-bot / spam account creation rate limiting
		const rateCheck = registerRateLimiter.consume(clientIp);
		if (!rateCheck.allowed) {
			return fail(429, {
				error: `Terlalu banyak permintaan pendaftaran. Silakan coba lagi dalam ${rateCheck.resetInSeconds} detik.`,
				values: undefined
			});
		}

		const formData = await request.formData();
		const fullName = formData.get('fullName') as string;
		const username = formData.get('username') as string;
		const email = (formData.get('email') as string)?.trim().toLowerCase();
		const password = formData.get('password') as string;
		const dateOfBirthStr = formData.get('dateOfBirth') as string;

		if (!fullName || !username || !email || !password || !dateOfBirthStr) {
			return fail(400, {
				error: 'Semua kolom wajib diisi.',
				values: { fullName, username, email, dateOfBirth: dateOfBirthStr }
			});
		}

		const dateOfBirth = new Date(dateOfBirthStr);

		try {
			const result = await container.registerUseCase.execute({
				fullName,
				username,
				email,
				password,
				dateOfBirth
			});

			cookies.set(ACCESS_TOKEN_COOKIE, result.accessToken, getAuthCookieOptions(!dev));
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat pendaftaran.';

			let friendlyError = message;
			if (message.includes('Username already in use')) {
				friendlyError = 'Nama panggilan (Username) tersebut sudah dipakai oleh orang lain.';
			} else if (message.includes('Email already in use')) {
				friendlyError = 'Email tersebut sudah terdaftar.';
			} else if (message.includes('Invalid email address')) {
				friendlyError = 'Format email tidak valid. Gunakan format email yang benar (misal: user@gmail.com).';
			}

			return fail(400, {
				error: friendlyError,
				values: { fullName, username, email, dateOfBirth: dateOfBirthStr }
			});
		}

		throw redirect(302, '/user');
	}
};
