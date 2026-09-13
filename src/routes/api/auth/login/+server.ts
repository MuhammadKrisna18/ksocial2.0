import type { RequestHandler } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { container } from '$lib/infrastructure/config/container';
import { jsonResponse, errorResponse } from '$lib/presentation/utils/response';
import { ACCESS_TOKEN_COOKIE, getAuthCookieOptions } from '$lib/presentation/utils/cookie';

export const POST: RequestHandler = async ({ request, cookies }) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return errorResponse('Invalid JSON body', 400);
	}

	const { email, password } = body as Record<string, unknown>;

	if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
		return errorResponse('Email and password are required', 400);
	}

	try {
		const result = await container.loginUseCase.execute({ email, password });
		cookies.set(ACCESS_TOKEN_COOKIE, result.accessToken, getAuthCookieOptions(!dev));
		return jsonResponse(result, 200);
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Login failed';
		return errorResponse(message, 401);
	}
};
