import { json } from '@sveltejs/kit';
import { container } from '$lib/infrastructure/config/container';
import type { RequestEvent } from './$types';

export async function POST({ params, cookies }: RequestEvent) {
	const token = cookies.get('session');
	
	if (!token) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	
	try {
		await container.validateTokenUseCase.execute(token);
		
		const post = await container.sharePostUseCase.execute(params.id);
		
		return json({ 
			success: true,
			sharesCount: post.sharesCount
		});
	} catch (error) {
		return json({ error: 'Failed to share post' }, { status: 500 });
	}
}
