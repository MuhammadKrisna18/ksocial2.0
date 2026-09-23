import type { PageServerLoad, Actions } from './$types';
import { container } from '$lib/infrastructure/config/container';
import { fail, redirect } from '@sveltejs/kit';
import { handleActionError } from '$lib/presentation/utils/response';
import { localFileStorage, postFileStorage } from '$lib/infrastructure/storage/LocalFileStorage';
import crypto from 'crypto';

export const load: PageServerLoad = async ({ locals }) => {
	let profile;
	try {
		profile = await container.getUserProfileUseCase.execute({
			targetUserId: locals.user!.sub,
			currentUserId: locals.user!.sub
		});
	} catch {
		throw redirect(302, '/auth/login');
	}

	const posts = await container.getUserPostsUseCase.execute(locals.user!.sub, locals.user!.sub);

	return {
		user: locals.user,
		profile: {
			id: profile.id,
			fullName: profile.fullName,
			username: profile.username,
			email: profile.email,
			dateOfBirth: profile.dateOfBirth.toISOString().split('T')[0], // Format for input type="date"
			location: profile.location,
			relationshipStatus: profile.relationshipStatus,
			isPrivate: profile.isPrivate,
			profilePictureUrl: profile.profilePictureUrl,
			coverPhotoUrl: profile.coverPhotoUrl,
			followersCount: profile.followersCount,
			followingCount: profile.followingCount
		},
		posts,
		isCurrentUser: true
	};
};

export const actions: Actions = {
	createPost: async ({ request, locals }) => {
		const userId = locals.user?.sub;
		if (!userId) {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const content = data.get('content')?.toString() || '';
		const files = data.getAll('media') as File[];

		if (!content.trim() && (!files.length || files[0].size === 0)) {
			return fail(400, { error: 'Post content cannot be empty', content });
		}

		let media: { url: string; type: 'image' | 'video' }[] = [];

		if (files.length > 0 && files[0].size > 0) {
			for (const file of files) {
				const ext = file.name.split('.').pop() || '';
				const filename = `post_${userId}_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
				const url = await postFileStorage.saveFile(file, filename);
				const type = file.type.startsWith('video/') ? 'video' : 'image';
				media.push({ url, type });
			}
		}

		try {
			await container.createPostUseCase.execute({
				userId,
				content,
				media: media.length > 0 ? media : undefined
			});
			return { success: true };
		} catch (error) {
			return handleActionError(error, 'Failed to create post', { content });
		}
	},

	updateProfile: async ({ request, locals }) => {
		const data = await request.formData();
		const fullName = data.get('fullName')?.toString() || '';
		const username = data.get('username')?.toString() || '';
		const dateOfBirthStr = data.get('dateOfBirth')?.toString() || '';
		const location = data.get('location')?.toString() || '';
		const relationshipStatus = data.get('relationshipStatus')?.toString() || '';
		const isPrivate = data.get('isPrivate') === 'on';

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
				dateOfBirth,
				location: location || undefined,
				relationshipStatus: relationshipStatus || undefined,
				isPrivate
			});

			return { successProfile: true, message: 'Profil berhasil diperbarui!' };
		} catch (error: any) {
			return handleActionError(error, 'Terjadi kesalahan saat memperbarui profil.', { successProfile: false });
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
			const user = await container.getUserByIdUseCase.execute(locals.user!.sub);
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
			const user = await container.getUserByIdUseCase.execute(locals.user!.sub);
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
	},

	toggleSave: async ({ request, locals }) => {
		const userId = locals.user?.sub;
		if (!userId) {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const postId = data.get('postId')?.toString();

		if (!postId) {
			return fail(400, { error: 'Post ID is required' });
		}

		try {
			await container.toggleSavePostUseCase.execute(userId, postId);
			return { success: true };
		} catch (error) {
			return handleActionError(error, 'Failed to toggle save post');
		}
	},
	deletePost: async ({ request, locals }) => {
		const userId = locals.user?.sub;
		if (!userId) return fail(401, { error: 'Unauthorized' });

		const data = await request.formData();
		const postId = data.get('postId')?.toString();

		if (!postId) return fail(400, { error: 'Post ID is required' });

		try {
			await container.deletePostUseCase.execute(postId, userId);
			return { success: true };
		} catch (error) {
			return handleActionError(error, 'Failed to delete post');
		}
	}
};
