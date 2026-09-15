import type { RequestHandler } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { container } from '$lib/infrastructure/config/container';
import { jsonResponse, errorResponse, handleApplicationError } from '$lib/presentation/utils/response';
import { ACCESS_TOKEN_COOKIE, getAuthCookieOptions } from '$lib/presentation/utils/cookie';

export const POST: RequestHandler = async ({ request, cookies }) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return errorResponse('Invalid JSON body', 400);
	}

	const { email, username, password } = body as Record<string, unknown>;

	if (
		typeof email !== 'string' ||
		typeof username !== 'string' ||
		typeof password !== 'string' ||
		!email ||
		!username ||
		!password
	) {
		return errorResponse('Email, username, and password are required', 400);
	}

	const fullName = (body as any).fullName || username;
	const dateOfBirth = (body as any).dateOfBirth ? new Date((body as any).dateOfBirth) : new Date('2000-01-01');

	try {
		const result = await container.registerUseCase.execute({ email, username, password, fullName, dateOfBirth });
		cookies.set(ACCESS_TOKEN_COOKIE, result.accessToken, getAuthCookieOptions(!dev));
		return jsonResponse(result, 201);
	} catch (err) {
		return handleApplicationError(err, 'Registration failed');
	}
};
