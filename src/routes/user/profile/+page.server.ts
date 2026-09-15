import type { PageServerLoad, Actions } from './$types';
import { container } from '$lib/infrastructure/config/container';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	// User is guaranteed to exist due to hooks.server.ts protection
	const user = await container.userRepository.findById(locals.user!.sub);
	
	if (!user) {
		// Edge case: token is valid but user deleted from DB
		return {
			profile: null
		};
	}

	return {
		profile: {
			fullName: user.fullName,
			username: user.username,
			email: user.email,
			dateOfBirth: user.dateOfBirth.toISOString().split('T')[0] // Format for input type="date"
		}
	};
};

export const actions: Actions = {
	updateProfile: async ({ request, locals }) => {
		const data = await request.formData();
		const fullName = data.get('fullName')?.toString() || '';
		const username = data.get('username')?.toString() || '';
		const dateOfBirthStr = data.get('dateOfBirth')?.toString() || '';

		if (!fullName || !username || !dateOfBirthStr) {
			return fail(400, {
				success: false,
				message: 'Semua field (Nama, Username, Tanggal Lahir) harus diisi.'
			});
		}

		try {
			const dateOfBirth = new Date(dateOfBirthStr);
			await container.updateUserUseCase.updateProfile({
				userId: locals.user!.sub,
				fullName,
				newUsername: username,
				dateOfBirth
			});

			return { successProfile: true, message: 'Profil berhasil diperbarui!' };
		} catch (error: any) {
			return fail(400, {
				successProfile: false,
				message: error.message || 'Terjadi kesalahan saat memperbarui profil.'
			});
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
			return fail(400, {
				successPassword: false,
				message: error.message || 'Gagal merubah password. Pastikan password lama Anda benar.'
			});
		}
	}
};
