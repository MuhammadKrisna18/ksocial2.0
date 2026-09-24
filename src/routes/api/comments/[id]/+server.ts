import { json } from '@sveltejs/kit';
import { container } from '$lib/infrastructure/config/container';
import type { RequestEvent } from './$types';

export async function DELETE({ params, locals }: RequestEvent) {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const success = await container.deleteCommentUseCase.execute(params.id, locals.user.sub);

		if (!success) {
			return json({ error: 'Unauthorized or not found' }, { status: 403 });
		}

		return json({ success: true });
	} catch {
		return json({ error: 'Failed to delete comment' }, { status: 500 });
	}
}
