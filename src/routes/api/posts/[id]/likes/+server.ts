import { json } from '@sveltejs/kit';
import { container } from '$lib/infrastructure/config/container';
import type { RequestEvent } from './$types';

export async function GET({ params, locals }: RequestEvent) {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	
	try {
		const likes = await container.getPostLikesUseCase.execute(params.id);
		
		return json({ 
			success: true,
			likes
		});
	} catch (error) {
		console.error('Failed to fetch likes', error);
		return json({ error: 'Failed to fetch likes' }, { status: 500 });
	}
}
