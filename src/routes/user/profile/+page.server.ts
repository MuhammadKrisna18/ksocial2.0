import type { PageServerLoad, Actions } from './$types';
import { container } from '$lib/infrastructure/config/container';
import { fail } from '@sveltejs/kit';
import { handleActionError } from '$lib/presentation/utils/response';
import { localFileStorage } from '$lib/infrastructure/storage/LocalFileStorage';
import crypto from 'crypto';

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
			dateOfBirth: user.dateOfBirth.toISOString().split('T')[0], // Format for input type="date"
			profilePictureUrl: user.profilePictureUrl,
			coverPhotoUrl: user.coverPhotoUrl
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
			return handleActionError(error, 'Terjadi kesalahan saat memperbarui profil.', { successProfile: false });
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
	},

	uploadProfilePicture: async ({ request, locals }) => {
		const data = await request.formData();
		const file = data.get('file') as File;

		if (!file || !file.size) {
			return fail(400, { successPhoto: false, message: 'File tidak ditemukan.' });
		}

		try {
			const ext = file.name.split('.').pop() || 'png';
			const filename = `avatar_${locals.user!.sub}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
			const url = await localFileStorage.saveFile(file, filename);

			await container.updateUserUseCase.updatePhotos({
				userId: locals.user!.sub,
				profilePictureUrl: url
			});

			return { successPhoto: true, message: 'Foto profil berhasil diperbarui!' };
		} catch (error: any) {
			return handleActionError(error, 'Gagal mengunggah foto profil.', { successPhoto: false });
		}
	},

	uploadCoverPhoto: async ({ request, locals }) => {
		const data = await request.formData();
		const file = data.get('file') as File;

		if (!file || !file.size) {
			return fail(400, { successPhoto: false, message: 'File tidak ditemukan.' });
		}

		try {
			const ext = file.name.split('.').pop() || 'png';
			const filename = `cover_${locals.user!.sub}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
			const url = await localFileStorage.saveFile(file, filename);

			await container.updateUserUseCase.updatePhotos({
				userId: locals.user!.sub,
				coverPhotoUrl: url
			});

			return { successPhoto: true, message: 'Foto sampul berhasil diperbarui!' };
		} catch (error: any) {
			return handleActionError(error, 'Gagal mengunggah foto sampul.', { successPhoto: false });
		}
	},

	deleteProfilePicture: async ({ locals }) => {
		try {
			const user = await container.userRepository.findById(locals.user!.sub);
			if (user?.profilePictureUrl) {
				await localFileStorage.deleteFileByUrl(user.profilePictureUrl);
			}

			await container.updateUserUseCase.updatePhotos({
				userId: locals.user!.sub,
				profilePictureUrl: null
			});

			return { successPhoto: true, message: 'Foto profil berhasil dihapus!' };
		} catch (error: any) {
			return handleActionError(error, 'Gagal menghapus foto profil.', { successPhoto: false });
		}
	},

	deleteCoverPhoto: async ({ locals }) => {
		try {
			const user = await container.userRepository.findById(locals.user!.sub);
			if (user?.coverPhotoUrl) {
				await localFileStorage.deleteFileByUrl(user.coverPhotoUrl);
			}

			await container.updateUserUseCase.updatePhotos({
				userId: locals.user!.sub,
				coverPhotoUrl: null
			});

			return { successPhoto: true, message: 'Foto sampul berhasil dihapus!' };
		} catch (error: any) {
			return handleActionError(error, 'Gagal menghapus foto sampul.', { successPhoto: false });
		}
	}
};
