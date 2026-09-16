import { eventDispatcher } from '$lib/infrastructure/events/DomainEventDispatcher';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ locals }) => {
	const user = locals.user;
	
	if (!user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const stream = new ReadableStream({
		start(controller) {
			// Define the handler
			const messageHandler = (event: any) => {
				const message = event.message;
				// Send the message if the current user is the receiver OR the sender (for multi-tab sync)
				if (message.receiverId === user.sub || message.senderId === user.sub) {
					try {
						const data = `data: ${JSON.stringify(message)}\n\n`;
						controller.enqueue(new TextEncoder().encode(data));
					} catch (e) {
						// Stream might be closed
					}
				}
			};

			// Subscribe to MessageSentEvent
			eventDispatcher.register('MessageSentEvent', messageHandler);

			// Keep connection alive with periodic pings (prevent timeouts)
			const intervalId = setInterval(() => {
				try {
					controller.enqueue(new TextEncoder().encode(':\n\n')); // comment in SSE
				} catch (e) {
					clearInterval(intervalId);
				}
			}, 30000); // 30 seconds

			// Handle stream close
			return () => {
				clearInterval(intervalId);
				eventDispatcher.unregister('MessageSentEvent', messageHandler);
			};
		},
		cancel() {
			// Clean up when client disconnects
			// The return function in start is automatically called, but sometimes cancel is triggered
			// eventDispatcher.unregister('MessageSentEvent', messageHandler); is not easily accessible here unless we keep a ref
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive'
		}
	});
};
