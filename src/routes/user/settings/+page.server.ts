import { redirect } from '@sveltejs/kit';
import { container } from '$lib/infrastructure/config/container';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	// Any data loading for settings could go here.
	return {};
};
