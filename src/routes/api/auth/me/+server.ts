import type { RequestHandler } from '@sveltejs/kit';
import { jsonResponse, errorResponse } from '$lib/presentation/utils/response';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return errorResponse('Unauthorized', 401);
	}
	return jsonResponse({ user: locals.user }, 200);
};
