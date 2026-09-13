import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}

	if (locals.user.roles.includes('admin')) {
		redirect(302, '/admin');
	}

	return { user: locals.user };
};
