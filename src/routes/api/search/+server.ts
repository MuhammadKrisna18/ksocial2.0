import { json } from '@sveltejs/kit';
import { container } from '$lib/infrastructure/config/container';

export async function GET({ url, locals }) {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const query = url.searchParams.get('q');
	if (!query) {
		return json([]);
	}

	try {
		const results = await container.searchUsersUseCase.execute(query, locals.user.sub);
		return json(results);
	} catch (error) {
		console.error('Error searching users:', error);
		return json({ error: 'Failed to search users' }, { status: 500 });
	}
}
