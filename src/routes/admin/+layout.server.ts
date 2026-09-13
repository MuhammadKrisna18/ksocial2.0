import { redirect, error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}

	if (!locals.user.roles.includes('admin')) {
		error(403, 'Forbidden');
	}

	return { user: locals.user };
};
