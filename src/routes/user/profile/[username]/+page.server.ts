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

		return {
			profile: {
				id: user.id,
				fullName: user.fullName,
				username: user.username,
				email: user.email,
				isPrivate: user.isPrivate
			},
			posts: userPosts,
			isCurrentUser: locals.user?.sub === user.id
		};
	} catch (err) {
		console.error('Failed to load user profile:', err);
		throw error(404, 'User not found');
	}
};
