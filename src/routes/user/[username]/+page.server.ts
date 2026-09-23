import { error, redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { container } from '$lib/infrastructure/config/container';
import { handleActionError } from '$lib/presentation/utils/response';

export const load: PageServerLoad = async ({ params, locals }) => {
	const currentUserId = locals.user?.sub;
	if (!currentUserId) {
		throw redirect(302, '/auth/login');
	}

	const username = params.username;

	let targetProfile;
	try {
		targetProfile = await container.getUserProfileUseCase.execute({
			targetUsername: username,
			currentUserId
		});
	} catch (err) {
		throw error(404, 'User not found');
	}

	// Check if the user is trying to view their own profile
	if (targetProfile.isCurrentUser) {
		throw redirect(302, '/user/profile');
	}

	let posts: any[] = [];
	if (targetProfile.canViewPosts) {
		posts = await container.getUserPostsUseCase.execute(currentUserId, targetProfile.id);
	}

	return {
		user: locals.user,
		targetProfile: {
			id: targetProfile.id,
			username: targetProfile.username,
			fullName: targetProfile.fullName,
			profilePictureUrl: targetProfile.profilePictureUrl,
			coverPhotoUrl: targetProfile.coverPhotoUrl,
			location: targetProfile.location,
			relationshipStatus: targetProfile.relationshipStatus,
			isPrivate: targetProfile.isPrivate,
			createdAt: targetProfile.createdAt
		},
		followStatus: targetProfile.followStatus,
		canViewPosts: targetProfile.canViewPosts,
		posts
	};
};

export const actions: Actions = {
	follow: async ({ locals, params }) => {
		const currentUserId = locals.user?.sub;
		if (!currentUserId) throw redirect(302, '/auth/login');

		try {
			await container.followUserUseCase.execute({
				followerId: currentUserId,
				followingUsername: params.username
			});
			return { success: true };
		} catch (e: any) {
			return handleActionError(e, 'Failed to follow user');
		}
	},

	unfollow: async ({ locals, params }) => {
		const currentUserId = locals.user?.sub;
		if (!currentUserId) throw redirect(302, '/auth/login');

		try {
			await container.unfollowUserUseCase.execute({
				followerId: currentUserId,
				followingUsername: params.username
			});
			return { success: true };
		} catch (e: any) {
			return handleActionError(e, 'Failed to unfollow user');
		}
	},
	
	toggleSave: async ({ request, locals }) => {
		const user = locals.user;
		if (!user) {
			throw redirect(302, '/auth/login');
		}

		const data = await request.formData();
		const postId = data.get('postId')?.toString();

		if (!postId) {
			return fail(400, { success: false, message: 'Missing post id' });
		}

		try {
			await container.toggleSavePostUseCase.execute(user.sub, postId);
			return { success: true };
		} catch (err: any) {
			return handleActionError(err, 'Failed to toggle save post');
		}
	}
};
