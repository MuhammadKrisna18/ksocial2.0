import type { PageServerLoad, Actions } from './$types';
import { container } from '$lib/infrastructure/config/container';
import { fail } from '@sveltejs/kit';
import { handleActionError } from '$lib/presentation/utils/response';

export const load: PageServerLoad = async () => {
	const posts = await container.getFeedUseCase.execute();
	
	// Convert entities to JSON objects
	return {
		posts: posts.map(p => p.toJSON())
	};
};

export const actions: Actions = {
	createPost: async ({ request, locals }) => {
		const userId = locals.user?.sub;
		if (!userId) {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const content = data.get('content')?.toString() || '';

		if (!content.trim()) {
			return fail(400, { error: 'Post content cannot be empty', content });
		}

		try {
			await container.createPostUseCase.execute({
				userId,
				content
			});
			return { success: true };
		} catch (error) {
			return handleActionError(error, 'Failed to create post', { content });
		}
	}
};
