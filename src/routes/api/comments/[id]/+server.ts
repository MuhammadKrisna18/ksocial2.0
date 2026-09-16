import { json } from '@sveltejs/kit';
import { container } from '$lib/infrastructure/config/container';
import type { RequestEvent } from './$types';

export async function DELETE({ params, cookies }: RequestEvent) {
	const token = cookies.get('session');
	
	if (!token) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	
	try {
		const payload = await container.validateTokenUseCase.execute(token);
		
		const success = await container.deleteCommentUseCase.execute(params.id, payload.sub);
		
		if (!success) {
			return json({ error: 'Unauthorized or not found' }, { status: 403 });
		}

		return json({ success: true });
	} catch (error) {
		return json({ error: 'Failed to delete comment' }, { status: 500 });
	}
}
