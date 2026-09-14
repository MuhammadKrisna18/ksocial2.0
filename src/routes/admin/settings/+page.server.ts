import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { container } from '$lib/infrastructure/config/container';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {

	if (!locals.user) {
		throw redirect(302, '/login');
	}
	return {
		user: locals.user
	};
};

export const actions: Actions = {
	updateUsername: async ({ request, locals }) => {
		if (!locals.user) throw redirect(302, '/login');

		const data = await request.formData();
		const username = data.get('username');

		if (typeof username !== 'string' || !username) {
			return fail(400, { missingUsername: true, message: 'Username is required' });
		}

		try {
			await container.updateUserUseCase.updateUsername({
				userId: locals.user.id,
				newUsername: username
			});
			


			return { success: true, message: 'Username updated successfully.' };
		} catch (err: any) {
			return fail(400, { error: true, message: err?.message || 'Failed to update username' });
		}
	},

	updatePassword: async ({ request, locals }) => {
		if (!locals.user) throw redirect(302, '/login');

		const data = await request.formData();
		const oldPassword = data.get('oldPassword');
		const newPassword = data.get('newPassword');

		if (typeof oldPassword !== 'string' || typeof newPassword !== 'string' || !oldPassword || !newPassword) {
			return fail(400, { missingPassword: true, message: 'Both old and new passwords are required' });
		}

		try {
			await container.updateUserUseCase.updatePassword({
				userId: locals.user.id,
				oldPassword,
				newPassword
			});
			return { success: true, message: 'Password updated successfully.' };
		} catch (err: any) {
			return fail(400, { error: true, message: err?.message || 'Failed to update password' });
		}
	}
};
