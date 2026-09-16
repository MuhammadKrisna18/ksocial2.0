import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { container } from '$lib/infrastructure/config/container';

export const GET: RequestHandler = async ({ params, locals }) => {
	const postId = params.id;
	if (!postId) {
		return json({ error: 'Post ID is required' }, { status: 400 });
	}

	try {
		const userId = locals.user?.sub;
		const comments = await container.getCommentsUseCase.execute(postId, userId);
		return json({ comments: comments.map(c => c.toJSON()) });
	} catch (error: any) {
		console.error('Get comments error:', error);
		return json({ error: 'Failed to get comments' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ params, request, locals }) => {
	const userId = locals.user?.sub;
	if (!userId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const postId = params.id;
	if (!postId) {
		return json({ error: 'Post ID is required' }, { status: 400 });
	}

	try {
		if (!locals.user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}
		
		const body = await request.json();
		const data = body;
		const content = data.content?.trim();
		const parentId = data.parentId;

		if (!content) {
			return json({ error: 'Comment content cannot be empty' }, { status: 400 });
		}

		const comment = await container.addCommentUseCase.execute(userId, postId, content, parentId);
		
		// To return with author info, we could either fetch the user info in the use case
		// or just append the current user's info to the returned comment here.
		// For simplicity, let's just return the created comment. The frontend can 
		// optimistically add the current user's name to it.
		return json({ 
			comment: {
				...comment.toJSON(),
				authorName: locals.user.username,
				authorUsername: locals.user.username,
				authorProfilePicture: null
			}
		});
	} catch (error: any) {
		console.error('Add comment error:', error);
		return json({ error: 'Failed to add comment' }, { status: 500 });
	}
};
