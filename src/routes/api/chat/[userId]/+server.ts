import { json } from '@sveltejs/kit';
import { container } from '$lib/infrastructure/config/container';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
	const user = locals.user;
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const targetUserId = params.userId;
		const messages = await container.getMessagesUseCase.execute(user.sub, targetUserId);
		return json({ messages });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ params, request, locals }) => {
	const user = locals.user;
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const targetUserId = params.userId;
		const body = await request.json();
		
		if (!body.content || typeof body.content !== 'string') {
			return json({ error: 'Invalid content' }, { status: 400 });
		}

		const message = await container.sendMessageUseCase.execute(user.sub, targetUserId, body.content.trim());
		return json({ message }, { status: 201 });
	} catch (error: any) {
		return json({ error: error.message }, { status: 403 }); // 403 for forbidden due to privacy
	}
};
