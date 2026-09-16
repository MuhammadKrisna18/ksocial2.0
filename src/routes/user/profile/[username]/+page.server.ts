import { error } from '@sveltejs/kit';
import { container } from '$lib/infrastructure/config/container';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const username = params.username;

	if (!username) {
		throw error(404, 'User not found');
	}

	try {
		// Dapatkan data user berdasarkan username
		const user = await container.userRepository.findByUsername(username);

		if (!user) {
			throw error(404, 'User not found');
		}

		// Dapatkan postingan dari user tersebut.
		const userPosts = await container.getUserPostsUseCase.execute(user.id, locals.user?.sub);
		
		// Konversi data untuk dikirim ke frontend
		const serializedPosts = userPosts.map(p => p.toJSON());

		// Dapatkan status follow
		let followStatus = 'none';
		if (locals.user?.sub && locals.user.sub !== user.id) {
			const statusResult = await container.getFollowStatusUseCase.execute({
				currentUser: locals.user.sub,
				targetUser: user.id
			});
			followStatus = statusResult.status;
		}

		// Get followers and following counts
		const followers = await container.followRepository.getFollowers(user.id);
		const following = await container.followRepository.getFollowing(user.id);
		const followersCount = followers.filter(f => f.status === 'accepted').length;
		const followingCount = following.filter(f => f.status === 'accepted').length;

		return {
			profile: {
				id: user.id,
				fullName: user.fullName,
				username: user.username.toString(),
				email: user.email.toString(),
				dateOfBirth: user.dateOfBirth.toISOString().split('T')[0],
				location: user.location,
				relationshipStatus: user.relationshipStatus,
				isPrivate: user.isPrivate,
				profilePictureUrl: user.profilePictureUrl,
				coverPhotoUrl: user.coverPhotoUrl,
				followersCount,
				followingCount
			},
			posts: serializedPosts,
			isCurrentUser: locals.user?.sub === user.id,
			followStatus
		};
	} catch (err) {
		console.error('Failed to load user profile:', err);
		throw error(404, 'User not found');
	}
};

export const actions = {
	follow: async ({ params, locals }) => {
		if (!locals.user?.sub) {
			return { success: false, error: 'Unauthorized' };
		}
		
		try {
			const targetUser = await container.userRepository.findByUsername(params.username);
			if (!targetUser) {
				return { success: false, error: 'User not found' };
			}

			await container.followUserUseCase.execute({
				followerId: locals.user.sub,
				followingId: targetUser.id
			});

			return { success: true };
		} catch (err: any) {
			console.error('Follow error:', err);
			return { success: false, error: err.message || 'Failed to follow user' };
		}
	}
};
