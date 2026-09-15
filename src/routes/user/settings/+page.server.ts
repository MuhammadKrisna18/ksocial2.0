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

	const user = await container.userRepository.findById(userId);
	
	

	return {
		isPrivate: user?.isPrivate ?? false,
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

		try {
			await container.updateUserUseCase.updatePrivacy({
				userId,
				isPrivate
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
				message: 'Semua kolom password wajib diisi.'
			});
		}

		if (newPassword !== confirmPassword) {
			return fail(400, {
				successPassword: false,
				message: 'Password baru dan konfirmasi password tidak cocok.'
			});
		}

		try {
			await container.updateUserUseCase.updatePassword({
				userId: locals.user!.sub,
				oldPassword,
				newPassword
			});

			return { successPassword: true, message: 'Password berhasil diubah!' };
		} catch (error: any) {
			return handleActionError(error, 'Gagal merubah password. Pastikan password lama Anda benar.', { successPassword: false });
		}
	}
};
