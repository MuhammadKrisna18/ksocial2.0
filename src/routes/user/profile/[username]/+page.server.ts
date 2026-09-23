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

		// Dapatkan postingan dari user tersebut
		const userPosts = await container.getUserPostsUseCase.execute(profile.id, locals.user?.sub);

		return {
			profile: {
				id: profile.id,
				fullName: profile.fullName,
				username: profile.username,
				email: profile.email,
				dateOfBirth: profile.dateOfBirth.toISOString().split('T')[0],
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
		} catch (err: any) {
			console.error('Follow error:', err);
			return { success: false, error: err.message || 'Failed to follow user' };
		}
	}
};
