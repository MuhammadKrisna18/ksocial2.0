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

		// Only load posts if the account is public, current user is the owner, or an accepted follower
		const userPosts = canViewPrivateContent
			? await container.getUserPostsUseCase.execute(profile.id, locals.user?.sub)
			: [];

		return {
			profile: {
				id: profile.id,
				fullName: profile.fullName,
				username: profile.username,
				// Protect PII: Email is only visible to the account owner
				email: isCurrentUser ? profile.email : null,
				// Date of birth only if allowed to view private content
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
