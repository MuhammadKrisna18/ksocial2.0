import { json } from '@sveltejs/kit';
import { container } from '$lib/infrastructure/config/container';
import type { RequestEvent } from './$types';

export async function POST({ params, locals }: RequestEvent) {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const post = await container.sharePostUseCase.execute(params.id);

		return json({
			success: true,
			sharesCount: post.sharesCount
		});
	} catch {
		return json({ error: 'Failed to share post' }, { status: 500 });
	}
}
