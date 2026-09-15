import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { container } from '$lib/infrastructure/config/container';
import { db } from '$lib/infrastructure/database/client';
import { users } from '$lib/infrastructure/database/schema/users';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	const currentUserId = locals.user?.sub;
	if (!currentUserId) {
		throw redirect(302, '/auth/login');
	}

	const username = params.username;

	// Check if the user is trying to view their own profile
	const currentUser = await container.userRepository.findById(currentUserId);
	if (currentUser?.username === username) {
		throw redirect(302, '/user/profile');
	}

	const targetUser = await container.userRepository.findByUsername(username);
	if (!targetUser) {
		throw error(404, 'User not found');
	}

	const followStatus = await container.getFollowStatusUseCase.execute({
		currentUser: currentUserId,
		targetUser: targetUser.id
	});

	// Get posts (only if they are friends, or if targetUser is public, or we just want to show them anyway if they are friends)
	// Usually, if private and not friends, posts are hidden.
	const canViewPosts = !targetUser.isPrivate || followStatus.status === 'friends';
	
	let posts: any[] = [];
	if (canViewPosts) {
		posts = await container.getUserPostsUseCase.execute(currentUserId, targetUser.id);
	}

	return {
		user: locals.user,
		targetProfile: {
			id: targetUser.id,
			username: targetUser.username,
			fullName: targetUser.fullName,
			profilePictureUrl: targetUser.profilePictureUrl,
			coverPhotoUrl: targetUser.coverPhotoUrl,
			location: targetUser.location,
			relationshipStatus: targetUser.relationshipStatus,
			isPrivate: targetUser.isPrivate,
			createdAt: targetUser.createdAt
		},
		followStatus: followStatus.status,
		canViewPosts,
		posts: posts.map(p => (typeof p.toJSON === 'function' ? p.toJSON() : p))
	};
};

export const actions: Actions = {
	follow: async ({ request, locals, params }) => {
		const currentUserId = locals.user?.sub;
		if (!currentUserId) throw redirect(302, '/auth/login');

		const targetUser = await container.userRepository.findByUsername(params.username);
		if (!targetUser) return fail(404, { message: 'User not found' });

		try {
			await container.followUserUseCase.execute({
				followerId: currentUserId,
				followingId: targetUser.id
			});
			return { success: true };
		} catch (e: any) {
			return fail(400, { message: e.message });
		}
	},

	unfollow: async ({ request, locals, params }) => {
		const currentUserId = locals.user?.sub;
		if (!currentUserId) throw redirect(302, '/auth/login');

		const targetUser = await container.userRepository.findByUsername(params.username);
		if (!targetUser) return fail(404, { message: 'User not found' });

		try {
			await container.followRepository.delete(currentUserId, targetUser.id);
			return { success: true };
		} catch (e: any) {
			return fail(400, { message: e.message });
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
			return fail(400, { success: false, message: err.message });
		}
	}
};
