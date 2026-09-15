import { ApplicationError } from '$lib/application/exceptions';

export function jsonResponse(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json' }
	});
}

export function errorResponse(message: string, status = 400): Response {
	return jsonResponse({ error: message }, status);
}

import { fail } from '@sveltejs/kit';

export function handleApplicationError(err: unknown, defaultMessage = 'Internal Server Error'): Response {
	if (err instanceof ApplicationError) {
		return errorResponse(err.message, err.statusCode);
	}
	const message = err instanceof Error ? err.message : defaultMessage;
	return errorResponse(message, 500);
}

export function handleActionError(err: unknown, defaultMessage = 'An error occurred', additionalData: Record<string, unknown> = {}) {
	if (err instanceof ApplicationError) {
		return fail(err.statusCode, { ...additionalData, success: false, error: err.message, message: err.message });
	}
	const message = err instanceof Error ? err.message : defaultMessage;
	return fail(500, { ...additionalData, success: false, error: message, message });
}
