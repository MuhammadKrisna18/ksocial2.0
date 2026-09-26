import { redirect } from '@sveltejs/kit';
import { container } from '$lib/infrastructure/config/container';
import type { PageServerLoad, Actions } from './$types';
import { handleActionError } from '$lib/presentation/utils/response';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.sub;
	if (!userId) {
		throw redirect(302, '/auth/login');
	}

	let user = null;
	try {
		user = await container.getUserByIdUseCase.execute(userId);
	} catch {
		throw redirect(302, '/auth/login');
	}

	return {
		isPrivate: user.isPrivate ?? false,
		requireFollowForMessage: user.requireFollowForMessage ?? false,
		userId
	};
};

export const actions: Actions = {
	updatePrivacy: async ({ request, locals }) => {
		const userId = locals.user?.sub;
		if (!userId) {
			return { success: false, error: 'Unauthorized' };
		}

		const data = await request.formData();
		const isPrivate = data.get('isPrivate') === 'true';
		const requireFollowForMessage = data.get('requireFollowForMessage') === 'true';

		try {
			await container.updateUserUseCase.updatePrivacy({
				userId,
				isPrivate,
				requireFollowForMessage
			});
			return { success: true };
		} catch (error) {
			return handleActionError(error, 'Failed to update privacy settings', { success: false });
		}
	},

	updatePassword: async ({ request, locals }) => {
		const data = await request.formData();
		const oldPassword = data.get('oldPassword')?.toString() || '';
		const newPassword = data.get('newPassword')?.toString() || '';
		const confirmPassword = data.get('confirmPassword')?.toString() || '';

		if (!oldPassword || !newPassword || !confirmPassword) {
			return fail(400, {
				successPassword: false,
				message: 'All password fields are required.'
			});
		}

		if (newPassword !== confirmPassword) {
			return fail(400, {
				successPassword: false,
				message: 'New password and confirm password do not match.'
			});
		}

		try {
			await container.updateUserUseCase.updatePassword({
				userId: locals.user!.sub,
				oldPassword,
				newPassword
			});

			return { successPassword: true, message: 'Password changed successfully!' };
		} catch (error: any) {
			return handleActionError(error, 'Failed to change password. Make sure your current password is correct.', { successPassword: false });
		}
	}
};
