import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { container } from '$lib/infrastructure/config/container';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const posts = await container.getFeedUseCase.execute();

	return {
		user: locals.user,
		posts
	};
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		const data = await request.formData();
		const postId = data.get('postId')?.toString();

		if (!postId) {
			return fail(400, { missingPostId: true, message: 'Post ID is required' });
		}

		try {
			await container.adminDeletePostUseCase.execute(postId, locals.user.sub);
			return { success: true, message: 'Postingan berhasil dihapus dan pemberitahuan telah dikirimkan ke pengguna.' };
		} catch (err: any) {
			return fail(400, { error: true, message: err?.message || 'Gagal menghapus postingan' });
		}
	}
};
