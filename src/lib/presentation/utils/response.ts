import { 
	ApplicationError,
	NotFoundError,
	ValidationError,
	AuthenticationError,
	AuthorizationError,
	ConflictError
} from '$lib/application/exceptions';
import { fail } from '@sveltejs/kit';

export function jsonResponse(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json' }
	});
}

export function errorResponse(message: string, status = 400): Response {
	return jsonResponse({ error: message }, status);
}

export function getHttpStatusForError(err: unknown): number {
	if (err instanceof NotFoundError) return 404;
	if (err instanceof ValidationError) return 400;
	if (err instanceof AuthenticationError) return 401;
	if (err instanceof AuthorizationError) return 403;
	if (err instanceof ConflictError) return 409;
	if (err instanceof ApplicationError) return err.statusCode;
	return 500;
}

export function handleApplicationError(err: unknown, defaultMessage = 'Internal Server Error'): Response {
	if (err instanceof ApplicationError) {
		const status = getHttpStatusForError(err);
		return errorResponse(err.message, status);
	}
	const message = err instanceof Error ? err.message : defaultMessage;
	return errorResponse(message, 500);
}

export function handleActionError(err: unknown, defaultMessage = 'An error occurred', additionalData: Record<string, unknown> = {}) {
	if (err instanceof ApplicationError) {
		const status = getHttpStatusForError(err);
		return fail(status, { ...additionalData, success: false, error: err.message, message: err.message });
	}
	const message = err instanceof Error ? err.message : defaultMessage;
	return fail(500, { ...additionalData, success: false, error: message, message });
}
