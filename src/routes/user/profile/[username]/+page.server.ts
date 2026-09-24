import { error } from '@sveltejs/kit';
import { container } from '$lib/infrastructure/config/container';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const username = params.username;

	if (!username) {
		throw error(404, 'User not found');
	}

	try {
		const profile = await container.getUserProfileUseCase.execute({
			targetUsername: username,
			currentUserId: locals.user?.sub
		});

		const isCurrentUser = profile.isCurrentUser;
		const canViewPrivateContent =
			isCurrentUser ||
			!profile.isPrivate ||
			profile.followStatus === 'following' ||
			profile.followStatus === 'friends';

		// Hanya muat postingan jika akun publik, pemilik akun, atau follower yang sudah diterima
		const userPosts = canViewPrivateContent
			? await container.getUserPostsUseCase.execute(profile.id, locals.user?.sub)
			: [];

		return {
			profile: {
				id: profile.id,
				fullName: profile.fullName,
				username: profile.username,
				// Lindungi PII: Email hanya untuk pemilik akun
				email: isCurrentUser ? profile.email : null,
				// Tanggal lahir hanya jika diizinkan melihat konten pribadi
				dateOfBirth:
					(isCurrentUser || canViewPrivateContent) && profile.dateOfBirth
						? profile.dateOfBirth.toISOString().split('T')[0]
						: null,
				location: profile.location,
				relationshipStatus: profile.relationshipStatus,
				isPrivate: profile.isPrivate,
				profilePictureUrl: profile.profilePictureUrl,
				coverPhotoUrl: profile.coverPhotoUrl,
				followersCount: profile.followersCount,
				followingCount: profile.followingCount
			},
			posts: userPosts,
			isCurrentUser: profile.isCurrentUser,
			followStatus: profile.followStatus
		};
	} catch (err) {
		console.error('Failed to load user profile:', err);
		throw error(404, 'User not found');
	}
};

export const actions: Actions = {
	follow: async ({ params, locals }) => {
		if (!locals.user?.sub) {
			return { success: false, error: 'Unauthorized' };
		}
		
		try {
			await container.followUserUseCase.execute({
				followerId: locals.user.sub,
				followingUsername: params.username
			});

			return { success: true };
		} catch (err) {
			console.error('Follow error:', err);
			const message = err instanceof Error ? err.message : 'Failed to follow user';
			return { success: false, error: message };
		}
	}
};
