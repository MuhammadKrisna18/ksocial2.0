import { json } from '@sveltejs/kit';
import { container } from '$lib/infrastructure/config/container';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	const user = locals.user;
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const contacts = await container.getChatContactsUseCase.execute(user.sub);
		return json({ contacts });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};
