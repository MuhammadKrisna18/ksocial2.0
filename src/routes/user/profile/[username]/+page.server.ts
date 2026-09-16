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

		// (Opsional) Dapatkan postingan dari user tersebut.
		// Untuk sementara kita mungkin hanya melempar user profile.
		const posts = await container.postRepository.getFeed();
		const userPosts = posts.filter(p => p.authorId === user.id).map(p => ({
			id: p.id,
			content: p.content,
			createdAt: p.createdAt.toISOString()
		}));

		// Dapatkan status follow
		let followStatus = 'none';
		if (locals.user?.sub && locals.user.sub !== user.id) {
			const statusResult = await container.getFollowStatusUseCase.execute({
				currentUser: locals.user.sub,
				targetUser: user.id
			});
			followStatus = statusResult.status;
		}

		return {
			profile: {
				id: user.id,
				fullName: user.fullName,
				username: user.username.toString(),
				email: user.email.toString(),
				isPrivate: user.isPrivate
			},
			posts: userPosts,
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
