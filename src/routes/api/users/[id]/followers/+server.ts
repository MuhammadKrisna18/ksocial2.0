import { json } from '@sveltejs/kit';
import { container } from '$lib/infrastructure/config/container';
import type { RequestEvent } from './$types';

export async function GET({ params, locals }: RequestEvent) {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	
	try {
		const followers = await container.getFollowersDetailsUseCase.execute(params.id);
		
		return json({ 
			success: true,
			followers
		});
	} catch (error) {
		console.error('Failed to fetch followers', error);
		return json({ error: 'Failed to fetch followers' }, { status: 500 });
	}
}
