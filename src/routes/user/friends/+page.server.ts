import { redirect } from '@sveltejs/kit';
import { container } from '$lib/infrastructure/config/container';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.sub;
	if (!userId) {
		throw redirect(302, '/auth/login');
	}

	try {
		// Dapatkan daftar semua user selain user yang sedang login
		const allUsers = await container.getUsersUseCase.execute(userId);
		
		// Filter profil admin agar tidak tampil di halaman user
		const users = allUsers.filter(u => !u.roles.includes('admin'));

		return {
			users
		};
	} catch (error) {
		console.error('Failed to load users for friends page:', error);
		return {
			users: []
		};
	}
};
