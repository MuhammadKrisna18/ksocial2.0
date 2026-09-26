import { eventDispatcher } from '$lib/infrastructure/events/DomainEventDispatcher';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ locals }) => {
	if (!locals.user) return new Response('Unauthorized', { status: 401 });

	let cleanup = () => {};
	const stream = new ReadableStream<Uint8Array>({
		start(controller) {
			const encoder = new TextEncoder();
			let closed = false;
			const close = () => {
				if (closed) return;
				closed = true;
				clearInterval(intervalId);
				eventDispatcher.unregister('MessageSentEvent', messageHandler);
			};
			const messageHandler = (event: any) => {
				const message = event.message;
				if (message.senderId !== locals.user?.sub && message.receiverId !== locals.user?.sub) return;
				try {
					const payload = {
						...message,
						senderName: event.sender?.fullName || 'User',
						senderUsername: event.sender?.username || '',
						senderAvatar: event.sender?.avatarUrl || null
					};
					controller.enqueue(encoder.encode(`event: message\ndata: ${JSON.stringify(payload)}\n\n`));
				} catch {
					close();
				}
			};

			eventDispatcher.register('MessageSentEvent', messageHandler);
			const intervalId = setInterval(() => {
				try {
					controller.enqueue(encoder.encode(': keepalive\n\n'));
				} catch {
					close();
				}
			}, 25_000);
			cleanup = close;
			controller.enqueue(encoder.encode('retry: 3000\n\n'));
		},
		cancel() {
			cleanup();
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream; charset=utf-8',
			'Cache-Control': 'no-cache, no-store, must-revalidate',
			'Connection': 'keep-alive',
			'X-Accel-Buffering': 'no'
		}
	});
};
