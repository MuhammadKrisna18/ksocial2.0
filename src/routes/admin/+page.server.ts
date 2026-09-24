import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { ACCESS_TOKEN_COOKIE } from '$lib/presentation/utils/cookie';
import { dev } from '$app/environment';

import { container } from '$lib/infrastructure/config/container';

export const load: PageServerLoad = async ({ locals }) => {
	const stats = await container.getDashboardStatsUseCase.execute();
	
	return { 
		user: locals.user,
		dashboardStats: stats
	};
};

export const actions: Actions = {
	logout: async ({ cookies }) => {
		const token = cookies.get(ACCESS_TOKEN_COOKIE);
		if (token) {
			container.tokenRevocationService.revoke(token);
		}
		cookies.delete(ACCESS_TOKEN_COOKIE, { path: '/' });
		cookies.set(ACCESS_TOKEN_COOKIE, '', {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: !dev,
			maxAge: 0,
			expires: new Date(0)
		});
		throw redirect(302, '/login');
	}
};
