import { json } from '@sveltejs/kit';
import { container } from '$lib/infrastructure/config/container';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const targetUserId = params.userId;
	const url = new URL(request.url);
	const parsedLimit = Number(url.searchParams.get('limit') ?? 50);
	const parsedOffset = Number(url.searchParams.get('offset') ?? 0);
	const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(Math.trunc(parsedLimit), 1), 200) : 50;
	const offset = Number.isFinite(parsedOffset) ? Math.max(Math.trunc(parsedOffset), 0) : 0;

	try {
		const messages = await container.getMessagesUseCase.execute(locals.user.sub, targetUserId, limit, offset);
		return json({ messages, limit, offset });
	} catch (error) {
		return json({ error: error instanceof Error ? error.message : 'Failed to fetch messages' }, { status: 400 });
	}
};

export const POST: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const content = typeof body === 'object' && body !== null && 'content' in body ? (body as { content?: unknown }).content : undefined;
	if (typeof content !== 'string' || !content.trim()) return json({ error: 'Message cannot be empty' }, { status: 400 });
	if (content.trim().length > 1000) return json({ error: 'Message is too long. Maximum 1000 characters.' }, { status: 400 });

	try {
		const message = await container.sendMessageUseCase.execute(locals.user.sub, params.userId, content);
		return json({ message }, { status: 201 });
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to send message';
		const status = message.includes('follow') || message.includes('accepted') ? 403 : 400;
		return json({ error: message }, { status });
	}
};
