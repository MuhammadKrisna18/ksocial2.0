import { fail, redirect } from '@sveltejs/kit';
import { container } from '$lib/infrastructure/config/container';
import { handleActionError } from '$lib/presentation/utils/response';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.sub;
	if (!userId) {
		throw redirect(302, '/auth/login');
	}

	try {
		// Dapatkan daftar semua user selain user yang sedang login
		const allUsers = await container.getUsersUseCase.execute(userId);
		
		// Filter profil admin agar tidak tampil di halaman user
		const users = allUsers.filter(u => !u.roles.includes('admin'));

		const followersToFollowBack: any[] = [];
		const mutualFriends: any[] = [];
		const otherUsers: any[] = [];

		for (const u of users) {
			const statusRes = await container.getFollowStatusUseCase.execute({
				currentUser: userId,
				targetUser: u.id
			});
			
			const mappedUser = {
				id: u.id,
				username: u.username.toString(),
				fullName: u.fullName,
				profilePictureUrl: u.profilePictureUrl,
				followStatus: statusRes.status
			};

			if (statusRes.status === 'friends') {
				mutualFriends.push(mappedUser);
			} else if (statusRes.status === 'follows_you') {
				followersToFollowBack.push(mappedUser);
			} else {
				otherUsers.push(mappedUser);
			}
		}

		return {
			followersToFollowBack,
			mutualFriends,
			otherUsers
		};
	} catch (error) {
		console.error('Failed to load users for friends page:', error);
		return {
			followersToFollowBack: [],
			mutualFriends: [],
			otherUsers: []
		};
	}
};

export const actions: Actions = {
	follow: async ({ request, locals }) => {
		const currentUserId = locals.user?.sub;
		if (!currentUserId) throw redirect(302, '/auth/login');

		const formData = await request.formData();
		const targetUserId = formData.get('userId')?.toString();
		const targetUsername = formData.get('username')?.toString();

		if (!targetUserId && !targetUsername) {
			return fail(400, { error: 'Target user is required' });
		}

		try {
			await container.followUserUseCase.execute({
				followerId: currentUserId,
				followingId: targetUserId,
				followingUsername: targetUsername
			});
			return { success: true };
		} catch (e: any) {
			return handleActionError(e, 'Failed to follow user');
		}
	},

	unfollow: async ({ request, locals }) => {
		const currentUserId = locals.user?.sub;
		if (!currentUserId) throw redirect(302, '/auth/login');

		const formData = await request.formData();
		const targetUserId = formData.get('userId')?.toString();
		const targetUsername = formData.get('username')?.toString();

		if (!targetUserId && !targetUsername) {
			return fail(400, { error: 'Target user is required' });
		}

		try {
			await container.unfollowUserUseCase.execute({
				followerId: currentUserId,
				followingId: targetUserId,
				followingUsername: targetUsername
			});
			return { success: true };
		} catch (e: any) {
			return handleActionError(e, 'Failed to unfollow user');
		}
	}
};

