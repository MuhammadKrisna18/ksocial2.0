import { json } from '@sveltejs/kit';
import { container } from '$lib/infrastructure/config/container';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	try {
		const contacts = await container.getChatContactsUseCase.execute(locals.user.sub);
		return json({ contacts });
	} catch (error) {
		return json({ error: error instanceof Error ? error.message : 'Failed to fetch contacts' }, { status: 500 });
	}
};
