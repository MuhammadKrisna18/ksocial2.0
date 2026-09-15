import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	if (locals.user.roles.includes('admin')) {
		throw redirect(302, '/admin');
	}

	throw redirect(302, '/user');
};
