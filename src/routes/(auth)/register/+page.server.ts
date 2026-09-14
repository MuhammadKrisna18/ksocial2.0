import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { container } from '$lib/infrastructure/config/container';

export const load: PageServerLoad = async ({ locals }) => {
	// If already logged in, redirect to admin
	if (locals.user) {
		throw redirect(302, '/admin');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const fullName = formData.get('fullName') as string;
		const username = formData.get('username') as string;
		const emailPrefix = formData.get('emailPrefix') as string;
		const password = formData.get('password') as string;
		const dateOfBirthStr = formData.get('dateOfBirth') as string;

		if (!fullName || !username || !emailPrefix || !password || !dateOfBirthStr) {
			return fail(400, {
				error: 'Semua kolom wajib diisi.',
				values: { fullName, username, emailPrefix, dateOfBirth: dateOfBirthStr }
			});
		}

		// Email formatting: @user.sveltekit.co.id
		const email = `${emailPrefix}@user.sveltekit.co.id`;
		const dateOfBirth = new Date(dateOfBirthStr);

		try {
			const result = await container.registerUseCase.execute({
				fullName,
				username,
				email,
				password,
				dateOfBirth
			});

			cookies.set('session', result.accessToken, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24 * 7 // 1 week
			});
			
		} catch (error: any) {
			const message = error.message || 'Terjadi kesalahan saat pendaftaran.';
			
			// Friendly message for unique constraints
			let friendlyError = message;
			if (message.includes('Username already in use')) {
				friendlyError = 'Nama panggilan (Username) tersebut sudah dipakai oleh orang lain.';
			} else if (message.includes('Email already in use')) {
				friendlyError = 'Email tersebut sudah terdaftar.';
			}
			
			return fail(400, {
				error: friendlyError,
				values: { fullName, username, emailPrefix, dateOfBirth: dateOfBirthStr }
			});
		}
		
		// Redirect outside try-catch to avoid SvelteKit breaking
		throw redirect(302, '/admin');
	}
};
