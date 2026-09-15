import { redirect } from '@sveltejs/kit';
import { container } from '$lib/infrastructure/config/container';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Any data loading for settings could go here.
	// For now, no specific data is needed besides what hooks provides.
	return {};
};

export const actions: Actions = {
	deleteAccount: async ({ cookies, locals }) => {
		const userId = locals.user?.sub;
		if (!userId) {
			return { success: false, message: 'Unauthorized' };
		}

		try {
			await container.deleteAccountUseCase.execute(userId);
			
			// Destroy the session cookie
			cookies.delete('session', { path: '/' });
			
		} catch (e) {
			return { success: false, message: 'Gagal menghapus akun.' };
		}
		
		throw redirect(303, '/login');
	}
};
