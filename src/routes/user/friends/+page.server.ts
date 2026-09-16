import { redirect } from '@sveltejs/kit';
import { container } from '$lib/infrastructure/config/container';
import type { PageServerLoad } from './$types';

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
