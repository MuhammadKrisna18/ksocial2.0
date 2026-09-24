import { json } from '@sveltejs/kit';
import { container } from '$lib/infrastructure/config/container';
import { handleApplicationError } from '$lib/presentation/utils/response';
import type { RequestHandler } from './$types';
import { chatRateLimiter } from '$lib/infrastructure/security/RateLimiter';

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
		return handleApplicationError(error, 'Failed to fetch messages');
	}
};

export const POST: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	// Anti-spam / message flood rate limiting
	const rateCheck = chatRateLimiter.consume(locals.user.sub);
	if (!rateCheck.allowed) {
		return json(
			{
				error: `Terlalu banyak pesan terkirim. Mohon tunggu ${rateCheck.resetInSeconds} detik sebelum mengirim lagi.`
			},
			{
				status: 429,
				headers: {
					'Retry-After': rateCheck.resetInSeconds.toString(),
					...chatRateLimiter.getHeaders(rateCheck)
				}
			}
		);
	}

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
		return handleApplicationError(error, 'Failed to send message');
	}
};

export const PATCH: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	try {
		// senderId is params.userId, receiverId is current user (locals.user.sub)
		await container.markMessagesAsReadUseCase.execute(params.userId, locals.user.sub);
		return json({ success: true });
	} catch (error) {
		return handleApplicationError(error, 'Failed to mark messages as read');
	}
};

