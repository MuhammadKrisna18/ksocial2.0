import { json } from '@sveltejs/kit';
import { container } from '$lib/infrastructure/config/container';
import type { RequestEvent } from './$types';

export async function GET({ params, locals }: RequestEvent) {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	
	try {
		const following = await container.getFollowingDetailsUseCase.execute(params.id);
		
		return json({ 
			success: true,
			following
		});
	} catch (error) {
		console.error('Failed to fetch following', error);
		return json({ error: 'Failed to fetch following' }, { status: 500 });
	}
}
